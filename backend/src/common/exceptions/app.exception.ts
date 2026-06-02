import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(errorCode: string, message: string, statusCode: HttpStatus) {
    super(
      {
        errorCode,
        message,
      },
      statusCode,
    );
  }
}
