import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/user.schema.email';
import { userInputTypeEmail, userInputTypeMobile } from './auth.types';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private UserModelEmail: Model<User>) {}

  async singUpWithEmail(input: userInputTypeEmail) {
    const { email, password, rePassword } = input;
    if (password !== rePassword) {
      throw new BadRequestException(['passwords not match!']);
    }

    const emailCheck = await this.UserModelEmail.findOne({ email });

    if (emailCheck) {
      throw new BadRequestException(['email already used!']);
    }

    const userModel = new this.UserModelEmail();
    userModel.email = email;
    userModel.password = password;

    await userModel.save();

    return { message: 'success!' };
  }

  async singUpWithMobile(input: userInputTypeMobile) {
    const { mobile, password, rePassword } = input;
    if (password !== rePassword) {
      throw new BadRequestException(['passwords not match!']);
    }

    const mobileCheck = await this.UserModelEmail.findOne({ mobile });

    if (mobileCheck) {
      throw new BadRequestException(['mobile already used!']);
    }

    const userModel = new this.UserModelEmail();
    userModel.mobile = mobile;
    userModel.password = password;

    await userModel.save();

    return { message: 'success!' };
  }
}
