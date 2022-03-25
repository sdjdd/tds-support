import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from './organization.entity';

@Entity('domain')
@Exclude()
export class Domain {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ name: 'org_id' })
  orgId: number;

  @ManyToOne(() => Organization, (org) => org.domains)
  @JoinColumn({ name: 'org_id' })
  org: Organization;

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
