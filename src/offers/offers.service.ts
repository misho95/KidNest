import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Offer } from 'src/models/offer.schema';
import { User } from 'src/models/user.schema';
import { OfferInputType } from './offer.types';

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(Offer.name) private OfferModel: Model<Offer>,
  ) {}

  //getOffers
  async getOffers() {
    return await this.OfferModel.find();
  }

  //addNewOffer
  async addNewOffer(input: OfferInputType) {
    const { discount, discountCode, offerAvatar, offerInfo, offerName } = input;

    const offerModel = new this.OfferModel();
    offerModel.discount = discount;
    offerModel.discountCode = discountCode;
    offerModel.offerAvatar = offerAvatar;
    offerModel.offerInfo = offerInfo;
    offerModel.offerName = offerName;

    await offerModel.save();

    return { message: 'success' };
  }

  //getOfferById
  async getOfferById(offerId: string) {
    return await this.OfferModel.findOne({ _id: offerId });
  }

  //getFavorites
  async getFavorite(userId: string) {
    const user = await this.UserModel.findOne({ _id: userId });
    if (!user || !user.favorites || user.favorites.length === 0) {
      return [];
    }

    const favoriteOffers = await this.OfferModel.find({
      _id: { $in: user.favorites },
    }).exec();

    return favoriteOffers;
  }

  //addToFavorites
  async addFavorite(userId: string, offerId: string) {
    return await this.UserModel.updateOne(
      { _id: userId },
      {
        $addToSet: {
          favorites: offerId,
        },
      },
    );
  }

  //clearFromFavorites
  async clearFavorite(userId: string, offerId: string) {
    return await this.UserModel.updateOne(
      { _id: userId },
      {
        $pull: {
          favorites: offerId,
        },
      },
    );
  }

  //searchOffers
  async searchOffers(value: string) {
    if (!value) {
      return [];
    }
    const regex = new RegExp(value, 'i');
    return await this.OfferModel.find({
      $or: [{ offerName: { $regex: regex } }, { offerInfo: { $regex: regex } }],
    });
  }
}
