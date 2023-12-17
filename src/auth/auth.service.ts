import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/user.schema.email';
import {
  updateProfileInputType,
  userInputTypeEmail,
  userInputTypeMobile,
} from './auth.types';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

  async singUpWithEmail(input: userInputTypeEmail) {
    const { email, password, rePassword } = input;
    if (password !== rePassword) {
      throw new BadRequestException(['passwords not match!']);
    }

    const emailCheck = await this.UserModel.findOne({ email });

    if (emailCheck) {
      throw new BadRequestException(['email already used!']);
    }

    const userModel = new this.UserModel();
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

    const mobileCheck = await this.UserModel.findOne({ mobile });

    if (mobileCheck) {
      throw new BadRequestException(['mobile already used!']);
    }

    const userModel = new this.UserModel();
    userModel.mobile = mobile;
    userModel.password = password;

    await userModel.save();

    return { message: 'success!' };
  }

  async updateProfile(input: updateProfileInputType) {
    const { firstname, lastname, email, mobile, avatar } = input;

    const updateQuery: any = {};

    if (firstname) {
      updateQuery.firstname = firstname;
    }

    if (lastname) {
      updateQuery.lastname = lastname;
    }

    if (avatar) {
      updateQuery.avatar = avatar;
    }

    if (email) {
      const emailCheck = await this.UserModel.findOne({ email });
      if (emailCheck) {
        throw new BadRequestException(['email already used!']);
      }
      updateQuery.email = email;
    }

    if (mobile) {
      const mobileCheck = await this.UserModel.findOne({ mobile });
      if (mobileCheck) {
        throw new BadRequestException(['mobile already used!']);
      }
      updateQuery.mobile = mobile;
    }

    const user = await this.UserModel.findOne({
      _id: '657ef4454aa08f46ca5a00f3',
    });

    if (!user) {
      throw new BadRequestException(['user not found!']);
    }

    await this.UserModel.updateOne(
      {
        _id: user._id,
      },
      {
        $set: updateQuery,
      },
    );

    return { message: 'success' };
  }
}
