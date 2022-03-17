import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import { Connection, EntityManager, In, Repository } from 'typeorm';
import { BatchUpdateCategoryDto } from './dtos/batch-update-category.dto';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category-dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  @InjectConnection()
  private connection: Connection;

  @InjectRepository(Category)
  private categoriesRepository: Repository<Category>;

  find(organizationId: number): Promise<Category[]> {
    return this.categoriesRepository.find({ organizationId });
  }

  findByIds(organizationId: number, ids: number[]): Promise<Category[]> {
    return this.categoriesRepository.find({ organizationId, id: In(ids) });
  }

  findOne(organizationId: number, id: number): Promise<Category | undefined> {
    return this.categoriesRepository.findOne({ organizationId, id });
  }

  async findOneOrFail(organizationId: number, id: number): Promise<Category> {
    const category = await this.findOne(organizationId, id);
    if (!category) {
      throw new NotFoundException(`category ${id} does not exist`);
    }
    return category;
  }

  async create(
    organizationId: number,
    data: CreateCategoryDto,
  ): Promise<number> {
    const category = new Category();
    category.organizationId = organizationId;
    Object.assign(category, data);

    await this.connection.transaction(async (manager) => {
      if (category.parentId) {
        const parent = await manager.findOne(
          Category,
          {
            organizationId,
            id: category.parentId,
          },
          {
            lock: { mode: 'pessimistic_read' },
          },
        );
        if (!parent) {
          throw new NotFoundException('parent category does not exist');
        }
        if (!parent.active) {
          throw new UnprocessableEntityException('parent category is inactive');
        }
      }

      await manager.insert(Category, category);
    });

    return category.id;
  }

  async update(organizationId: number, id: number, data: UpdateCategoryDto) {
    if (_.isEmpty(data)) {
      return;
    }

    if (data.parentId === id) {
      throw new BadRequestException('invalid parentId');
    }

    await this.connection.transaction(async (manager) => {
      await this.updateByEntityManager(manager, organizationId, id, data);
    });
  }

  async batchUpdate(organizationId: number, datas: BatchUpdateCategoryDto[]) {
    if (datas.length === 0) {
      return;
    }

    await this.connection.transaction(async (manager) => {
      for (const data of datas) {
        try {
          await this.updateByEntityManager(
            manager,
            organizationId,
            data.id,
            data,
          );
        } catch (error) {
          throw new BadRequestException(
            `failed to update category ${data.id}: ${error.message}`,
          );
        }
      }
    });
  }

  private async updateByEntityManager(
    manager: EntityManager,
    organizationId: number,
    id: number,
    data: UpdateCategoryDto,
  ) {
    if (_.isEmpty(data)) {
      return;
    }

    if (data.parentId === id) {
      throw new BadRequestException('invalid parentId');
    }

    const category = await manager.findOne(Category, {
      relations: ['parent'],
      where: {
        organizationId,
        id,
      },
      lock: { mode: 'pessimistic_read' },
    });

    if (!category) {
      throw new NotFoundException(`category ${id} does not exist`);
    }

    if (data.active !== undefined && data.active !== category.active) {
      if (data.active) {
        if (category.parent?.active === false) {
          throw new BadRequestException('parent category is inactive');
        }
      } else {
        const activeChild = await manager.findOne(Category, {
          where: {
            organizationId,
            parentId: id,
          },
          lock: { mode: 'pessimistic_read' },
        });
        if (activeChild) {
          throw new BadRequestException('some subcategories still active');
        }
      }
    }

    await manager.update(Category, { organizationId, id }, data);
  }
}
