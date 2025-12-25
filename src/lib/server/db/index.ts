import { drizzle } from 'drizzle-orm/node-postgres';
import { NODE_ENV, PSQL_CONNECTION_STRING } from '$env/static/private';
import { Pool } from 'pg';
import schema from './schema/entities';

const pool = new Pool({
  connectionString: `${PSQL_CONNECTION_STRING}${
    NODE_ENV !== 'production' ? '_TEST' : ''
  }`,
});

export const db = drizzle(pool, { schema });
