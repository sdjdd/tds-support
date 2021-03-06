import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  forwardRef,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { AuthGuard, CurrentUser, Org } from '@/common';
import { Organization } from '@/organization';
import { TicketService } from '@/ticket';
import { FindTicketsDto } from '@/ticket/dtos/find-tickets.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import { FindUsersParams } from './dtos/find-users-params.dto';
import { ShowManyUserDto } from './dtos/show-many-user.dto';
import { LoginDto } from './dtos/login.dto';

@Controller('users')
@UsePipes(ZodValidationPipe)
export class UserController {
  @Inject(forwardRef(() => TicketService))
  private ticketService: TicketService;

  constructor(private userService: UserService) {}

  @Post()
  async create(@Org() org: Organization, @Body() data: CreateUserDto) {
    const id = await this.userService.create(org.id, data);
    const user = await this.userService.findOne(org.id, id);
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
    await this.userService.update(org.id, id, data);
    const user = await this.userService.findOne(org.id, id);
    return {
      user,
    };
  }

  @Get('search')
  @UseGuards(AuthGuard)
  async search(
    @Org() org: Organization,
    @CurrentUser() user: User,
    @Query('filter') filter: string | undefined,
  ) {
    if (!user.isAgent()) {
      throw new ForbiddenException();
    }
    if (!filter) {
      throw new BadRequestException('query.filter: Required');
    }
    const users = await this.userService.searchByUsername(org.id, filter);
    return {
      users,
    };
  }

  @Get('show-many')
  @UseGuards(AuthGuard)
  async showMany(
    @Org() org: Organization,
    @CurrentUser() user: User,
    @Query() { ids }: ShowManyUserDto,
  ) {
    if (!user.isAgent()) {
      throw new ForbiddenException();
    }
    const users = await this.userService.findByIds(org.id, ids);
    return {
      users,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(
    @Org() org: Organization,
    @CurrentUser() currentUser: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    if (id !== currentUser.id) {
      if (!currentUser.isAgent()) {
        throw new ForbiddenException();
      }
    }
    const user = await this.userService.findOneOrFail(org.id, id);
    return {
      user,
    };
  }

  @Get(':id/tickets/requested')
  @UseGuards(AuthGuard)
  async findRequestedTickets(
    @Org() org: Organization,
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Query() params: FindTicketsDto,
  ) {
    if (id !== user.id) {
      if (!user.isAgent()) {
        throw new ForbiddenException();
      }
      await this.userService.findOneOrFail(org.id, id);
    }
    const tickets = await this.ticketService.find(org.id, {
      ...(params as any),
      requesterId: id,
    });
    return {
      tickets,
    };
  }

  @Get(':id/tickets/assigned')
  @UseGuards(AuthGuard)
  async findAssignedTickets(
    @Org() org: Organization,
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Query() params: FindTicketsDto,
  ) {
    if (!user.isAgent()) {
      throw new ForbiddenException();
    }
    if (id !== user.id) {
      await this.userService.findOneOrFail(org.id, id);
    }
    const tickets = await this.ticketService.find(org.id, {
      ...(params as any),
      assigneeId: id,
    });
    return {
      tickets,
    };
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
    const users = await this.userService.find(org.id, params);
    return {
      users,
    };
  }

  // TODO: finish this with session module
  @Post('login')
  async login(
    @Org() org: Organization,
    @Body() { username, password }: LoginDto,
  ) {
    const user = await this.userService.findOneByUsernameAndSelectPassword(
      org.id,
      username,
    );
    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedException('username and password mismatch');
    }
    return { user };
  }
}
