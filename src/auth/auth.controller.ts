import {
  Controller,
  Post,
  Body,
  Put,
  Get,
  UseGuards,
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
} from './validator';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from './upload.validator';

export interface AppRequest extends Request {
  userId: string;
}

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  //signin
  @Post('/signin')
  async signIn(@Body() input: SignInValidator) {
    return await this.service.singIn(input);
  }

  //signup
  @Post('/signup')
  signUpEmail(@Body() input: SignUpValidator) {
    return this.service.singUp(input);
  }

  @Post('/refresh-token')
  refreshToken(@Req() request: Request) {
    const refreshToken = request.headers['authorization'];
    return this.service.refreshToken(refreshToken);
  }

  //profile
  @UseGuards(AuthGuard)
  @Get('/profile')
  getProfile(@Req() request: AppRequest) {
    return this.service.getProfile(request.userId);
  }

  //profile/favorites
  @UseGuards(AuthGuard)
  @Get('/profile/favorites')
  getUserFavorites(@Req() request: AppRequest) {
    return this.service.getUserFavorites(request.userId);
  }

  //profileUpdate
  @UseGuards(AuthGuard)
  @Put('/profile/update')
  updateProfile(
    @Body() input: updateProfileValidator,
    @Req() request: AppRequest,
  ) {
    return this.service.updateProfile(request.userId, input);
  }

  //profileUpdatePassword
  @UseGuards(AuthGuard)
  @Put('/profile/updatepass')
  updatePass(
    @Body() input: updatePasswordValidator,
    @Req() request: AppRequest,
  ) {
    return this.service.updatePassword(request.userId, input);
  }

  //profileUploadImage
  @UseGuards(AuthGuard)
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
      url: `${image.destination}/${image.filename}.${type[1]}`,
    };
  }

  //requestPassowrdReset
  @Post('/request-reset')
  requestReset(@Body() input: resetRequestValidaor) {
    return this.service.requestReset(input);
  }

  //resetPassword
  @Post('/resetpass')
  resetPassword(@Body() input: resetPasswordValidator) {
    return this.service.resetPassword(input);
  }
}
