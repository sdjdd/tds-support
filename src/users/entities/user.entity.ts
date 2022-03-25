import { Exclude, Expose } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import argon2 from 'argon2';
import { UserRole } from '../types';

@Entity('user')
@Exclude()
export class User {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ name: 'organization_id' })
  organizationId: number;

  @Column()
  @Expose()
  username: string;

  @Column({ select: false })
  password: string;

  @Column()
  @Expose()
  email: string;

  @Column()
  @Expose()
  role: UserRole;

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
    return this.role === 'admin';
  }

  isAgent() {
    return this.isAdmin() || this.role === 'agent';
  }
}
