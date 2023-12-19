import {
  Controller,
  Post,
  Body,
  Put,
  Get,
  UseGuards,
  Res,
  Req,
  Query,
} from '@nestjs/common';
import {
  updateProfileValidator,
  SignUpValidator,
  SignInValidator,
  resetPasswordValidator,
  resetRequestValidaor,
  updatePasswordValidator,
} from './validator';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Throttle } from '@nestjs/throttler';
import { cookieOptionsRefreshToken, cookieOptionsToken } from './options';

interface AppRequest extends Request {
  userId: string;
}

interface CustomResponse extends Response {
  cookie(name: string, value: any, options?: any): this;
}

interface CookiesRespons extends Response {
  cookies: any;
}

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
      response.cookie('authToken', token.access_token, cookieOptionsToken);
      response.cookie(
        'refreshToken',
        token.refresh_token,
        cookieOptionsRefreshToken,
      );
      return { message: 'auth success!' };
    }

    return token;
  }

  @Throttle({ default: { limit: 3, ttl: 60000 * 5 } })
  @Post('/refresh')
  async refreshToken(
    @Req() request: CookiesRespons,
    @Res({ passthrough: true }) response: CustomResponse,
  ) {
    const accessToken = request.cookies['authToken'];
    const refreshToken = request.cookies['refreshToken'];
    const token = await this.service.refreshToken(refreshToken, accessToken);
    if (token) {
      response.cookie('authToken', token.access_token, cookieOptionsToken);
      response.cookie(
        'refreshToken',
        token.refresh_token,
        cookieOptionsRefreshToken,
      );
      return { message: 'token refresh success!' };
    }

    return token;
  }

  @Post('/signup')
  signUpEmail(@Body() input: SignUpValidator) {
    return this.service.singUp(input);
  }

  @UseGuards(AuthGuard)
  @Get('/profile')
  getProfile(@Req() request: AppRequest) {
    return this.service.getProfile(request.userId);
  }

  @UseGuards(AuthGuard)
  @Put('/profile/update')
  updateProfile(
    @Body() input: updateProfileValidator,
    @Req() request: AppRequest,
  ) {
    return this.service.updateProfile(request.userId, input);
  }

  @UseGuards(AuthGuard)
  @Put('/profile/updatepass')
  updatePass(
    @Body() input: updatePasswordValidator,
    @Req() request: AppRequest,
  ) {
    return this.service.updatePassword(request.userId, input);
  }

  @Post('/request-reset')
  requestReset(@Body() input: resetRequestValidaor) {
    return this.service.requestReset(input);
  }

  @Post('/resetpass')
  resetPassword(@Body() input: resetPasswordValidator) {
    return this.service.resetPassword(input);
  }
}
