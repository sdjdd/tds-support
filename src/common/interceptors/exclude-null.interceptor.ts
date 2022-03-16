import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import _ from 'lodash';

function omitNull(data: any) {
  if (Array.isArray(data)) {
    return data.map(omitNull);
  }
  if (_.isPlainObject(data)) {
    return _.mapValues(_.omitBy(data, _.isNull), omitNull);
  }
  return data;
}

@Injectable()
export class ExcludeNullInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map(omitNull));
  }
}
