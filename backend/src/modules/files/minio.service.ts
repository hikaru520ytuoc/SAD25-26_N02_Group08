import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { Readable } from 'stream';

@Injectable()
export class MinioService {
  private readonly client: Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('MINIO_BUCKET') ?? 'graduation-project-files';
    this.client = new Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT') ?? 'minio',
      port: Number(this.configService.get<string>('MINIO_PORT') ?? 9000),
      useSSL: false,
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY') ?? 'minioadmin',
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY') ?? 'minioadmin123',
    });
  }

  getBucket() {
    return this.bucket;
  }

  async ensureBucket() {
    const exists = await this.client.bucketExists(this.bucket).catch(() => false);
    if (!exists) {
      await this.client.makeBucket(this.bucket, 'us-east-1');
    }
  }

  async putObject(objectKey: string, buffer: Buffer, size: number, mimeType: string) {
    await this.ensureBucket();
    await this.client.putObject(this.bucket, objectKey, buffer, size, { 'Content-Type': mimeType });
  }

  async getObject(objectKey: string): Promise<Readable> {
    return this.client.getObject(this.bucket, objectKey);
  }

  async removeObject(objectKey: string) {
    await this.client.removeObject(this.bucket, objectKey);
  }
}
