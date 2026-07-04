import { HttpStatus, Injectable } from '@nestjs/common';
import { FileDocumentType } from '@prisma/client';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { FileAccessMode } from './dto/file-access-url.dto';
import { QueryFileDto } from './dto/query-file.dto';
import { MinioService } from './minio.service';
import { canAccessFile } from './policies/file-access.policy';

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async upload(
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
    actor: AuthUser,
    input: { fileType?: FileDocumentType; relatedType?: string; relatedId?: string } = {},
  ) {
    if (!file) throw new AppException('FILE_NOT_FOUND', 'Chưa có file upload', HttpStatus.BAD_REQUEST);
    this.validateFile(file);

    const extension = extname(file.originalname).toLowerCase();
    const storedName = `${randomUUID()}${extension}`;
    const objectKey = `${actor.id}/${storedName}`;
    const bucket = this.minioService.getBucket();

    await this.minioService.putObject(objectKey, file.buffer, file.size, file.mimetype).catch(() => {
      throw new AppException('MINIO_UPLOAD_FAILED', 'Không thể upload file lên hệ thống lưu trữ', HttpStatus.INTERNAL_SERVER_ERROR);
    });

    const document = await this.prisma.fileDocument.create({
      data: {
        ownerId: actor.id,
        uploadedById: actor.id,
        originalName: file.originalname,
        storedName,
        bucket,
        objectKey,
        mimeType: file.mimetype,
        size: file.size,
        fileType: input.fileType ?? FileDocumentType.OTHER,
        relatedType: input.relatedType,
        relatedId: input.relatedId,
      },
    });

    await this.auditLogsService.create({ actorId: actor.id, actorEmail: actor.email, action: 'FILE_UPLOADED', targetType: 'FileDocument', targetId: document.id, result: 'SUCCESS' });
    return document;
  }

  async findMy(actor: AuthUser, query: QueryFileDto = {}) {
    return this.prisma.fileDocument.findMany({
      where: { ownerId: actor.id, deletedAt: null, fileType: query.fileType, relatedType: query.relatedType, relatedId: query.relatedId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMetadata(id: string, actor: AuthUser) {
    const file = await this.getFileOrThrow(id);
    await this.ensureCanAccess(file.id, actor);
    return file;
  }

  async createAccessUrl(id: string, actor: AuthUser, mode: FileAccessMode = FileAccessMode.PREVIEW) {
    const file = await this.getFileOrThrow(id);
    await this.ensureCanAccess(file.id, actor);
    if (!(await this.minioService.objectExists(file.objectKey))) {
      throw new AppException('FILE_OBJECT_NOT_FOUND', 'File không còn tồn tại trên hệ thống lưu trữ', HttpStatus.NOT_FOUND);
    }

    const expiresInSeconds = Math.min(300, Math.max(60, Number(process.env.FILE_SIGNED_URL_TTL_SECONDS ?? 180)));
    const safeFilename = file.originalName.replace(/[\r\n"]/g, '_');
    const disposition = mode === FileAccessMode.DOWNLOAD ? 'attachment' : this.canPreviewInline(file.mimeType) ? 'inline' : 'attachment';
    const url = await this.minioService.createPresignedGetUrl(file.objectKey, expiresInSeconds, {
      'response-content-type': file.mimeType,
      'response-content-disposition': `${disposition}; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(file.originalName)}`,
    }).catch(() => {
      throw new AppException('FILE_ACCESS_URL_FAILED', 'Không thể chuẩn bị liên kết truy cập file', HttpStatus.INTERNAL_SERVER_ERROR);
    });

    return { url, expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(), mode };
  }

  async getDownloadStream(id: string, actor: AuthUser) {
    const file = await this.getFileOrThrow(id);
    await this.ensureCanAccess(file.id, actor);
    if (!(await this.minioService.objectExists(file.objectKey))) throw new AppException('FILE_OBJECT_NOT_FOUND', 'File không còn tồn tại', HttpStatus.NOT_FOUND);
    return { file, stream: await this.minioService.getObject(file.objectKey) };
  }

  async delete(id: string, actor: AuthUser) {
    const file = await this.getFileOrThrow(id);
    const canDelete = file.ownerId === actor.id || actor.roles.includes('ADMIN');
    if (!canDelete) throw new AppException('FILE_ACCESS_DENIED', 'Bạn không có quyền xóa file này', HttpStatus.FORBIDDEN);

    await this.minioService.removeObject(file.objectKey).catch(() => undefined);
    const updated = await this.prisma.fileDocument.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.auditLogsService.create({ actorId: actor.id, actorEmail: actor.email, action: 'FILE_DELETED', targetType: 'FileDocument', targetId: id, result: 'SUCCESS' });
    return updated;
  }

  async ensureCanAccess(fileId: string, actor: AuthUser) {
    const file = await this.prisma.fileDocument.findUnique({
      where: { id: fileId },
      include: {
        outlineVersions: { include: { outline: { include: { student: true, supervisor: true } } } },
        projectProgressItems: { include: { student: true, supervisor: true } },
        defenseReportRegistrations: { include: { student: true, supervisor: true, reviewerAssignment: { include: { reviewer: true } }, defenseSchedule: { include: { council: { include: { members: true } } } } } },
        defenseSlideRegistrations: { include: { student: true, supervisor: true, reviewerAssignment: { include: { reviewer: true } }, defenseSchedule: { include: { council: { include: { members: true } } } } } },
        defenseAdditionalDocumentRegistrations: { include: { student: true, supervisor: true, reviewerAssignment: { include: { reviewer: true } }, defenseSchedule: { include: { council: { include: { members: true } } } } } },
        defenseDocumentReports: { include: { student: true, defenseSchedule: { include: { council: { include: { members: true } } } }, defenseRegistration: { include: { supervisor: true, reviewerAssignment: { include: { reviewer: true } } } } } },
        defenseDocumentSlides: { include: { student: true, defenseSchedule: { include: { council: { include: { members: true } } } }, defenseRegistration: { include: { supervisor: true, reviewerAssignment: { include: { reviewer: true } } } } } },
        defenseDocumentAdditional: { include: { student: true, defenseSchedule: { include: { council: { include: { members: true } } } }, defenseRegistration: { include: { supervisor: true, reviewerAssignment: { include: { reviewer: true } } } } } },
        revisionSubmissions: { include: { student: true, revisionRequest: { include: { defenseRegistration: { include: { supervisor: true, reviewerAssignment: { include: { reviewer: true } } } } } } } },
        archiveFinalReports: { include: { student: true, archiveStaff: true, defenseRegistration: { include: { supervisor: true, reviewerAssignment: { include: { reviewer: true } } } } } },
        archiveFinalSlides: { include: { student: true, archiveStaff: true, defenseRegistration: { include: { supervisor: true, reviewerAssignment: { include: { reviewer: true } } } } } },
        archiveSourceCodes: { include: { student: true, archiveStaff: true, defenseRegistration: { include: { supervisor: true, reviewerAssignment: { include: { reviewer: true } } } } } },
        archiveAdditionalDocuments: { include: { student: true, archiveStaff: true, defenseRegistration: { include: { supervisor: true, reviewerAssignment: { include: { reviewer: true } } } } } },
      },
    });
    if (!file || file.deletedAt) throw new AppException('FILE_NOT_FOUND', 'Không tìm thấy file', HttpStatus.NOT_FOUND);

    const linkedUserIds = new Set<string>();
    const add = (value?: string | null) => { if (value) linkedUserIds.add(value); };
    const addCouncil = (members?: Array<{ userId?: string | null }>) => members?.forEach((member) => add(member.userId));

    file.outlineVersions.forEach((item) => { add(item.outline.student.userId); add(item.outline.supervisor.userId); });
    file.projectProgressItems.forEach((item) => { add(item.student.userId); add(item.supervisor.userId); });

    const registrations = [
      ...file.defenseReportRegistrations,
      ...file.defenseSlideRegistrations,
      ...file.defenseAdditionalDocumentRegistrations,
    ];
    registrations.forEach((registration) => {
      add(registration.student.userId);
      add(registration.supervisor.userId);
      add(registration.reviewerAssignment?.reviewer.userId);
      addCouncil(registration.defenseSchedule?.council.members);
    });

    const defenseDocuments = [
      ...file.defenseDocumentReports,
      ...file.defenseDocumentSlides,
      ...file.defenseDocumentAdditional,
    ];
    defenseDocuments.forEach((document) => {
      add(document.student.userId);
      add(document.defenseRegistration.supervisor.userId);
      add(document.defenseRegistration.reviewerAssignment?.reviewer.userId);
      addCouncil(document.defenseSchedule.council.members);
    });

    file.revisionSubmissions.forEach((submission) => {
      add(submission.student.userId);
      add(submission.revisionRequest.defenseRegistration.supervisor.userId);
      add(submission.revisionRequest.defenseRegistration.reviewerAssignment?.reviewer.userId);
    });

    const archiveRecords = [
      ...file.archiveFinalReports,
      ...file.archiveFinalSlides,
      ...file.archiveSourceCodes,
      ...file.archiveAdditionalDocuments,
    ];
    archiveRecords.forEach((record) => {
      add(record.student.userId);
      add(record.archiveStaffId);
      add(record.defenseRegistration.supervisor.userId);
      add(record.defenseRegistration.reviewerAssignment?.reviewer.userId);
    });

    if (canAccessFile(actor, {
      ownerId: file.ownerId,
      uploadedById: file.uploadedById,
      linkedUserIds,
      isArchiveFile: archiveRecords.length > 0,
    })) return;

    throw new AppException('FILE_ACCESS_DENIED', 'Bạn không có quyền xem file này', HttpStatus.FORBIDDEN);
  }

  async markRelated(fileId: string | undefined, relatedType: string, relatedId: string) {
    if (!fileId) return null;
    return this.prisma.fileDocument.update({ where: { id: fileId }, data: { relatedType, relatedId } });
  }

  private async getFileOrThrow(id: string) {
    const file = await this.prisma.fileDocument.findUnique({ where: { id } });
    if (!file || file.deletedAt) throw new AppException('FILE_NOT_FOUND', 'Không tìm thấy file', HttpStatus.NOT_FOUND);
    return file;
  }

  private canPreviewInline(mimeType: string) {
    return mimeType === 'application/pdf' || mimeType.startsWith('image/') || mimeType.startsWith('text/');
  }

  private validateFile(file: { mimetype: string; size: number }) {
    const maxMb = Number(process.env.MAX_FILE_SIZE_MB ?? 20);
    if (file.size > maxMb * 1024 * 1024) throw new AppException('FILE_UPLOAD_TOO_LARGE', `File vượt quá dung lượng ${maxMb}MB`, HttpStatus.PAYLOAD_TOO_LARGE);

    const allowedTypes = (process.env.ALLOWED_FILE_TYPES ?? 'application/pdf,image/png,image/jpeg,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint,application/zip,application/x-zip-compressed')
      .split(',').map((item) => item.trim()).filter(Boolean);
    if (!allowedTypes.includes(file.mimetype)) throw new AppException('FILE_UPLOAD_INVALID_TYPE', 'Định dạng file không được hỗ trợ', HttpStatus.BAD_REQUEST);
  }
}
