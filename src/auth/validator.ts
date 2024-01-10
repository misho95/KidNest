import {
  IsEmail,
  IsNotEmpty,
  IsMobilePhone,
  IsString,
  IsOptional,
  Contains,
} from 'class-validator';
import { IsEmailOrPhoneNumber, IsMatch } from './custom.validators';
import { isEqualType } from 'graphql';

export class SignUpValidator {
  @IsEmailOrPhoneNumber({
    message: 'please use valid credentials!',
  })
  credentials: string;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  @IsMatch('password', {
    message: 'passwords do not match!',
  })
  rePassword: string;
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
  @Contains('+995')
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
  @Contains('+995')
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
  @Contains('+995')
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
  @Contains('+995')
  @IsMobilePhone('ka-GE')
  mobile: string;
  @IsOptional()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  validationCode: string;
}
