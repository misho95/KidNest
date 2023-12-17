import { Controller, Post, Body } from '@nestjs/common';
import {
  SignUpEmailValidator,
  SignUpMobileValidator,
} from './singup.validator';
import { AuthService } from './auth.service';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}
  @Post('/signup/email')
  signUpEmail(@Body() input: SignUpEmailValidator) {
    return this.service.singUpWithEmail(input);
  }
  @Post('/signup/mobile')
  signUpMobile(@Body() input: SignUpMobileValidator) {
    return this.service.singUpWithMobile(input);
  }
}
