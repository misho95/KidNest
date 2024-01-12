import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Offer } from 'src/models/offer.schema';
import { User } from 'src/models/user.schema';
import { OfferInputType } from './offer.types';
import { Favorite } from 'src/models/favorite.schema';

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer.name) private OfferModel: Model<Offer>,
    @InjectModel(Favorite.name) private FavoriteModel: Model<Favorite>,
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
    return this.FavoriteModel.find({ userId });
  }

  //addToFavorites
  async addFavorite(userId: string, offerId: string) {
    const favoriteModel = new this.FavoriteModel();
    favoriteModel.userId = userId;
    favoriteModel.offerId = offerId;
    await favoriteModel.save();
  }

  //clearFromFavorites
  async clearFavorite(userId: string, offerId: string) {
    return this.FavoriteModel.deleteOne({ userId, offerId });
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
