import {
  serial,
  bigserial,
  varchar,
  bigint,
  integer,
  text,
  boolean,
  timestamp,
  pgSchema,
  smallint,
} from 'drizzle-orm/pg-core';
import { Person } from './people';
import { Staff } from './hospital';

export const Security = pgSchema('Security');

export const Sec_pb_key = Security.table('Sec_pb_key', {
  id: bigserial({ mode: 'bigint' }).primaryKey(),
  key: text().notNull(),
  timestamp: timestamp({ mode: 'date' }).defaultNow().notNull(),
});

export const Sec_pv_key = Security.table('Sec_pv_key', {
  id: bigserial({ mode: 'bigint' }).primaryKey(),
  key: text().notNull(),
  timestamp: timestamp({ mode: 'date' }).defaultNow().notNull(),
});

export const RefreshToken = Security.table('RefreshToken', {
  id: varchar({ length: 256 }).primaryKey(),
  user_id: integer()
    .notNull()
    .references(() => User.id),
  token_hash: varchar({ length: 36 }).notNull(),
  created_at: timestamp({ mode: 'date' }).notNull().defaultNow(),
  expires_at: timestamp({ mode: 'date' }).notNull(),
  last_used_at: timestamp({ mode: 'date' }).defaultNow(),
});

export const User = Security.table('User', {
  id: serial().primaryKey(),
  username: varchar({ length: 45 }).notNull().unique(),
  hashed_pw: text().notNull(),
  role: integer().notNull(),
  person_id: integer()
    .notNull()
    .references(() => Person.id),
  staff_id: smallint().references(() => Staff.id),
  pb_key_id: bigint({ mode: 'bigint' })
    .notNull()
    .references(() => Sec_pb_key.id),
  pv_key_id: bigint({ mode: 'bigint' })
    .notNull()
    .references(() => Sec_pv_key.id),
  created_at: timestamp({ mode: 'date' }).defaultNow().notNull(),
  active: boolean().default(false).notNull(),
  last_login: timestamp({ mode: 'date' }),
  password_reset_required: boolean().default(false).notNull(),
});
