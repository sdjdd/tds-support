import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Domain } from './domain.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  subdomain: string;

  @OneToMany(() => Domain, (domain) => domain.organization)
  domains: Domain[];

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
