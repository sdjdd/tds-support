import { MigrationInterface, QueryRunner } from 'typeorm';

export class createSubdomainsTable1646622037126 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE subdomains (
        id int(11)  unsigned         NOT NULL AUTO_INCREMENT,
        project_id  int(11) unsigned NOT NULL,
        subdomain   varchar(191)     NOT NULL,
        created_at  datetime(3)      NOT NULL DEFAULT NOW(3),
        updated_at  datetime(3)      NOT NULL DEFAULT NOW(3) ON UPDATE NOW(3),
        PRIMARY KEY (id),
        UNIQUE KEY uq_subdomains_subdomain (subdomain),
        CONSTRAINT fk_subdomains_projects FOREIGN KEY (project_id) REFERENCES projects (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE subdomains;');
  }
}
