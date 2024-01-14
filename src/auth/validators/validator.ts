import {
  IsEmail,
  IsNotEmpty,
  IsMobilePhone,
  IsString,
  IsOptional,
  Contains,
  IsStrongPassword,
} from 'class-validator';
import {
  IsEmailOrPhoneNumber,
  IsMatch,
  IsUserAlreadyExist,
  IsValidCredentialByType,
} from './custom.validators';

export class SignUpValidator {
  @IsEmailOrPhoneNumber()
  @IsUserAlreadyExist()
  @IsString()
  credentials: string;
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  password: string;
  @IsNotEmpty()
  @IsString()
  @IsMatch('password', {
    message: 'passwords do not match!',
  })
  rePassword: string;
}

export class SignInValidator {
  @IsEmailOrPhoneNumber()
  @IsString()
  credentials: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class updateProfileValidator {
  @IsNotEmpty()
  @IsString()
  firstname: string;
  @IsNotEmpty()
  @IsString()
  lastname: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @Contains('+995')
  @IsMobilePhone('ka-GE')
  mobile: string;
}

export class updatePasswordValidator {
  @IsNotEmpty()
  @IsString()
  oldPassword: string;
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  password: string;
  @IsNotEmpty()
  @IsString()
  rePassword: string;
}

export class resetRequestValidaor {
  @IsNotEmpty()
  type: 'email' | 'mobile';
  @IsValidCredentialByType('type')
  @IsString()
  credentials: string;
}

export class resetPasswordValidator {
  @IsNotEmpty()
  type: 'email' | 'mobile';
  @IsValidCredentialByType('type')
  @IsString()
  credentials: string;
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  password: string;
  @IsNotEmpty()
  @IsString()
  @IsMatch('password', {
    message: 'passwords do not match!',
  })
  rePassword: string;
  @IsNotEmpty()
  @IsString()
  validationCode: string;
}
