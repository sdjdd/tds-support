import { MigrationInterface, QueryRunner } from 'typeorm';

export class createSequenceTable1647848600519 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE sequence (
        id              int(11) unsigned NOT NULL AUTO_INCREMENT,
        organization_id int(11) unsigned NOT NULL,
        name            varchar(50)      NOT NULL,
        next_id         int(11) unsigned NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_sequence_organization_id_name (organization_id,name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE sequence;');
  }
}
