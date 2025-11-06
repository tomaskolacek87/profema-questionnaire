import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private logFilePath: string;

  constructor() {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    this.logFilePath = path.join(logsDir, 'profema.log');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, headers } = req;
    const userAgent = headers['user-agent'] || 'unknown';
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    // Log request
    this.logger.log(`➡️  ${method} ${url} - IP: ${ip}`);

    return next.handle().pipe(
      tap((data) => {
        const res = context.switchToHttp().getResponse();
        const { statusCode } = res;
        const responseTime = Date.now() - now;

        // Log response
        this.logger.log(`⬅️  ${method} ${url} ${statusCode} - ${responseTime}ms`);

        // Write to file
        this.writeToFile({
          timestamp: new Date().toISOString(),
          method,
          url,
          statusCode,
          responseTime,
          ip,
          userAgent,
          userId: req.user?.userId || 'anonymous',
        });
      }),
      catchError((error) => {
        const res = context.switchToHttp().getResponse();
        const statusCode = error.status || 500;
        const responseTime = Date.now() - now;

        // Log error
        this.logger.error(
          `❌ ${method} ${url} ${statusCode} - ${responseTime}ms - ${error.message}`,
        );

        // Write error to file
        this.writeToFile({
          timestamp: new Date().toISOString(),
          method,
          url,
          statusCode,
          responseTime,
          ip,
          userAgent,
          userId: req.user?.userId || 'anonymous',
          error: error.message,
          stack: error.stack,
        });

        return throwError(() => error);
      }),
    );
  }

  private writeToFile(logEntry: any) {
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(this.logFilePath, logLine);
  }
}
