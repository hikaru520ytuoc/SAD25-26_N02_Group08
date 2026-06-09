import { HttpStatus, Injectable } from '@nestjs/common';
import { FileDocumentType } from '@prisma/client';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { QueryFileDto } from './dto/query-file.dto';
import { MinioService } from './minio.service';

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
    if (!file) {
      throw new AppException('FILE_NOT_FOUND', 'Chưa có file upload', HttpStatus.BAD_REQUEST);
    }

    this.validateFile(file);

    const extension = extname(file.originalname).toLowerCase();
    const storedName = `${randomUUID()}${extension}`;
    const objectKey = `${actor.id}/${storedName}`;
    const bucket = this.minioService.getBucket();

    await this.minioService.putObject(objectKey, file.buffer, file.size, file.mimetype).catch(() => {
      throw new AppException('MINIO_UPLOAD_FAILED', 'Không thể upload file lên MinIO', HttpStatus.INTERNAL_SERVER_ERROR);
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

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'FILE_UPLOADED',
      targetType: 'FileDocument',
      targetId: document.id,
      result: 'SUCCESS',
    });

    return document;
  }

  async findMy(actor: AuthUser, query: QueryFileDto = {}) {
    return this.prisma.fileDocument.findMany({
      where: {
        ownerId: actor.id,
        deletedAt: null,
        fileType: query.fileType,
        relatedType: query.relatedType,
        relatedId: query.relatedId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMetadata(id: string, actor: AuthUser) {
    const file = await this.getFileOrThrow(id);
    await this.ensureCanAccess(file.id, actor);
    return file;
  }

  async getDownloadStream(id: string, actor: AuthUser) {
    const file = await this.getFileOrThrow(id);
    await this.ensureCanAccess(file.id, actor);
    const stream = await this.minioService.getObject(file.objectKey);
    return { file, stream };
  }

  async delete(id: string, actor: AuthUser) {
    const file = await this.getFileOrThrow(id);

    const canDelete = file.ownerId === actor.id || actor.roles.includes('ADMIN');
    if (!canDelete) {
      throw new AppException('FILE_ACCESS_DENIED', 'Bạn không có quyền xóa file này', HttpStatus.FORBIDDEN);
    }

    await this.minioService.removeObject(file.objectKey).catch(() => undefined);
    const updated = await this.prisma.fileDocument.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditLogsService.create({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'FILE_DELETED',
      targetType: 'FileDocument',
      targetId: id,
      result: 'SUCCESS',
    });

    return updated;
  }

  async ensureCanAccess(fileId: string, actor: AuthUser) {
    const file = await this.getFileOrThrow(fileId);
    if (file.ownerId === actor.id || file.uploadedById === actor.id || actor.roles.includes('ADMIN') || actor.roles.includes('FACULTY_MANAGER')) {
      return;
    }

    if (file.relatedType === 'OUTLINE_VERSION' && file.relatedId) {
      const version = await this.prisma.outlineVersion.findUnique({
        where: { id: file.relatedId },
        include: { outline: { include: { student: true, supervisor: true } } },
      });
      if (version && (version.outline.student.userId === actor.id || version.outline.supervisor.userId === actor.id)) return;
    }

    if (file.relatedType === 'PROJECT_PROGRESS' && file.relatedId) {
      const progress = await this.prisma.projectProgress.findUnique({
        where: { id: file.relatedId },
        include: { student: true, supervisor: true },
      });
      if (progress && (progress.student.userId === actor.id || progress.supervisor.userId === actor.id)) return;
    }

    throw new AppException('FILE_ACCESS_DENIED', 'Bạn không có quyền truy cập file này', HttpStatus.FORBIDDEN);
  }

  async markRelated(fileId: string | undefined, relatedType: string, relatedId: string) {
    if (!fileId) return null;
    return this.prisma.fileDocument.update({
      where: { id: fileId },
      data: { relatedType, relatedId },
    });
  }

  private async getFileOrThrow(id: string) {
    const file = await this.prisma.fileDocument.findUnique({ where: { id } });
    if (!file || file.deletedAt) {
      throw new AppException('FILE_NOT_FOUND', 'Không tìm thấy file', HttpStatus.NOT_FOUND);
    }
    return file;
  }

  private validateFile(file: { mimetype: string; size: number }) {
    const maxMb = Number(process.env.MAX_FILE_SIZE_MB ?? 20);
    const maxBytes = maxMb * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new AppException('FILE_UPLOAD_TOO_LARGE', `File vượt quá dung lượng ${maxMb}MB`, HttpStatus.PAYLOAD_TOO_LARGE);
    }

    const allowedTypes = (process.env.ALLOWED_FILE_TYPES ?? 'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/zip,application/x-zip-compressed')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (!allowedTypes.includes(file.mimetype)) {
      throw new AppException('FILE_UPLOAD_INVALID_TYPE', 'Định dạng file không được hỗ trợ', HttpStatus.BAD_REQUEST);
    }
  }
}
