import { Injectable, PipeTransform } from '@nestjs/common';
import validator from 'validator';
import { parse, ParseFilterResult } from '@/common/utils/parse-filter-syntax';

export { ParseFilterResult };

const isIntOrNone = (value: string) => {
  return value === 'none' || validator.isInt(value);
};

@Injectable()
export class ParseFilterPipe implements PipeTransform {
  transform(value: string | undefined) {
    if (value) {
      return parse(value, {
        categoryId: validator.isInt,
        requesterId: validator.isInt,
        assigneeId: isIntOrNone,
        status: validator.isInt,
        createdAt: validator.isISO8601,
        updatedAt: validator.isISO8601,
      });
    }
    return {};
  }
}
