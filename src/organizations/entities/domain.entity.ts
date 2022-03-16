import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from './organization.entity';

@Entity('domains')
@Exclude()
export class Domain {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ name: 'organization_id' })
  organizationId: number;

  @ManyToOne(() => Organization, (organization) => organization.domains)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column()
  @Expose()
  domain: string;

  @Column({ name: 'created_at' })
  @Expose()
  createdAt: Date;

  @Column({ name: 'updated_at' })
  @Expose()
  updatedAt: Date;
}
