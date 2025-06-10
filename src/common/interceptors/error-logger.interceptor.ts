import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { IssuesService } from 'src/issues/issues.service';


@Injectable()
export class ErrorLoggerInterceptor implements NestInterceptor {
  constructor(private readonly issuesService: IssuesService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log("@interf")
    return next.handle().pipe(
      catchError(async (err) => {
        const request = context.switchToHttp().getRequest();
        const summary = `[${request.method}] ${request.url}`;
        const log = err.stack || JSON.stringify(err);

        await this.issuesService.logIssue(summary, log);

        return throwError(() => err);
      }),
    );
  }
}
