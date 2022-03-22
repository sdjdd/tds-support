import { Exclude, Expose } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tickets')
@Exclude()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'organization_id' })
  organizationId: number;

  @Column()
  @Expose({ name: 'id' })
  nid: number;

  @Column({ name: 'category_id' })
  @Expose()
  categoryId: number;

  @Column({ name: 'author_id' })
  @Expose()
  authorId: number;

  @Column({ name: 'assignee_id' })
  @Expose()
  assigneeId?: number;

  @Column()
  @Expose()
  title: string;

  @Column()
  @Expose()
  content: string;

  @Column({ name: 'reply_count' })
  @Expose()
  replyCount: number;

  @Column()
  @Expose()
  status: number;

  @Column({ name: 'created_at' })
  @Expose()
  createdAt: Date;

  @Column({ name: 'updated_at' })
  @Expose()
  updatedAt: Date;
}
