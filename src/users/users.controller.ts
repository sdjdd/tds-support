import { Body, Controller, Post } from '@nestjs/common';
import { Org } from '@/common';
import { Organization } from '@/organizations';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  create(@Org() org: Organization, @Body() data: CreateUserDto) {
    return this.usersService.create(org.id, data);
  }
}
