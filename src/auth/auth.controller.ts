import { Controller, Post, Body, Put } from '@nestjs/common';
import {
  SignUpEmailValidator,
  SignUpMobileValidator,
  updateProfileValidator,
} from './validator';
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
  @Put('/profile/update')
  updateProfile(@Body() input: updateProfileValidator) {
    return this.service.updateProfile(input);
  }
}
