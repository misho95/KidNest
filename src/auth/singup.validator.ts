import { IsEmail, IsNotEmpty, IsMobilePhone } from 'class-validator';

export class SignUpEmailValidator {
  @IsNotEmpty()
  rePassword: string;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class SignUpMobileValidator {
  @IsNotEmpty()
  rePassword: string;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  @IsMobilePhone('ka-GE')
  mobile: string;
}
