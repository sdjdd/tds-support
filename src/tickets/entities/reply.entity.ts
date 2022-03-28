import { Exclude, Expose } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('reply')
@Exclude()
export class Reply {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ name: 'org_id' })
  orgId: number;

  @Column({ name: 'ticket_id' })
  ticketId: number;

  @Column({ name: 'author_id' })
  @Expose()
  authorId: number;

  @Column()
  @Expose()
  content: string;

  @Column({ name: 'html_content' })
  @Expose()
  htmlContent: string;

  @Column()
  @Expose()
  public: boolean;

  @Column({ name: 'created_at' })
  @Expose()
  createdAt: Date;

  @Column({ name: 'updated_at' })
  @Expose()
  updatedAt: Date;
}
