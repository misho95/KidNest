import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

interface customRequest extends Request {
  timeLeft: number;
  userId: string;
  userCookie: string;
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(@Inject(AuthService) private readonly service: AuthService) {}
  async use(req: customRequest, res: Response, next: NextFunction) {
    const accessToken = req.cookies['authToken'];
    if (accessToken) {
      req.userCookie = accessToken;
    }
    const refreshToken = req.cookies['refreshToken'];
    const isTokenValid = await this.service.verifyToken(accessToken);
    if (!isTokenValid) {
      const token = await this.service.refreshToken(refreshToken);
      res
        .cookie('authToken', token.access_token, {
          httpOnly: true,
          expires: new Date(new Date().getTime() + 10 * 1000),
        })
        .cookie('refreshToken', token.refresh_token, { httpOnly: true });
      console.log('token refreshed');
      req.userCookie = token.access_token;
    }

    next();
  }
}
