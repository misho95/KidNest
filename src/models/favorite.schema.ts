import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FavoriteDocument = HydratedDocument<Favorite>;

@Schema({
  timestamps: true,
})
export class Favorite {
  @Prop({ require: true })
  userId: string;
  @Prop({ required: true })
  offerId: string;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
