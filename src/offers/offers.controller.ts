import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { AppRequest } from 'src/auth/auth.controller';
import { offerValidator } from './offer.validator';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('/api/offers')
export class OffersController {
  constructor(private readonly service: OffersService) {}

  //getAllOffers
  @Get('/')
  getOffers() {
    return this.service.getOffers();
  }

  //postOffers

  @Post('/')
  addNewOffer(@Body() input: offerValidator) {
    return this.service.addNewOffer(input);
  }

  //getOfferWithId
  @Get('offer/:offerId')
  getOfferById(@Param('offerId') offerId: string) {
    return this.service.getOfferById(offerId);
  }

  //getFavorites
  @Get('/favorite')
  getFavorite(@Req() req: AppRequest) {
    return this.service.getFavorite(req.userId);
  }

  //addOfferInFavorites
  @Put('/favorite/:offerId/add')
  addFavorite(@Req() req: AppRequest, @Param('offerId') offerId: string) {
    return this.service.addFavorite(req.userId, offerId);
  }

  //clearOfferFromFavorites
  @Put('/favorite/:offerId/clear')
  clearFavorite(@Req() req: AppRequest, @Param('offerId') offerId: string) {
    return this.service.clearFavorite(req.userId, offerId);
  }

  //search
  @Get('/search')
  searchOffers(@Query('value') value: string) {
    return this.service.searchOffers(value);
  }
}
