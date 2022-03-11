import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserRole } from './types';

interface FindUsersOptions {
  take?: number;
  skip?: number;
  cursor?: number;
  role?: UserRole | UserRole[];
}

@Injectable()
export class UsersService {
  @InjectRepository(User)
  private usersRepository: Repository<User>;

  find(
    organizationId: number,
    { skip, take, role, cursor }: FindUsersOptions = {},
  ): Promise<User[]> {
    const qb = this.usersRepository
      .createQueryBuilder('user')
      .where('user.organizationId = :organizationId', { organizationId });

    if (role) {
      if (Array.isArray(role)) {
        qb.andWhere('user.role IN (:...role)', { role });
      } else {
        qb.andWhere('user.role = :role', { role });
      }
    }

    if (skip) {
      qb.skip(skip);
    }

    if (cursor) {
      qb.andWhere('user.id > :cursor', { cursor });
    }

    return qb.take(take).orderBy('user.id').getMany();
  }

  findOne(organizationId: number, id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ organizationId, id });
  }

  async findOneOrFail(organizationId: number, id: number): Promise<User> {
    const user = await this.findOne(organizationId, id);
    if (!user) {
      throw new NotFoundException(`user ${id} does not exist`);
    }
    return user;
  }

  findOneByUsername(
    organizationId: number,
    username: string,
  ): Promise<User | undefined> {
    return this.usersRepository.findOne({ organizationId, username });
  }

  findOneByEmail(
    organizationId: number,
    email: string,
  ): Promise<User | undefined> {
    return this.usersRepository.findOne({ organizationId, email });
  }

  findOneByUsernameAndSelectPassword(
    organizationId: number,
    username: string,
  ): Promise<User | undefined> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.organization_id = :organizationId')
      .andWhere('user.username = :username')
      .setParameters({ organizationId, username })
      .getOne();
  }

  private async assertNoUsernameConflict(
    organizationId: number,
    username: string,
  ) {
    const user = await this.findOneByUsername(organizationId, username);
    if (user) {
      throw new ConflictException(`username "${username}" already exists`);
    }
  }

  private async assertNoEmailConflict(organizationId: number, email: string) {
    const user = await this.findOneByEmail(organizationId, email);
    if (user) {
      throw new ConflictException(`email "${email}" already exists`);
    }
  }

  async create(organizationId: number, data: CreateUserDto): Promise<User> {
    await this.assertNoUsernameConflict(organizationId, data.username);
    if (data.email) {
      await this.assertNoEmailConflict(organizationId, data.email);
    }
    const user = new User();
    user.organizationId = organizationId;
    user.username = data.username;
    await user.setPassword(data.password);
    user.email = data.email;
    user.role = 'end-user';
    await this.usersRepository.insert(user);
    return user;
  }

  async update(organizationId: number, id: number, data: UpdateUserDto) {
    const user = await this.findOneOrFail(organizationId, id);
    if (data.email && data.email !== user.email) {
      await this.assertNoEmailConflict(organizationId, data.email);
    }
    await this.usersRepository.update({ organizationId, id }, data);
  }
}
