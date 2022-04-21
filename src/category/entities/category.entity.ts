import { User } from '@/user';
import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('category')
@Exclude()
export class Category {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ name: 'org_id' })
  orgId: number;

  @Column({ name: 'parent_id' })
  @Expose()
  parentId?: number;

  @ManyToOne(() => Category, (category) => category.children)
  @JoinColumn({ name: 'parent_id' })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children?: Category[];

  @Column()
  @Expose()
  name: string;

  @Column()
  @Expose()
  description: string;

  @Column()
  @Expose()
  active: boolean;

  @Column()
  position?: number;

  @ManyToMany(() => User, (user) => user.categories)
  @JoinTable({
    name: 'category_users',
    joinColumn: { name: 'category_id' },
    inverseJoinColumn: { name: 'user_id' },
  })
  users?: User[];

  @Column({ name: 'created_at' })
  @Expose()
  createdAt: Date;

  @Column({ name: 'updated_at' })
  @Expose()
  updatedAt: Date;

  @Expose({ name: 'position' })
  getPosition() {
    return this.position ?? this.createdAt.getTime();
  }
}
