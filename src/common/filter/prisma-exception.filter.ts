import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    switch (exception.code) {
      case 'P2025':
        return response.status(HttpStatus.NOT_FOUND).json({
          statusCode: 404,
          message: 'Record not found',
        });

      case 'P2002':
        return response.status(HttpStatus.CONFLICT).json({
          statusCode: 409,
          message: `Duplicate entry on ${exception.meta?.target}`,
        });

      case 'P2003':
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: 400,
          message: 'Invalid reference (foreign key constraint failed)',
        });

      default:
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: 500,
          message: 'Internal server error',
        });
    }
  }
}