import {
  Controller,
  Post,
  Body,
  Put,
  Get,
  Req,
  UseInterceptors,
  UploadedFile,
  Inject,
} from '@nestjs/common';
import {
  updateProfileValidator,
  SignUpValidator,
  SignInValidator,
  resetPasswordValidator,
  resetRequestValidaor,
  updatePasswordValidator,
} from './validators/validator';
import { AuthService } from './auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from './validators/upload.validator';
import { Public } from './public.decorator';

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
  refreshToken(@Req() request: Request) {
    const refreshToken = request.headers['authorization'];
    return this.service.refreshToken(refreshToken);
  }

  //profile
  @Get('/profile')
  getProfile(@Req() request: AppRequest) {
    return this.service.getProfile(request.userId);
  }

  //profile/favorites
  @Get('/profile/favorites')
  getUserFavorites(@Req() request: AppRequest) {
    return this.service.getUserFavorites(request.userId);
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
      url: `${image.destination}/${image.filename}.${type[1]}`,
    };
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
