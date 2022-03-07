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

  @Column({ name: 'organization_id' })
  organizationId: number;

  @ManyToOne(() => Organization, (organization) => organization.subdomains)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column()
  @Expose()
  subdomain: string;

  @CreateDateColumn({ name: 'created_at' })
  @Expose()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @Expose()
  updatedAt: Date;
}
