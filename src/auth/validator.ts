import {
  IsEmail,
  IsNotEmpty,
  IsMobilePhone,
  IsString,
  IsOptional,
} from 'class-validator';

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

export class updateProfileValidator {
  @IsOptional()
  @IsString()
  firstname: string;
  @IsOptional()
  @IsString()
  lastname: string;
  @IsOptional()
  @IsEmail()
  email: string;
  @IsOptional()
  @IsMobilePhone('ka-GE')
  mobile: string;
  @IsOptional()
  @IsString()
  avatar: string;
}
