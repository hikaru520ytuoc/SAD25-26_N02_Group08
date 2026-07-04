import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { Readable } from 'stream';

@Injectable()
export class MinioService {
  private readonly client: Client;
  private readonly publicClient: Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('MINIO_BUCKET') ?? 'graduation-project-files';
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY') ?? 'minioadmin';
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY') ?? 'minioadmin123';
    const internalPort = Number(this.configService.get<string>('MINIO_PORT') ?? 9000);
    const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';

    this.client = new Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT') ?? 'minio',
      port: internalPort,
      useSSL,
      accessKey,
      secretKey,
    });

    this.publicClient = new Client({
      endPoint: this.configService.get<string>('MINIO_PUBLIC_ENDPOINT') ?? 'localhost',
      port: Number(this.configService.get<string>('MINIO_PUBLIC_PORT') ?? internalPort),
      useSSL: this.configService.get<string>('MINIO_PUBLIC_USE_SSL') === 'true',
      accessKey,
      secretKey,
    });
  }

  getBucket() {
    return this.bucket;
  }

  async ensureBucket() {
    const exists = await this.client.bucketExists(this.bucket).catch(() => false);
    if (!exists) await this.client.makeBucket(this.bucket, 'us-east-1');
  }

  async putObject(objectKey: string, buffer: Buffer, size: number, mimeType: string) {
    await this.ensureBucket();
    await this.client.putObject(this.bucket, objectKey, buffer, size, { 'Content-Type': mimeType });
  }

  async getObject(objectKey: string): Promise<Readable> {
    return this.client.getObject(this.bucket, objectKey);
  }

  async objectExists(objectKey: string) {
    try {
      await this.client.statObject(this.bucket, objectKey);
      return true;
    } catch {
      return false;
    }
  }

  async createPresignedGetUrl(objectKey: string, expiresInSeconds: number, responseHeaders: Record<string, string>) {
    return this.publicClient.presignedGetObject(this.bucket, objectKey, expiresInSeconds, responseHeaders);
  }

  async removeObject(objectKey: string) {
    await this.client.removeObject(this.bucket, objectKey);
  }
}
