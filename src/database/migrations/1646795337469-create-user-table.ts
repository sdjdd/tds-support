import { MigrationInterface, QueryRunner } from 'typeorm';

export class createUserTable1646795337469 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE user (
        id         int(11) unsigned    NOT NULL AUTO_INCREMENT,
        org_id     int(11) unsigned    NOT NULL,
        username   varchar(255)        NOT NULL,
        password   varchar(255)        NOT NULL,
        email      varchar(255),
        role       tinyint(4) unsigned NOT NULL,
        created_at datetime(3)         NOT NULL DEFAULT NOW(3),
        updated_at datetime(3)         NOT NULL DEFAULT NOW(3) ON UPDATE NOW(3),
        PRIMARY KEY (id),
        INDEX ix_user_org_id_id (org_id,id),
        INDEX ix_user_org_id_role (org_id,role),
        UNIQUE KEY uq_user_org_id_username (org_id,username(20)),
        UNIQUE KEY uq_user_org_id_email (org_id,email(20))
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE user;');
  }
}
