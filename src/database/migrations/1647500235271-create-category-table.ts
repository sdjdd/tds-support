import { MigrationInterface, QueryRunner } from 'typeorm';

export class createCategoryTable1647500235271 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE category (
        id          int(11) unsigned NOT NULL AUTO_INCREMENT,
        org_id      int(11) unsigned NOT NULL,
        parent_id   int(11) unsigned,
        name        varchar(255)     NOT NULL,
        description varchar(255)     NOT NULL DEFAULT '',
        active      boolean          NOT NULL DEFAULT TRUE,
        position    smallint(6) unsigned,
        created_at  datetime(3)      NOT NULL DEFAULT NOW(3),
        updated_at  datetime(3)      NOT NULL DEFAULT NOW(3) ON UPDATE NOW(3),
        PRIMARY KEY (id),
        INDEX ix_category_org_id_id (org_id,id),
        INDEX ix_category_org_id_parent_id (org_id,parent_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE category;');
  }
}
