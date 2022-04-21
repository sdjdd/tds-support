import { Exclude, Expose } from 'class-transformer';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import argon2 from 'argon2';
import { Category } from '@/category/entities/category.entity';
import { UserRole } from '../types';

@Entity('user')
@Exclude()
export class User {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ name: 'org_id' })
  orgId: number;

  @Column()
  @Expose()
  username: string;

  @Column({ select: false })
  password: string;

  @Column()
  @Expose()
  email: string;

  @Column()
  role: UserRole;

  @ManyToMany(() => Category, (category) => category.users)
  categories?: Category[];

  @Column({ name: 'created_at' })
  @Expose()
  createdAt: Date;

  @Column({ name: 'updated_at' })
  @Expose()
  updatedAt: Date;

  async setPassword(password: string) {
    this.password = await argon2.hash(password);
  }

  comparePassword(password: string): Promise<boolean> {
    if (!this.password) {
      throw new Error('user has no password, please check query statement');
    }
    return argon2.verify(this.password, password);
  }

  isAdmin() {
    return this.role === UserRole.Admin;
  }

  isAgent() {
    return this.isAdmin() || this.role === UserRole.Agent;
  }

  @Expose({ name: 'role' })
  getRoleName() {
    switch (this.role) {
      case UserRole.EndUser:
        return 'end-user';
      case UserRole.LiteAgent:
        return 'lite-agent';
      case UserRole.Agent:
        return 'agent';
      case UserRole.Admin:
        return 'admin';
    }
  }
}
