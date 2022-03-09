import { MigrationInterface, QueryRunner } from 'typeorm';

export class createUsersTable1646795337469 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id              int(11) unsigned NOT NULL AUTO_INCREMENT,
        organization_id int(11) unsigned NOT NULL,
        username        varchar(191)     NOT NULL,
        password        varchar(255)     NOT NULL,
        email           varchar(191),
        role            varchar(191)     NOT NULL,
        created_at      datetime(3)      NOT NULL DEFAULT NOW(3),
        updated_at      datetime(3)      NOT NULL DEFAULT NOW(3) ON UPDATE NOW(3),
        PRIMARY KEY (id),
        INDEX ix_users_organization_id_id (organization_id,id),
        UNIQUE KEY uq_users_organization_id_username (organization_id,username),
        UNIQUE KEY uq_users_organization_id_email (organization_id,email),
        CONSTRAINT fk_users_organizations FOREIGN KEY (organization_id) REFERENCES organizations (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE users;');
  }
}
