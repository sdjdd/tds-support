import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UsersService {
  @InjectRepository(User)
  private usersRepository: Repository<User>;

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
    user.role = data.role ?? 'end-user';
    await this.usersRepository.insert(user);
    return user;
  }
}
