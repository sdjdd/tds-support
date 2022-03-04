import { MigrationInterface, QueryRunner } from 'typeorm';

export class createTenantsTable1646372053798 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE tenants (
        id          int(11) unsigned NOT NULL AUTO_INCREMENT,
        subdomain   varchar(191)     NOT NULL,
        name        varchar(255)     NOT NULL,
        description varchar(255)     NOT NULL DEFAULT '',
        created_at  datetime(3)      NOT NULL DEFAULT NOW(3),
        updated_at  datetime(3)      NOT NULL DEFAULT NOW(3) ON UPDATE NOW(3),
        deleted_at  datetime(3),
        PRIMARY KEY (id),
        UNIQUE KEY unq_tenants_subdomain (subdomain)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE tenants;');
  }
}
