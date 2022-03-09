import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser, Org } from '@/common';
import { Organization } from '@/organizations';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  create(@Org() org: Organization, @Body() data: CreateUserDto) {
    return this.usersService.create(org.id, data);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  findMySelf(@CurrentUser() currentUser: User) {
    return currentUser;
  }
}
