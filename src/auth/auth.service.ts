import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/user.schema';
import {
  resetPasswordInputType,
  resetRequestType,
  updatePasswordType,
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
    const { credentials, password, rePassword } = input;

    if (password !== rePassword) {
      throw new BadRequestException(['passwords do not match!']);
    }

    const credentialCheck = await this.UserModel.findOne({
      $or: [{ email: credentials }, { mobile: credentials }],
    });

    if (credentialCheck) {
      throw new BadRequestException(['this credentials are already used!']);
    }

    const checkCredentialType = (cred: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\+995[0-9]{9}$/;
      if (emailRegex.test(cred)) {
        return 'email';
      }

      if (phoneRegex.test(cred)) {
        return 'mobile';
      }

      return null;
    };

    const type = checkCredentialType(credentials);

    const salt = await bcrypt.genSalt();

    const userModel = new this.UserModel();
    if (type === 'email') {
      userModel.email = credentials;
    }
    if (type === 'mobile') {
      userModel.mobile = credentials;
    }
    userModel.password = hashSync(password, salt);

    await userModel.save();

    return { message: 'registration success!' };
  }
  //singin
  async singIn(input: userSingInInputType) {
    const { type, mobile, email, password } = input;

    if (type === 'email' && !email) {
      throw new BadRequestException(['email should not be empty']);
    }
    if (type === 'mobile' && !mobile) {
      throw new BadRequestException(['mobile should not be empty']);
    }

    const User = await this.UserModel.findOne({
      $or: [{ email }, { mobile: mobile }],
    });

    if (!User) {
      throw new BadRequestException(['credentials not found!']);
    }

    const isPasswordMatch = await bcrypt.compare(password, User.password);

    if (!isPasswordMatch) {
      throw new BadRequestException(['wrong password!']);
    }

    const payload = { sub: User._id, email: User.email };

    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
      }),

      refresh_token: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH,
        expiresIn: '1d',
      }),
    };
  }

  //refreshToken
  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('no token!');
    }

    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH,
    });

    const newPayload = { _id: payload._id, email: payload.email };

    return {
      access_token: await this.jwtService.signAsync(newPayload, {
        secret: process.env.JWT_SECRET,
      }),
      refresh_token: await this.jwtService.signAsync(newPayload, {
        secret: process.env.JWT_REFRESH,
        expiresIn: '1d',
      }),
    };
  }

  //getProfile

  async getProfile(userId: string) {
    if (!userId) {
      throw new BadRequestException(['no user id!']);
    }
    const user = await this.UserModel.findOne({ _id: userId })
      .select('-password -validationCode -__v')
      .exec();
    if (!user) {
      throw new BadRequestException(['no user found!']);
    }

    return user;
  }

  //getUserFavorites

  async getUserFavorites(userId: string) {
    return this.UserModel.findOne({ _id: userId }, { favorites: 1, _id: 0 });
  }

  //updateProfile
  async updateProfile(userId: string, input: updateProfileInputType) {
    const { firstname, lastname, email, mobile, avatar } = input;
    const User = await this.UserModel.findOne({ _id: userId });

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
      if (emailCheck && emailCheck.email !== User.email) {
        throw new BadRequestException(['email already used!']);
      }
      updateQuery.email = email;
    }

    if (mobile) {
      const mobileCheck = await this.UserModel.findOne({
        mobile: mobile,
      });

      if (mobileCheck && mobileCheck._id.toString() !== User._id.toString()) {
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

    return await this.UserModel.findOne({ _id: userId })
      .select('-password -validationCode -__v')
      .exec();
  }

  //updatePassword

  async updatePassword(userId: string, input: updatePasswordType) {
    const { oldPassword, password, rePassword } = input;

    const User = await this.UserModel.findOne({
      _id: userId,
    });

    if (!User) {
      throw new BadRequestException(['no user found']);
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, User.password);

    if (!isPasswordMatch) {
      throw new BadRequestException(['old password is wrong']);
    }

    const isNewPasswordSame = await bcrypt.compare(password, User.password);

    if (isNewPasswordSame) {
      throw new BadRequestException(['new password is same as old!']);
    }

    if (password !== rePassword) {
      throw new BadRequestException(['passwords do not match!']);
    }

    const salt = await bcrypt.genSalt();

    await this.UserModel.updateOne(
      { _id: User._id },
      {
        $set: {
          password: hashSync(password, salt),
        },
      },
    );

    return { message: 'updated successfull' };
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
      const User = await this.UserModel.findOne({
        mobile,
      });

      if (!User) {
        throw new BadRequestException(['mobile number not found']);
      }

      await this.UserModel.updateOne(
        {
          mobile,
        },
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

    if (type === 'email' && !email) {
      throw new BadRequestException(['email should not be empty']);
    }

    if (type === 'mobile' && !mobile) {
      throw new BadRequestException(['mobile should not be empty']);
    }

    if (password !== rePassword) {
      throw new BadRequestException(['passwords do not match']);
    }

    const User = await this.UserModel.findOne({
      $or: [{ email }, { mobile }],
    });

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
