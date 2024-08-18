import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Schema } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: Schema) {}

  transform(value?: any) {
    const { error } = this.schema.validate(value);

    if (error) {
      throw new BadRequestException({
        error: 'Validation failed',
        message: error.message.replace(/(\"|\[|\d\])/g, ''),
      });
    }

    return value;
  }
}
