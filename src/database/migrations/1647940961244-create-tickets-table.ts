import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTicketsTable1647940961244 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE tickets (
        id              int(11) unsigned     NOT NULL AUTO_INCREMENT,
        organization_id int(11) unsigned     NOT NULL,
        nid             int(11) unsigned     NOT NULL,
        category_id     int(11) unsigned     NOT NULL,
        author_id       int(11) unsigned     NOT NULL,
        assignee_id     int(11) unsigned,
        title           varchar(255)         NOT NULL,
        content         text                 NOT NULL,
        reply_count     smallint(6) unsigned NOT NULL DEFAULT 0,
        status          smallint(6) unsigned NOT NULL,
        created_at      datetime(3)          NOT NULL DEFAULT NOW(3),
        updated_at      datetime(3)          NOT NULL DEFAULT NOW(3) ON UPDATE NOW(3),
        PRIMARY KEY (id),
        UNIQUE KEY uq_tickets_organization_id_nid (organization_id,nid),
        INDEX ix_tickets_organization_id_id (organization_id,id),
        INDEX ix_tickets_organization_id_status (organization_id,status),
        INDEX ix_tickets_organization_id_created_at (organization_id,created_at),
        INDEX ix_tickets_organization_id_updated_at (organization_id,updated_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE tickets;');
  }
}
