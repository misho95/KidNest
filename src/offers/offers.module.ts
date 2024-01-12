import { Module } from '@nestjs/common';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Offer, OfferSchema } from 'src/models/offer.schema';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/auth/auth.guard';
import { Favorite, FavoriteSchema } from 'src/models/favorite.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Offer.name, schema: OfferSchema },
      { name: Favorite.name, schema: FavoriteSchema },
    ]),
  ],
  controllers: [OffersController],
  providers: [
    OffersService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class OffersModule {}
