import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileDocumentType } from '@prisma/client';
import { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { QueryFileDto } from './dto/query-file.dto';
import { FilesService } from './files.service';

@ApiTags('Files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file to MinIO and save metadata' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        fileType: { type: 'string', enum: Object.values(FileDocumentType) },
        relatedType: { type: 'string' },
        relatedId: { type: 'string' },
      },
    },
  })
  async upload(
    @UploadedFile() file: any,
    @Body('fileType') fileType: FileDocumentType,
    @Body('relatedType') relatedType: string,
    @Body('relatedId') relatedId: string,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.filesService.upload(file, actor, { fileType, relatedType, relatedId });
    return successResponse(data, 'Upload file thành công');
  }

  @Get()
  @ApiOperation({ summary: 'Get current user files' })
  async findMy(@Query() query: QueryFileDto, @CurrentUser() actor: AuthUser) {
    const data = await this.filesService.findMy(actor, query);
    return successResponse(data, 'Lấy danh sách file thành công');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file metadata' })
  async getMetadata(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    const data = await this.filesService.getMetadata(id, actor);
    return successResponse(data, 'Lấy metadata file thành công');
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download file after permission check' })
  async download(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() actor: AuthUser,
    @Res() res: Response,
  ) {
    const { file, stream } = await this.filesService.getDownloadStream(id, actor);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
    stream.pipe(res);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete file metadata and remove object if possible' })
  async delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    const data = await this.filesService.delete(id, actor);
    return successResponse(data, 'Xóa file thành công');
  }
}
