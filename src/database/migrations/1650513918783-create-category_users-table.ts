import { MigrationInterface, QueryRunner } from 'typeorm';

export class createCategoryUsersTable1650513918783
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE category_users (
        category_id int(11) unsigned NOT NULL,
        user_id     int(11) unsigned NOT NULL,
        PRIMARY KEY (category_id,user_id),
        INDEX ix_category_users_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE category_users;');
  }
}
