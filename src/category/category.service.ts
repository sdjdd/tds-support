import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, EntityManager, In, Repository } from 'typeorm';
import _ from 'lodash';
import { User } from '@/user/entities/user.entity';
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

  @InjectRepository(User)
  private userRepository: Repository<User>;

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

  async findUsers(orgId: number, id: number): Promise<User[]> {
    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.users', 'user')
      .where('category.orgId = :orgId', { orgId })
      .andWhere('category.id = :id', { id })
      .getOne();
    if (!category) {
      throw new NotFoundException(`category ${id} does not exist`);
    }
    return category.users;
  }

  async addUser(orgId: number, id: number, userId: number) {
    const category = await this.findOneOrFail(orgId, id);

    const user = await this.userRepository.findOne({
      where: { orgId, id: userId },
    });
    if (!user) {
      throw new UnprocessableEntityException(`User ${userId} does not exist`);
    }
    if (!user.isAgent()) {
      throw new UnprocessableEntityException(`User ${userId} is not an agent`);
    }

    try {
      await this.categoryRepository
        .createQueryBuilder()
        .relation('users')
        .of(category)
        .add(userId);
    } catch (error) {
      if (error.errno !== 1062) {
        throw error;
      }
    }
  }

  async removeUser(orgId: number, id: number, userId: number) {
    const category = await this.findOneOrFail(orgId, id);
    await this.categoryRepository
      .createQueryBuilder()
      .relation('users')
      .of(category)
      .remove(userId);
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
      for (const { id, ...data } of datas) {
        try {
          await this.updateByEntityManager(manager, orgId, id, data);
        } catch (error) {
          throw new BadRequestException(
            `failed to update category ${id}: ${error.message}`,
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
