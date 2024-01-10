import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any) {
    const oneKb = 1000;
    if (value.size > oneKb * 500) {
      throw new BadRequestException(`File size exceeds the limit of 500kb`);
    }

    if (!value.mimetype.includes('image')) {
      throw new BadRequestException(`File size is not image`);
    }

    return value;
  }
}
