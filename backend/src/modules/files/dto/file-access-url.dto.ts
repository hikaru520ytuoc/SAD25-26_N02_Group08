import { IsEnum } from 'class-validator';

export enum FileAccessMode {
  PREVIEW = 'preview',
  DOWNLOAD = 'download',
}

export class FileAccessUrlDto {
  @IsEnum(FileAccessMode)
  mode: FileAccessMode = FileAccessMode.PREVIEW;
}
