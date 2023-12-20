import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { OffersService } from './offers.service';
import { AppRequest } from 'src/auth/auth.controller';

@UseGuards(AuthGuard)
@Controller('/api/offers')
export class OffersController {
  constructor(private readonly service: OffersService) {}
  @Get('/')
  getOffers() {
    return this.service.getOffers();
  }

  @Get('/:offerId')
  getOfferById(@Param('offerId') offerId: string) {
    return this.service.getOfferById(offerId);
  }

  @Get('/favorite')
  getFavorite(@Req() req: AppRequest) {
    this.service.getFavorite(req.userId);
  }

  @Put('/favorite/:offerId/add')
  addFavorite(@Req() req: AppRequest, @Param('offerId') offerId: string) {
    return this.service.addFavorite(req.userId, offerId);
  }

  @Put('/favorite/:offerId/clear')
  clearFavorite(@Req() req: AppRequest, @Param('offerId') offerId: string) {
    return this.service.clearFavorite(req.userId, offerId);
  }

  @Get('/search')
  searchOffers() {}
}
