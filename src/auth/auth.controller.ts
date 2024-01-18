import {
  Controller,
  Post,
  Body,
  Put,
  Get,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  updateProfileValidator,
  SignUpValidator,
  SignInValidator,
  resetPasswordValidator,
  resetRequestValidaor,
  updatePasswordValidator,
  updateAvatarValidator,
} from './validators/validator';
import { AuthService } from './auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from './validators/upload.validator';
import { Public } from './public.decorator';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import * as path from 'path';

export interface AppRequest extends Request {
  userId: string;
}

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  //signin
  @Public()
  @Post('/signin')
  async signIn(@Body() input: SignInValidator) {
    return await this.service.singIn(input);
  }

  //signup
  @Public()
  @Post('/signup')
  signUpEmail(@Body() input: SignUpValidator) {
    return this.service.singUp(input);
  }

  @Public()
  @Post('/refresh-token')
  refreshToken(@Body() body: { refreshToken: string }) {
    const { refreshToken } = body;
    return this.service.refreshToken(refreshToken);
  }

  //profile
  @UseInterceptors(CacheInterceptor)
  @CacheKey('user-profile')
  @CacheTTL(3600 * 24 * 7)
  @Get('/profile')
  getProfile(@Req() request: AppRequest) {
    return this.service.getProfile(request.userId);
  }

  //profileUpdate
  @Put('/profile/update')
  updateProfile(
    @Body() input: updateProfileValidator,
    @Req() request: AppRequest,
  ) {
    return this.service.updateProfile(request.userId, input);
  }

  //profileUpdatePassword
  @Put('/profile/updatepass')
  updatePass(
    @Body() input: updatePasswordValidator,
    @Req() request: AppRequest,
  ) {
    return this.service.updatePassword(request.userId, input);
  }

  //profileUploadImage
  @Post('/profile/upload')
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @UploadedFile(new FileSizeValidationPipe()) image: Express.Multer.File,
  ) {
    const type = image.mimetype.split('/');
    return {
      destination: image.destination,
      name: image.filename,
      type: type[1],
      url: `http://localhost:8181/${image.destination}/${image.filename}`,
    };
  }

  @Put('/profile/update/avatar')
  changeAvatar(@Body() input: updateAvatarValidator, @Req() req: AppRequest) {
    return this.service.updateAvatar(req.userId, input.url);
  }

  //requestPassowrdReset
  @Public()
  @Post('/request-reset')
  requestReset(@Body() input: resetRequestValidaor) {
    const { type, credentials } = input;
    return this.service.requestReset(type, credentials);
  }

  //resetPassword
  @Public()
  @Post('/resetpass')
  resetPassword(@Body() input: resetPasswordValidator) {
    return this.service.resetPassword(input);
  }
}
