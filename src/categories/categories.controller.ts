import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CurrentUser, Org } from '@/common';
import { Organization } from '@/organizations';
import { User } from '@/users';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category-dto';
import { BatchUpdateCategoryDto } from './dtos/batch-update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  async find(@Org() org: Organization) {
    const catgories = await this.categoriesService.find(org.id);
    return {
      catgories,
    };
  }

  @Get(':id')
  async findOne(
    @Org() org: Organization,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const category = await this.categoriesService.findOneOrFail(org.id, id);
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
    const id = await this.categoriesService.create(org.id, data);
    const category = await this.categoriesService.findOne(org.id, id);
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
    await this.categoriesService.update(org.id, id, data);
    const category = await this.categoriesService.findOne(org.id, id);
    return {
      category,
    };
  }

  @Post('batch-update')
  @UseGuards(AuthGuard)
  async batchUpdate(
    @Org() org: Organization,
    @CurrentUser() user: User,
    @Body(new ParseArrayPipe({ items: BatchUpdateCategoryDto }))
    datas: BatchUpdateCategoryDto[],
  ) {
    if (datas.length === 0) {
      return { categories: [] };
    }
    await this.categoriesService.batchUpdate(org.id, datas);
    const ids = datas.map((data) => data.id);
    const categories = await this.categoriesService.findByIds(org.id, ids);
    return {
      categories,
    };
  }
}
