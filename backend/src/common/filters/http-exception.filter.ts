import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException ? exception.getResponse() : null;

    const message = this.getMessage(exceptionResponse, isHttpException);
    const errorCode = this.getErrorCode(statusCode, exceptionResponse);

    response.status(statusCode).json({
      success: false,
      statusCode,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getMessage(exceptionResponse: unknown, isHttpException: boolean): string {
    if (!isHttpException) {
      return 'Có lỗi hệ thống xảy ra, vui lòng thử lại sau';
    }

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const message = (exceptionResponse as { message: string | string[] }).message;
      return Array.isArray(message) ? message.join('; ') : message;
    }

    return 'Yêu cầu không hợp lệ';
  }

  private getErrorCode(statusCode: number, exceptionResponse: unknown): string {
    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'errorCode' in exceptionResponse
    ) {
      return String((exceptionResponse as { errorCode: string }).errorCode);
    }

    const mapping: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      413: 'PAYLOAD_TOO_LARGE',
      500: 'INTERNAL_ERROR',
    };

    return mapping[statusCode] ?? 'ERROR';
  }
}
