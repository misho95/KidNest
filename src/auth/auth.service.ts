import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/user.schema.email';
import {
  updateProfileInputType,
  userSingInInputType,
  userSingUpInputType,
} from './auth.types';
import * as bcrypt from 'bcrypt';
import { hashSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async singUp(input: userSingUpInputType) {
    const { email, password, rePassword } = input;
    if (password !== rePassword) {
      throw new BadRequestException(['passwords not match!']);
    }

    const emailCheck = await this.UserModel.findOne({ email });

    if (emailCheck) {
      throw new BadRequestException(['email already used!']);
    }

    const salt = await bcrypt.genSalt();

    const userModel = new this.UserModel();
    userModel.email = email;
    userModel.password = hashSync(password, salt);

    await userModel.save();

    return { message: 'success!' };
  }

  async singIn(input: userSingInInputType) {
    const { email, password } = input;
    const User = await this.UserModel.findOne({ email });
    if (!User) {
      throw new BadRequestException(['email not found!']);
    }
    const isPasswordMatch = await bcrypt.compare(password, User.password);

    if (!isPasswordMatch) {
      throw new BadRequestException(['wrong password!']);
    }

    const payload = { _id: User._id, email: User.email };

    return { access_token: await this.jwtService.signAsync(payload) };
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
