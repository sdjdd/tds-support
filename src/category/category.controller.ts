import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { AgentGuard, AuthGuard, Org } from '@/common';
import { Organization } from '@/organization';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category-dto';
import { BatchUpdateCategoryDto } from './dtos/batch-update-category.dto';
import { AddUserDto } from './dtos/add-user.dto';

@Controller('categories')
@UsePipes(ZodValidationPipe)
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  async find(@Org() org: Organization) {
    const categories = await this.categoryService.find(org.id);
    return {
      categories,
    };
  }

  @Get(':id')
  async findOne(
    @Org() org: Organization,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const category = await this.categoryService.findOneOrFail(org.id, id);
    return {
      category,
    };
  }

  @Get(':id/users')
  @UseGuards(AuthGuard, AgentGuard)
  async findUsers(
    @Org() org: Organization,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const users = await this.categoryService.findUsers(org.id, id);
    return {
      users,
    };
  }

  @Post(':id/users')
  @UseGuards(AuthGuard, AgentGuard)
  async addUser(
    @Org() org: Organization,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: AddUserDto,
  ) {
    await this.categoryService.addUser(org.id, id, data.id);
  }

  @Delete(':id/users/:userId')
  @UseGuards(AuthGuard, AgentGuard)
  async removeUser(
    @Org() org: Organization,
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    await this.categoryService.removeUser(org.id, id, userId);
  }

  @Post()
  @UseGuards(AuthGuard, AgentGuard)
  async create(@Org() org: Organization, @Body() data: CreateCategoryDto) {
    const id = await this.categoryService.create(org.id, data);
    const category = await this.categoryService.findOne(org.id, id);
    return {
      category,
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AgentGuard)
  async update(
    @Org() org: Organization,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCategoryDto,
  ) {
    await this.categoryService.update(org.id, id, data);
    const category = await this.categoryService.findOne(org.id, id);
    return {
      category,
    };
  }

  @Post('batch-update')
  @UseGuards(AuthGuard, AgentGuard)
  async batchUpdate(
    @Org() org: Organization,
    @Body() { categories: datas }: BatchUpdateCategoryDto,
  ) {
    if (datas.length === 0) {
      return { categories: [] };
    }
    await this.categoryService.batchUpdate(org.id, datas);
    const ids = datas.map((data) => data.id);
    const categories = await this.categoryService.findByIds(org.id, ids);
    return {
      categories,
    };
  }
}
