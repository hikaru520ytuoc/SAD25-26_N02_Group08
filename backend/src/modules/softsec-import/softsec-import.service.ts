import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma, ResultPublicationStatus } from '@prisma/client';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../../common/types/auth-user.type';
import { ConfirmGradesDto, GradeImportKind, PreviewGradesDto } from './softsec-import.dto';

type GradeRow = {
  student_id: string; student_name: string; project_id: string;
  supervisor_score: number; reviewer_score: number; council_score: number;
};
type NativeResult =
  | { ok: true; count: number; records: GradeRow[] }
  | { ok: false; row: number; field: string; error: string };
type Mapping = { topicId: string; studentCode: string; registrationId: string; reviewerAssignmentId: string | null;
  studentId: string; periodId: string; supervisorId: string; reviewerId: string | null; hasExisting: boolean; locked: boolean; published: boolean; nameMatch: boolean; };
const MAX_BYTES = 512 * 101;

@Injectable()
export class SoftsecImportService {
  constructor(private readonly prisma: PrismaService) {}

  private secret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret === 'change-me-in-production') {
      throw new InternalServerErrorException('Cần cấu hình JWT_SECRET mạnh, không dùng giá trị demo mặc định cho chức năng import');
    }
    return secret;
  }
  private decode(data: string): Buffer {
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(data) || data.length % 4 !== 0) {
      throw new BadRequestException('csvBase64 không hợp lệ');
    }
    const buf = Buffer.from(data, 'base64');
    if (buf.length === 0 || buf.length > MAX_BYTES || buf.toString('base64') !== data) {
      throw new BadRequestException('CSV rỗng, không hợp lệ hoặc vượt giới hạn kích thước');
    }
    if (buf.includes(0)) throw new BadRequestException('CSV chứa ký tự NUL');
    return buf;
  }
  private validateMappings(raw?: Record<string, string>): Record<string, string> {
    if (!raw) return {};
    if (Object.keys(raw).length > 100) throw new BadRequestException('Quá nhiều mapping');
    const result: Record<string, string> = Object.create(null);
    for (const [key, id] of Object.entries(raw)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        throw new BadRequestException('Tên mapping không được dùng từ khóa đặc biệt');
      }
      if (!/^[A-Za-z0-9_-]{1,15}$/.test(key) || typeof id !== 'string' ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        throw new BadRequestException('Mapping cần có dạng mã đồ án ngắn -> UUID đề tài thực tế');
      }
      result[key] = id.toLowerCase();
    }
    return result;
  }
  private checkKind(kind: GradeImportKind, actor: AuthUser, forWrite: boolean) {
    if (forWrite && kind === GradeImportKind.COUNCIL) {
      throw new BadRequestException('Không thể commit council_score: một trường tổng hợp không thay thế điểm của từng thành viên hội đồng');
    }
    if (forWrite && !actor.roles.includes(kind)) {
      throw new ForbiddenException('Chỉ giảng viên có đúng vai trò mới xác nhận nhập đầu điểm tương ứng');
    }
  }
  private async native(buf: Buffer): Promise<GradeRow[]> {
    const bin = process.env.GRADE_PARSER_BIN || resolve(process.cwd(), 'softsec-bin/grade_parser');
    const result = await new Promise<{ status: number | null; stdout: string; stderr: string }>((done,fail) => {
      const child = spawn(bin, [], { stdio: ['pipe', 'pipe', 'pipe'], shell: false, env: { PATH: '/usr/bin:/bin', LC_ALL: 'C' } });
      let stdout = '', stderr = '', finished = false;
      const timer = setTimeout(() => child.kill('SIGKILL'), 3000);
      const failOnce = (error: Error) => { if (!finished) { finished=true; clearTimeout(timer); fail(error); } };
      child.on('error', failOnce);
      child.stdout.on('data', (c: Buffer) => { stdout += c.toString('utf8'); if (stdout.length > 140000) child.kill('SIGKILL'); });
      child.stderr.on('data', (c: Buffer) => { stderr += c.toString('utf8'); if (stderr.length > 2048) child.kill('SIGKILL'); });
      child.on('close', (status) => { if (!finished) { finished = true; clearTimeout(timer); done({ status, stdout, stderr }); } });
      child.stdin.on('error', () => {});
      child.stdin.end(buf);
    }).catch((err: Error) => { throw new InternalServerErrorException('Không chạy được C parser: '+err.message); });
    let parsed: NativeResult;
    try { parsed = JSON.parse(result.stdout) as NativeResult; }
    catch { throw new InternalServerErrorException('Native C parser trả kết quả không hợp lệ (timeout/crash/runtime error)'); }
    if (!parsed.ok) {
      throw new BadRequestException({ code: 'CSV_INVALID', row: parsed.row, field: parsed.field, reason: parsed.error });
    }
    if (result.status !== 0 || parsed.records.length !== parsed.count || parsed.count > 100) {
      throw new InternalServerErrorException('C parser không đáp ứng giao thức dữ liệu an toàn');
    }
    return parsed.records;
  }
  private canonical(mappings: Record<string, string>) {
    return JSON.stringify(Object.keys(mappings).sort().map(k => [k, mappings[k]]));
  }
  private createToken(actorId: string, kind: string, checksum: string, mappings: Record<string, string>) {
    const expires = Date.now() + 5 * 60 * 1000;
    const payload = [actorId, kind, checksum, createHash('sha256').update(this.canonical(mappings)).digest('hex'), String(expires)].join('\n');
    const tag = createHmac('sha256', this.secret()).update(payload).digest('hex');
    return Buffer.from(payload, 'utf8').toString('base64url')+'.'+tag;
  }
  private checkToken(token: string, actorId: string, kind: string, checksum: string, mappings: Record<string, string>) {
    const [body, digest] = token.split('.');
    if (!body || !digest || !/^[0-9a-f]{64}$/.test(digest) || body.length > 35000) throw new ForbiddenException('Preview token không hợp lệ');
    const payload = Buffer.from(body, 'base64url').toString('utf8');
    const parts = payload.split('\n');
    if (parts.length !== 5 || parts[0] !== actorId || parts[1] !== kind || parts[2] !== checksum ||
        parts[3] !== createHash('sha256').update(this.canonical(mappings)).digest('hex') || !/^\d+$/.test(parts[4]) || Date.now() > Number(parts[4])) {
      throw new ForbiddenException('Preview token hết hạn hoặc không khớp dữ liệu');
    }
    const expected = createHmac('sha256', this.secret()).update(payload).digest('hex');
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(digest))) throw new ForbiddenException('Preview token đã bị thay đổi');
  }
  private async mapRows(records: GradeRow[], kind: GradeImportKind, mappings: Record<string, string>): Promise<{
    items: Array<{ row: number; student_id: string; project_id: string; score: number; status: string; message: string; registrationId?: string; nameMatch?: boolean }>;
    resolved: Mapping[]; ready: boolean;
  }> {
    const resolved: Mapping[]=[];
    const items=[];
    let ready = kind !== GradeImportKind.COUNCIL;
    for (let i=0; i<records.length; i++) {
      const r=records[i];
      const topicId=mappings[r.project_id];
      const score=kind===GradeImportKind.SUPERVISOR?r.supervisor_score:kind===GradeImportKind.REVIEWER?r.reviewer_score:r.council_score;
      let status='READY', message='Đã xác định chính xác sinh viên và đề tài';
      let reg: any;
      if (!topicId) { status='NEEDS_TOPIC_MAPPING'; message=`Cần ánh xạ project_id ${r.project_id} tới Topic UUID hợp lệ`; }
      else {
        const regs=await this.prisma.defenseRegistration.findMany({
          where: { student: { studentCode: r.student_id }, topicRegistration: { topicId } },
          include: { student: { include: { user: true } }, topicRegistration: true, supervisorScore: true,
            reviewerAssignment: { include: { reviewerScore: true } }, finalResult: true },
        });
        if (regs.length !== 1) {status=regs.length?'AMBIGUOUS':'NOT_FOUND';message='Không xác định được duy nhất hồ sơ theo student_id và topic UUID';}
        else reg=regs[0];
      }
      if (reg) {
        const locked=!!(await this.prisma.projectRecordLock.findUnique({where:{studentId_projectPeriodId:{studentId:reg.studentId,projectPeriodId:reg.projectPeriodId}}}));
        const published=reg.finalResult?.publicationStatus===ResultPublicationStatus.PUBLISHED;
        const hasExisting=kind===GradeImportKind.SUPERVISOR?!!reg.supervisorScore:kind===GradeImportKind.REVIEWER?!!reg.reviewerAssignment?.reviewerScore:true;
        if (locked){ status='LOCKED';message='Hồ sơ đã khóa'; }
        else if(published){status='PUBLISHED';message='Kết quả đã công bố';}
        else if(r.student_name!==reg.student.user.fullName){status='STUDENT_NAME_MISMATCH';message='Tên sinh viên CSV không khớp hồ sơ trong DB';}
        else if(kind===GradeImportKind.REVIEWER&&!reg.reviewerAssignment){status='NO_REVIEWER';message='Chưa phân công giảng viên phản biện';}
        else if(hasExisting){status='ALREADY_SCORED';message='Điểm đã tồn tại; không tự ghi đè';}
        resolved.push({topicId,studentCode:r.student_id,registrationId:reg.id,reviewerAssignmentId:reg.reviewerAssignment?.id??null,
          studentId:reg.studentId,periodId:reg.projectPeriodId,supervisorId:reg.supervisorId,reviewerId:reg.reviewerAssignment?.reviewerId??null,
          hasExisting,locked,published,nameMatch:r.student_name===reg.student.user.fullName});
      }
      if(status!=='READY')ready=false;
      items.push({row:i+2,student_id:r.student_id,project_id:r.project_id,score,status,message,
        registrationId:reg?.id,nameMatch:reg? r.student_name===reg.student.user.fullName:undefined});
    }
    return {items,resolved,ready};
  }
  async preview(dto: PreviewGradesDto, actor: AuthUser) {
    this.checkKind(dto.kind,actor,false);
    const maps=this.validateMappings(dto.projectMappings);
    const bytes=this.decode(dto.csvBase64);
    const checksum=createHash('sha256').update(bytes).digest('hex');
    const rows=await this.native(bytes);
    const check=await this.mapRows(rows,dto.kind,maps);
    return { count:rows.length, checksum, kind:dto.kind, canConfirm:check.ready && actor.roles.includes(dto.kind) && dto.kind!==GradeImportKind.COUNCIL,
      councilPolicy:'READ_ONLY_PER_MEMBER_SCORES', rows:check.items,
      previewToken:check.ready && actor.roles.includes(dto.kind) && dto.kind!==GradeImportKind.COUNCIL?this.createToken(actor.id,dto.kind,checksum,maps):null };
  }
  async confirm(dto: ConfirmGradesDto, actor: AuthUser) {
    this.checkKind(dto.kind,actor,true);
    const maps=this.validateMappings(dto.projectMappings);
    const bytes=this.decode(dto.csvBase64);
    const checksum=createHash('sha256').update(bytes).digest('hex');
    this.checkToken(dto.previewToken,actor.id,dto.kind,checksum,maps);
    const rows=await this.native(bytes);
    const lecturer=await this.prisma.lecturer.findUnique({where:{userId:actor.id}});
    if(!lecturer)throw new ForbiddenException('Người nhập điểm không có hồ sơ giảng viên');
    const written = await this.prisma.$transaction(async tx=>{
      const inserts:string[]=[];
      for(const row of rows){
        const topicId=maps[row.project_id];
        if(!topicId)throw new BadRequestException('Thiếu mapping đề tài');
        const regs=await tx.defenseRegistration.findMany({where:{student:{studentCode:row.student_id},topicRegistration:{topicId}},
          include:{supervisorScore:true, reviewerAssignment:{include:{reviewerScore:true}}, finalResult:true,student:{include:{user:true}}}});
        if(regs.length!==1)throw new BadRequestException('Hồ sơ bảo vệ không tồn tại/không duy nhất');
        const r=regs[0];
        if(r.finalResult?.publicationStatus===ResultPublicationStatus.PUBLISHED)throw new ForbiddenException('Đã công bố kết quả');
        if(row.student_name!==r.student.user.fullName)throw new BadRequestException('Tên sinh viên CSV không khớp hồ sơ trong DB');
        const lock=await tx.projectRecordLock.findUnique({where:{studentId_projectPeriodId:{studentId:r.studentId,projectPeriodId:r.projectPeriodId}}});
        if(lock)throw new ForbiddenException('Hồ sơ đã khóa');
        let id:string;
        if(dto.kind===GradeImportKind.SUPERVISOR){
          if(r.supervisorId!==lecturer.id)throw new ForbiddenException('Chỉ GVHD được nhập điểm đúng sinh viên');
          if(r.supervisorScore)throw new BadRequestException('Điểm GVHD đã tồn tại');
          const score=await tx.supervisorScore.create({data:{defenseRegistrationId:r.id,supervisorId:lecturer.id,score:row.supervisor_score,comment:'Nhập từ CSV đã kiểm tra bởi C parser'}});
          id=score.id;
        }else{
          if(!r.reviewerAssignment || r.reviewerAssignment.reviewerId!==lecturer.id) throw new ForbiddenException('Chỉ GVPB đã phân công được nhập điểm');
          if(r.reviewerAssignment.reviewerScore)throw new BadRequestException('Điểm GVPB đã tồn tại');
          const score=await tx.reviewerScore.create({data:{reviewerAssignmentId:r.reviewerAssignment.id,reviewerId:lecturer.id,score:row.reviewer_score,comment:'Nhập từ CSV đã kiểm tra bởi C parser'}});
          id=score.id;
        }
        await tx.auditLog.create({data:{actorId:actor.id,actorEmail:actor.email,action:'SOFTSEC_CSV_'+dto.kind+'_IMPORTED',targetType:'Score',targetId:id,result:'SUCCESS'}});
        inserts.push(id);
      }
      return inserts;
    },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable,timeout:20000,maxWait:5000});
    return { imported:written.length, ids:written, kind:dto.kind, checksum, message:'Transaction toàn bộ thành công; không cập nhật điểm hội đồng' };
  }
}
