import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import _ from 'lodash';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { FindUsersParams } from './dtos/find-users-params.dto';
import { UserRole } from './types';

@Injectable()
export class UserService {
  @InjectRepository(User)
  private userRepository: Repository<User>;

  find(
    orgId: number,
    { page, pageSize, role }: FindUsersParams,
  ): Promise<User[]> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('user.orgId = :orgId', { orgId });

    if (role) {
      if (Array.isArray(role)) {
        qb.andWhere('user.role IN (:...role)', { role });
      } else {
        qb.andWhere('user.role = :role', { role });
      }
    }

    return qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('user.id')
      .getMany();
  }

  findOne(orgId: number, id: number): Promise<User | undefined> {
    return this.userRepository.findOne({ orgId, id });
  }

  async findOneOrFail(orgId: number, id: number): Promise<User> {
    const user = await this.findOne(orgId, id);
    if (!user) {
      throw new NotFoundException(`user ${id} does not exist`);
    }
    return user;
  }

  findOneByUsername(
    orgId: number,
    username: string,
  ): Promise<User | undefined> {
    return this.userRepository.findOne({ orgId, username });
  }

  findOneByEmail(orgId: number, email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ orgId, email });
  }

  findOneByUsernameAndSelectPassword(
    orgId: number,
    username: string,
  ): Promise<User | undefined> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.orgId = :orgId', { orgId })
      .andWhere('user.username = :username', { username })
      .getOne();
  }

  private async assertNoUsernameConflict(orgId: number, username: string) {
    const user = await this.findOneByUsername(orgId, username);
    if (user) {
      throw new ConflictException(`username "${username}" already exists`);
    }
  }

  private async assertNoEmailConflict(orgId: number, email: string) {
    const user = await this.findOneByEmail(orgId, email);
    if (user) {
      throw new ConflictException(`email "${email}" already exists`);
    }
  }

  async create(orgId: number, data: CreateUserDto): Promise<number> {
    await this.assertNoUsernameConflict(orgId, data.username);
    if (data.email) {
      await this.assertNoEmailConflict(orgId, data.email);
    }
    const user = new User();
    user.orgId = orgId;
    user.username = data.username;
    await user.setPassword(data.password);
    user.email = data.email;
    user.role = UserRole.EndUser;
    await this.userRepository.insert(user);
    return user.id;
  }

  async update(orgId: number, id: number, data: UpdateUserDto) {
    const user = await this.findOneOrFail(orgId, id);
    if (_.isEmpty(data)) {
      return;
    }
    if (data.email && data.email !== user.email) {
      await this.assertNoEmailConflict(orgId, data.email);
    }
    await this.userRepository.update({ orgId, id }, data);
  }
}
