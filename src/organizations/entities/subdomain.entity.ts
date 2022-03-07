import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';

@Entity('subdomains')
@Exclude()
export class Subdomain {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  organization_id: number;

  @ManyToOne(() => Organization, (organization) => organization.subdomains)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column()
  @Expose()
  subdomain: string;

  @CreateDateColumn()
  @Expose()
  created_at: Date;

  @UpdateDateColumn()
  @Expose()
  updated_at: Date;
}
