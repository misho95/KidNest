import {
  IsEmail,
  IsNotEmpty,
  IsMobilePhone,
  IsString,
  IsOptional,
} from 'class-validator';

export class SignUpValidator {
  @IsNotEmpty()
  type: 'email' | 'mobile';
  @IsNotEmpty()
  rePassword: string;
  @IsNotEmpty()
  password: string;
  @IsOptional()
  @IsEmail()
  email: string;
  @IsOptional()
  @IsMobilePhone('ka-GE')
  mobile: string;
}

export class SignInValidator {
  @IsNotEmpty()
  type: 'email' | 'mobile';
  @IsNotEmpty()
  password: string;
  @IsOptional()
  @IsEmail()
  email: string;
  @IsOptional()
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

export class updatePasswordValidator {
  @IsNotEmpty()
  oldPassword: string;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  rePassword: string;
}

export class resetRequestValidaor {
  @IsNotEmpty()
  type: 'email' | 'mobile';
  @IsOptional()
  @IsMobilePhone('ka-GE')
  mobile: string;
  @IsOptional()
  @IsEmail()
  email: string;
}

export class resetPasswordValidator {
  @IsNotEmpty()
  type: 'email' | 'mobile';
  @IsNotEmpty()
  rePassword: string;
  @IsNotEmpty()
  password: string;
  account: string;
  @IsOptional()
  @IsMobilePhone('ka-GE')
  mobile: string;
  @IsOptional()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  validationCode: string;
}
