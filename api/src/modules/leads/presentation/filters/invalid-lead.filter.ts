import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { InvalidLeadError } from '../../domain/errors/invalid-lead.error';

@Catch(InvalidLeadError)
export class InvalidLeadFilter implements ExceptionFilter {
  catch(exception: InvalidLeadError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    response.status(400).json({
      statusCode: 400,
      message: exception.message,
    });
  }
}
