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
} from '@nestjs/common';
import { AllowRole, AuthGuard, CurrentUser, Org, RoleGuard } from '@/common';
import { Organization } from '@/organizations';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import { PaginationDto } from './dtos/pagination.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  create(@Org() org: Organization, @Body() data: CreateUserDto) {
    return this.usersService.create(org.id, data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Org() org: Organization,
    @CurrentUser() currentUser: User,
    @Param('id') id: number,
    @Body() data: UpdateUserDto,
  ) {
    if (!currentUser.isAdmin() && (currentUser.id !== id || data.role)) {
      throw new ForbiddenException();
    }
    await this.usersService.update(org.id, id, data);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(
    @Org() org: Organization,
    @CurrentUser() currentUser: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (currentUser.id === id) {
      return currentUser;
    }
    if (!currentUser.isAdmin()) {
      throw new ForbiddenException();
    }
    return this.usersService.findOneOrFail(org.id, id);
  }

  @Get()
  @UseGuards(AuthGuard, RoleGuard)
  @AllowRole('agent')
  find(@Org() org: Organization, @Query() pagination: PaginationDto) {
    return this.usersService.find(org.id, pagination);
  }
}
