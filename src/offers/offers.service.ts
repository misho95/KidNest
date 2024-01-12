import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Offer } from 'src/models/offer.schema';
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
    try {
      return this.FavoriteModel.findOne(
        { userId },
        { favorites: 1, _id: 0 },
      ).exec();
    } catch (err) {
      return err;
    }
  }

  //addToFavorites
  async addFavorite(userId: string, offerId: string) {
    try {
      const findUserFavorites = await this.FavoriteModel.findOne({ userId });
      if (!findUserFavorites) {
        const favoriteModel = new this.FavoriteModel();
        favoriteModel.userId = userId;
        favoriteModel.favorites = [offerId];
        await favoriteModel.save();
        return { message: 'success' };
      }

      if (findUserFavorites) {
        await this.FavoriteModel.findOneAndUpdate(
          { userId },
          {
            $addToSet: { favorites: offerId },
          },
          { new: true },
        );

        return { message: 'success' };
      }
    } catch (err) {
      return err;
    }
  }

  //clearFromFavorites
  async clearFavorite(userId: string, offerId: string) {
    try {
      this.FavoriteModel.findOneAndUpdate(
        { userId },
        {
          $pull: { favorites: offerId },
        },
        {
          new: true,
        },
      );
      return { message: 'success' };
    } catch (err) {
      return err;
    }
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
