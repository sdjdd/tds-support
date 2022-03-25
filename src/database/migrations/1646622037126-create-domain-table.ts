import { MigrationInterface, QueryRunner } from 'typeorm';

export class createDomainTable1646622037126 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE domain (
        id         int(11) unsigned  NOT NULL AUTO_INCREMENT,
        org_id     int(11) unsigned  NOT NULL,
        domain     varchar(255)      NOT NULL,
        created_at datetime(3)       NOT NULL DEFAULT NOW(3),
        updated_at datetime(3)       NOT NULL DEFAULT NOW(3) ON UPDATE NOW(3),
        PRIMARY KEY (id),
        UNIQUE KEY uq_domains_domain (domain(50))
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE domains;');
  }
}
