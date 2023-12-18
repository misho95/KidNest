import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/user.schema.email';
import {
  resetPasswordInputType,
  resetRequestType,
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
  //singup
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
  //singin
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

  //getProfile

  async getProfile(userId: string) {
    if (!userId) {
      throw new BadRequestException(['no user id!']);
    }
    const user = await this.UserModel.findOne({ _id: userId });
    if (!user) {
      throw new BadRequestException(['no user found!']);
    }

    return user;
  }

  //updateProfile
  async updateProfile(userId: string, input: updateProfileInputType) {
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
      _id: userId,
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

  //requestReset

  async requestReset(input: resetRequestType) {
    const { type, email, mobile } = input;
    if (type === 'email' && !email) {
      throw new BadRequestException(['email should not be empty']);
    }
    if (type === 'mobile' && !mobile) {
      throw new BadRequestException(['mobile should not be empty']);
    }

    const generateRandomSixDigitNumber = () => {
      return Math.floor(100000 + Math.random() * 900000);
    };

    const validationToken = generateRandomSixDigitNumber();

    if (type === 'email') {
      const User = await this.UserModel.findOne({ email });

      if (!User) {
        throw new BadRequestException(['email not found']);
      }

      await this.UserModel.updateOne(
        { email },
        {
          $set: {
            validationCode: validationToken,
          },
        },
      );

      //send code to email
      return { message: 'success', validationToken };
    }

    if (type === 'mobile') {
      const User = await this.UserModel.findOne({ mobile });

      if (!User) {
        throw new BadRequestException(['mobile number not found']);
      }

      await this.UserModel.updateOne(
        { mobile },
        {
          $set: {
            validationCode: validationToken,
          },
        },
      );

      //send code to mobile
      return { message: 'success', validationToken };
    }
  }

  //resetPassword
  async resetPassword(input: resetPasswordInputType) {
    const { email, mobile, password, rePassword, type, validationCode } = input;

    console.log(input);

    if (type === 'email' && !email) {
      throw new BadRequestException(['email should not be empty']);
    }

    if (type === 'mobile' && !mobile) {
      throw new BadRequestException(['mobile should not be empty']);
    }

    if (password !== rePassword) {
      throw new BadRequestException(['passwords do not match']);
    }

    const User = await this.UserModel.findOne({ $or: [{ email }, { mobile }] });

    if (User.validationCode !== validationCode) {
      throw new BadRequestException(['wrong validation code']);
    }

    const salt = await bcrypt.genSalt();

    await this.UserModel.updateOne(
      { _id: User._id },
      {
        $set: {
          password: hashSync(password, salt),
          validationCode: null,
        },
      },
    );

    return { message: 'success' };
  }
}
