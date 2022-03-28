import { MigrationInterface, QueryRunner } from 'typeorm';

export class createReplyTable1648182885432 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE reply (
        id           int(11) unsigned NOT NULL AUTO_INCREMENT,
        org_id       int(11) unsigned NOT NULL,
        ticket_id    int(11) unsigned NOT NULL,
        author_id    int(11) unsigned NOT NULL,
        content      text             NOT NULL,
        html_content text             NOT NULL,
        public       boolean          NOT NULL DEFAULT TRUE,
        created_at   datetime(3)      NOT NULL DEFAULT NOW(3),
        updated_at   datetime(3)      NOT NULL DEFAULT NOW(3) ON UPDATE NOW(3),
        PRIMARY KEY (id),
        INDEX ix_reply_org_id_ticket_id_id (org_id,ticket_id,id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE reply;');
  }
}
