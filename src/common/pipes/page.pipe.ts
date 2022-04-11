import { PipeTransform } from '@nestjs/common';

export class ParsePagePipe implements PipeTransform {
  transform(value: string | undefined) {
    if (value !== undefined) {
      const page = parseInt(value);
      if (!Number.isNaN(page)) {
        return Math.max(page, 1);
      }
    }
    return 1;
  }
}

export class ParsePageSizePipe implements PipeTransform {
  constructor(private defaultPageSize = 10, private maxPageSize = 100) {}

  transform(value: string | undefined) {
    if (value !== undefined) {
      const pageSize = parseInt(value);
      if (!Number.isNaN(pageSize)) {
        return Math.min(Math.max(pageSize, 1), this.maxPageSize);
      }
    }
    return this.defaultPageSize;
  }
}
