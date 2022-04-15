import path from 'path';
import { ConnectionOptions } from 'typeorm';

const { env } = process;

const LEANDB_INSTANCE_NAME = env.LEANDB_INSTANCE_NAME || 'MYRDB';

const options: ConnectionOptions = {
  type: 'mysql',
  host: env[`MYSQL_HOST_${LEANDB_INSTANCE_NAME}`] || 'localhost',
  port: parseInt(env[`MYSQL_PORT_${LEANDB_INSTANCE_NAME}`]) || 3306,
  username: env[`MYSQL_ADMIN_USER_${LEANDB_INSTANCE_NAME}`] || 'root',
  password: env[`MYSQL_ADMIN_PASSWORD_${LEANDB_INSTANCE_NAME}`],
  database: env.MYSQL_DATABASE || 'tds_support',
  migrations: [path.join(__dirname, 'migrations/*.{js,ts}')],
  extra: {
    timezone: '+00:00',
  },
};

export default options;
