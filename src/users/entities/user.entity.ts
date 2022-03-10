import { Exclude, Expose } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import argon2 from 'argon2';
import { BaseEntity } from '@/common/entities';

@Entity('users')
@Exclude()
export class User extends BaseEntity {
  @Column({ name: 'organization_id' })
  organizationId: number;

  @Column()
  @Expose()
  username: string;

  @Column({ select: false })
  password: string;

  @Column()
  email: string;

  @Column()
  @Expose()
  role: 'end-user' | 'agent' | 'admin';

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
