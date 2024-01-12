import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/user.schema';
import {
  cacheType,
  resetPasswordInputType,
  updatePasswordType,
  updateProfileInputType,
  userSingInInputType,
  userSingUpInputType,
} from './auth.types';
import * as bcrypt from 'bcrypt';
import { hashSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { checkCredentialType } from './utils/shared.functions';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    const userProfile = await this.UserModel.findOne({ _id: userId })
      .select('-password -validationCode -__v')
      .exec();
    await this.cacheManager.set('user-profile', userProfile);
    return userProfile;
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

    const updatedUser = await this.UserModel.findOne({ _id: userId })
      .select('-password -validationCode -__v')
      .exec();
    await this.cacheManager.set('user-profile', updatedUser);
    return updatedUser;
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

  async requestReset(type: 'email' | 'mobile', credentials: string) {
    //genetrate random verification code
    const generateRandomSixDigitNumber = () => {
      return Math.floor(100000 + Math.random() * 900000);
    };

    const validationToken = generateRandomSixDigitNumber().toString();
    //genetrate random verification code

    try {
      //find user data in mongo
      const foundUser = await this.UserModel.findOne({
        $or: [{ email: credentials }, { mobile: credentials }],
      });

      //return if no user found
      if (!foundUser) {
        throw new NotFoundException(['Credentials not found']);
      }

      //set new cached verification code with credentials to identify in reset
      await this.cacheManager.set(
        `${foundUser._id}-validation`,
        {
          cachedCredentials: credentials,
          cachedValidationToken: validationToken,
        },
        6000 * 5,
      );

      if (type === 'email') {
        //send verification link to email
      }

      if (type === 'mobile') {
        //send verification code to mobile
      }

      //this is for only mockup
      return { message: 'success', validationToken };
    } catch (error) {
      return error;
    }

    //send code to email
  }

  //resetPassword
  async resetPassword(input: resetPasswordInputType) {
    const { type, credentials, password, validationCode } = input;

    try {
      //find user data in mongo with credentials
      const User = await this.UserModel.findOne({
        $or: [{ email: credentials }, { mobile: credentials }],
      });
      //return if no user found
      if (!User) {
        throw new NotFoundException(['credentials not found']);
      }
      //get cached validation code
      const cachedData: cacheType = await this.cacheManager.get(
        `${User._id}-validation`,
      );

      //if cached validation code is not found send new verification code
      if (!cachedData) {
        //request new verify code
        return await this.requestReset(type, credentials);
      }

      //get cached data
      const { cachedCredentials, cachedValidationToken } = cachedData;
      //return if cached credentials are differet
      if (cachedCredentials !== credentials) {
        throw new BadRequestException(['wrong credentials!']);
      }

      //return if validation code is wrong
      if (cachedValidationToken !== validationCode) {
        throw new BadRequestException(['wrong validation code']);
      }

      //update new password if validations passed
      const salt = await bcrypt.genSalt();

      await this.UserModel.updateOne(
        { _id: User._id },
        {
          $set: {
            password: hashSync(password, salt),
          },
        },
      );

      //clear chached validation code
      await this.cacheManager.del(`${User._id}-validation`);
      return { message: 'success' };
    } catch (err) {
      return err.response;
    }
  }
}
