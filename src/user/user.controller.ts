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
    return this.userService.findOneOrFail(org.id, id);
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
}
