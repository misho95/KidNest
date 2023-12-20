import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OfferDocument = HydratedDocument<Offer>;

@Schema({
  timestamps: true,
})
export class Offer {
  @Prop({ required: true })
  offerAvatar: string;
  @Prop({ required: true })
  offerName: string;
  @Prop({ required: true })
  discount: number;
  @Prop({ required: true, unique: true })
  discountCode: string;
  @Prop({ required: true })
  offerInfo: string;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
