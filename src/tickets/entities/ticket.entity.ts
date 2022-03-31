import { Exclude, Expose } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ticket')
@Exclude()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'org_id' })
  orgId: number;

  @Column()
  @Expose({ name: 'id' })
  seq: number;

  @Column({ name: 'category_id' })
  @Expose()
  categoryId: number;

  @Column({ name: 'requester_id' })
  @Expose()
  requesterId: number;

  @Column({ name: 'assignee_id' })
  @Expose()
  assigneeId?: number;

  @Column()
  @Expose()
  title: string;

  @Column()
  @Expose()
  content: string;

  @Column({ name: 'html_content' })
  @Expose()
  htmlContent: string;

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
