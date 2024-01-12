import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FavoriteDocument = HydratedDocument<Favorite>;

@Schema({
  timestamps: true,
})
export class Favorite {
  @Prop({ type: String, require: true, unique: true })
  userId: string;
  @Prop({ type: [String], default: [] })
  favorites: string[];
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
