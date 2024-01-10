import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
import { checkCredentialType } from './utils/shared.functions';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    private jwtService: JwtService,
  ) {}
  //singup
  async singUp(input: userSingUpInputType) {
    const { credentials, password } = input;

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
    const { credentials, password } = input;

    const User = await this.UserModel.findOne({
      $or: [{ email: credentials }, { mobile: credentials }],
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
      throw new UnauthorizedException();
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
    return await this.UserModel.findOne({ _id: userId })
      .select('-password -validationCode -__v')
      .exec();
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

    const isPasswordMatch = await bcrypt.compare(oldPassword, User.password);

    if (!isPasswordMatch) {
      throw new BadRequestException(['old password is wrong']);
    }

    const isNewPasswordSame = await bcrypt.compare(password, User.password);

    if (isNewPasswordSame) {
      throw new BadRequestException(['new password is same as old!']);
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
    const { credentials } = input;

    const generateRandomSixDigitNumber = () => {
      return Math.floor(100000 + Math.random() * 900000);
    };

    const validationToken = generateRandomSixDigitNumber();

    const User = await this.UserModel.findOne({
      $or: [{ email: credentials }, { mobile: credentials }],
    });

    if (!User) {
      throw new BadRequestException(['credentials not found']);
    }

    await this.UserModel.updateOne(
      { _id: User._id },
      {
        $set: {
          validationCode: validationToken,
        },
      },
    );

    //send code to email
    return { message: 'success', validationToken };
  }

  //resetPassword
  async resetPassword(input: resetPasswordInputType) {
    const { credentials, password, validationCode } = input;

    const User = await this.UserModel.findOne({
      $or: [{ email: credentials }, { mobile: credentials }],
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
