import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy } from 'passport-http';
import { UserService } from '@/user';

@Injectable()
export class HttpBasicStrategy extends PassportStrategy(BasicStrategy) {
  constructor(private userService: UserService) {
    super({ passReqToCallback: true });
  }

  async validate(req: Request, username: string, password: string) {
    const organization = req.organization;
    if (!organization) {
      throw new Error(
        'no organization in request, please check middleware configuration',
      );
    }

    const user = await this.userService.findOneByUsernameAndSelectPassword(
      organization.id,
      username,
    );

    if (user && (await user.comparePassword(password))) {
      delete user.password;
      return user;
    }

    return false;
  }
}
