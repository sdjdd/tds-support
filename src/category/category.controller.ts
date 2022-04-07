import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { AuthGuard, CurrentUser, Org } from '@/common';
import { Organization } from '@/organization';
import { User } from '@/user';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category-dto';
import { BatchUpdateCategoryDto } from './dtos/batch-update-category.dto';

@Controller('categories')
@UsePipes(ZodValidationPipe)
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  async find(@Org() org: Organization) {
    const catgories = await this.categoryService.find(org.id);
    return {
      catgories,
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

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Org() org: Organization,
    @CurrentUser() user: User,
    @Body() data: CreateCategoryDto,
  ) {
    if (!user.isAgent()) {
      throw new ForbiddenException();
    }
    const id = await this.categoryService.create(org.id, data);
    const category = await this.categoryService.findOne(org.id, id);
    return {
      category,
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Org() org: Organization,
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCategoryDto,
  ) {
    if (!user.isAgent()) {
      throw new ForbiddenException();
    }
    await this.categoryService.update(org.id, id, data);
    const category = await this.categoryService.findOne(org.id, id);
    return {
      category,
    };
  }

  @Post('batch-update')
  @UseGuards(AuthGuard)
  async batchUpdate(
    @Org() org: Organization,
    @CurrentUser() user: User,
    @Body() { categories: datas }: BatchUpdateCategoryDto,
  ) {
    if (!user.isAgent()) {
      throw new ForbiddenException();
    }
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
