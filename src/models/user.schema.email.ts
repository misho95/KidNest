import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ unique: true, sparse: true })
  email: string;
  @Prop({ unique: true, sparse: true })
  mobile: string;
  @Prop({ required: true })
  password: string;
  @Prop({ default: '' })
  firstname: string;
  @Prop({ default: '' })
  lastname: string;
  @Prop({ default: '' })
  avatar: string;
  @Prop({ default: null })
  validationCode: string;
  @Prop({ default: 1 })
  level: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
