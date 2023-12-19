import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const cookies = request.cookies['authToken'];
    const token = cookies;
    try {
      const payload = this.jwt.verify(token);
      const userId = payload._id;
      request.userId = userId;
    } catch (error) {
      new UnauthorizedException();
      return false;
    }

    return true;
  }
}
