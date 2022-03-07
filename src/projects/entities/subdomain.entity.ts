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
import { Project } from './project.entity';

@Entity('subdomains')
@Exclude()
export class Subdomain {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  project_id: number;

  @ManyToOne(() => Project, (project) => project.subdomains)
  @JoinColumn({ name: 'project_id' })
  project: Project;

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
