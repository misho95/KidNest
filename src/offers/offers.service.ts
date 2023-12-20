import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Offer } from 'src/models/offer.schema';
import { User } from 'src/models/user.schema';

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(Offer.name) private OfferModel: Model<Offer>,
  ) {}
  async getOffers() {
    return await this.OfferModel.find();
  }

  async getOfferById(offerId: string) {
    return await this.OfferModel.findOne({ _id: offerId });
  }

  async getFavorite(userId: string) {
    const user = await this.UserModel.findOne({ _id: userId });
    if (!user || !user.favorites || user.favorites.length === 0) {
      return [];
    }

    const favoriteOffers = await this.OfferModel.find({
      _id: { $in: user.favorites },
    });

    // .toArray()

    return favoriteOffers;
  }

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
}
