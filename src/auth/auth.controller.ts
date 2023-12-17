import {
  Controller,
  Post,
  Body,
  Put,
  Get,
  UseGuards,
  Res,
} from '@nestjs/common';
import {
  updateProfileValidator,
  SignUpValidator,
  SignInValidator,
} from './validator';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

interface CustomResponse extends Response {
  cookie(name: string, value: any, options?: any): this;
}

const cookieOptions = {
  httpOnly: true,
  maxAge: 60 * 60,
  secure: true,
  sameSite: 'strict',
};

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('/signin')
  async signIn(
    @Body() input: SignInValidator,
    @Res({ passthrough: true }) response: CustomResponse,
  ) {
    const token = await this.service.singIn(input);
    if (token) {
      response.cookie('authToken', token.access_token, cookieOptions);
      return { message: 'success!' };
    }

    return token;
  }

  @Post('/signup')
  signUpEmail(@Body() input: SignUpValidator) {
    return this.service.singUp(input);
  }

  @UseGuards(AuthGuard)
  @Get('/profile')
  getProfile() {
    console.log('testing...');
  }

  @Put('/profile/update')
  updateProfile(@Body() input: updateProfileValidator) {
    return this.service.updateProfile(input);
  }
}
