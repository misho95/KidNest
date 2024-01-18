import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isEmail,
  isMobilePhone,
  contains,
  ValidatorConstraintInterface,
  ValidatorConstraint,
} from 'class-validator';
import { User } from 'src/models/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

export function IsEmailOrPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isEmailOrPhoneNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return (
            isEmail(value) ||
            (isMobilePhone(value, 'ka-GE') && contains(value, '+995'))
          );
        },
        defaultMessage() {
          return 'wrong credentials!';
        },
      },
    });
  };
}

export function IsMatch(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
      },
    });
  };
}

export function IsValidCredentialByType(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          if (relatedValue === 'email') {
            return isEmail(value);
          }
          if (relatedValue === 'mobile') {
            return isMobilePhone(value, 'ka-GE') && contains(value, '+995');
          }
          return false;
        },

        defaultMessage(args: any): string {
          const type = args.object.type;

          if (type === 'email') {
            return 'Invalid email address.';
          }

          if (type === 'mobile') {
            return 'Invalid mobile phone number.';
          }

          return 'Wrong Credentials!';
        },
      },
    });
  };
}

@ValidatorConstraint({ async: true })
export class IsUserAlreadyExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<User>,
  ) {}
  async validate(credentials: any, args: ValidationArguments) {
    return this.UserModel.findOne({
      $or: [{ email: credentials }, { mobile: credentials }],
    }).then((user) => {
      if (user) return false;
      return true;
    });
  }
  defaultMessage(): string {
    return `this credentials is already used!`;
  }
}
