import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { AuthGuard, CurrentUser, Org } from '@/common';
import { Organization } from '@/organizations';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import { FindUsersParams } from './dtos/find-users-params.dto';

@Controller('users')
@UsePipes(ZodValidationPipe)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async create(@Org() org: Organization, @Body() data: CreateUserDto) {
    const id = await this.usersService.create(org.id, data);
    const user = await this.usersService.findOne(org.id, id);
    return {
      user,
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Org() org: Organization,
    @CurrentUser() currentUser: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserDto,
  ) {
    if (!currentUser.isAdmin()) {
      if (currentUser.id !== id) {
        throw new ForbiddenException();
      }
      if (data.role) {
        throw new ForbiddenException();
      }
    }
    await this.usersService.update(org.id, id, data);
    const user = await this.usersService.findOne(org.id, id);
    return {
      user,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(
    @Org() org: Organization,
    @CurrentUser() currentUser: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (id !== currentUser.id) {
      if (!currentUser.isAgent()) {
        throw new ForbiddenException();
      }
    }
    return this.usersService.findOneOrFail(org.id, id);
  }

  @Get()
  @UseGuards(AuthGuard)
  async find(
    @Org() org: Organization,
    @CurrentUser() currentUser: User,
    @Query() params: FindUsersParams,
  ) {
    if (!currentUser.isAgent()) {
      throw new ForbiddenException();
    }
    const users = await this.usersService.find(org.id, params);
    return {
      users,
    };
  }
}
