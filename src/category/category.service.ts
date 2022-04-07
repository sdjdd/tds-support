import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, EntityManager, In, Repository } from 'typeorm';
import _ from 'lodash';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category-dto';
import { Category } from './entities/category.entity';
import { BatchUpdateCategoryDto } from './dtos/batch-update-category.dto';

@Injectable()
export class CategoryService {
  @InjectConnection()
  private connection: Connection;

  @InjectRepository(Category)
  private categoryRepository: Repository<Category>;

  find(orgId: number): Promise<Category[]> {
    return this.categoryRepository.find({ orgId });
  }

  findByIds(orgId: number, ids: number[]): Promise<Category[]> {
    return this.categoryRepository.find({ orgId, id: In(ids) });
  }

  findOne(orgId: number, id: number): Promise<Category | undefined> {
    return this.categoryRepository.findOne({ orgId, id });
  }

  async findOneOrFail(orgId: number, id: number): Promise<Category> {
    const category = await this.findOne(orgId, id);
    if (!category) {
      throw new NotFoundException(`category ${id} does not exist`);
    }
    return category;
  }

  async create(orgId: number, data: CreateCategoryDto): Promise<number> {
    const category = new Category();
    category.orgId = orgId;
    Object.assign(category, data);

    await this.connection.transaction(async (manager) => {
      if (category.parentId) {
        const parent = await manager.findOne(Category, {
          where: {
            orgId,
            id: category.parentId,
          },
          lock: { mode: 'pessimistic_read' },
        });
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

  async update(orgId: number, id: number, data: UpdateCategoryDto) {
    await this.connection.transaction((manager) =>
      this.updateByEntityManager(manager, orgId, id, data),
    );
  }

  async batchUpdate(
    orgId: number,
    datas: BatchUpdateCategoryDto['categories'],
  ) {
    if (datas.length === 0) {
      return;
    }

    await this.connection.transaction(async (manager) => {
      for (const data of datas) {
        try {
          await this.updateByEntityManager(manager, orgId, data.id, data);
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
    orgId: number,
    id: number,
    data: UpdateCategoryDto,
  ) {
    if (_.isEmpty(data)) {
      return;
    }
    if (data.parentId === id) {
      throw new BadRequestException('cannot set parentId to self');
    }

    const findOne = (id: number) =>
      manager.findOne(Category, {
        where: { orgId, id },
        lock: { mode: 'pessimistic_read' },
      });

    const category = await findOne(id);
    if (!category) {
      throw new NotFoundException(`category ${id} does not exist`);
    }

    if (data.parentId !== null) {
      const parentId = data.parentId ?? category.parentId;
      if (parentId) {
        const parent = await findOne(parentId);
        if (!parent) {
          throw new UnprocessableEntityException(
            'parent category does not exist',
          );
        }
        if (!parent.active && (data.active ?? category.active)) {
          throw new BadRequestException(
            'cannot make active category under an inactive parent',
          );
        }
      }
    }

    if (data.active === false && data.active !== category.active) {
      const activeChild = await manager.findOne(Category, {
        where: {
          orgId,
          parentId: id,
          active: true,
        },
        lock: { mode: 'pessimistic_read' },
      });
      if (activeChild) {
        throw new BadRequestException('some subcategories still active');
      }
    }

    await manager.update(Category, { orgId, id }, data);
  }
}
