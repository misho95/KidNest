import { IsNotEmpty } from 'class-validator';

export class offerValidator {
  @IsNotEmpty()
  offerAvatar: string;
  @IsNotEmpty()
  discount: number;
  @IsNotEmpty()
  discountCode: number;
  @IsNotEmpty()
  offerInfo: string;
  @IsNotEmpty()
  offerName: string;
}
