import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

export class ParseOrderByPipe implements PipeTransform {
  private avaliableKeys: string[];

  constructor(keys: string[], private defaultKey: string) {
    this.avaliableKeys = [...keys, ...keys.map((key) => '-' + key)];
  }

  transform(value: string | undefined, metadata: ArgumentMetadata) {
    if (!value) {
      return [this.defaultKey, 'ASC'];
    }
    if (!this.avaliableKeys.includes(value)) {
      throw new BadRequestException(
        `${metadata.data}: Invalid value. Expected ${this.avaliableKeys.join(
          ' | ',
        )}`,
      );
    }
    if (value.startsWith('-')) {
      return [value.slice(1), 'DESC'];
    }
    return [value, 'ASC'];
  }
}
