import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTicketTable1647940961244 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE ticket (
        id           int(11) unsigned     NOT NULL AUTO_INCREMENT,
        org_id       int(11) unsigned     NOT NULL,
        seq          int(11) unsigned     NOT NULL,
        category_id  int(11) unsigned     NOT NULL,
        requester_id int(11) unsigned     NOT NULL,
        assignee_id  int(11) unsigned,
        title        varchar(255)         NOT NULL,
        content      text                 NOT NULL,
        reply_count  smallint(6) unsigned NOT NULL DEFAULT 0,
        status       smallint(6) unsigned NOT NULL,
        created_at   datetime(3)          NOT NULL DEFAULT NOW(3),
        updated_at   datetime(3)          NOT NULL DEFAULT NOW(3) ON UPDATE NOW(3),
        PRIMARY KEY (id),
        UNIQUE KEY uq_tickets_org_id_seq (org_id,seq),
        INDEX ix_tickets_org_id_id (org_id,id),
        INDEX ix_tickets_org_id_requester_id (org_id,requester_id),
        INDEX ix_tickets_org_id_assignee_id (org_id,assignee_id),
        INDEX ix_tickets_org_id_status (org_id,status),
        INDEX ix_tickets_org_id_updated_at (org_id,updated_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE tickets;');
  }
}
