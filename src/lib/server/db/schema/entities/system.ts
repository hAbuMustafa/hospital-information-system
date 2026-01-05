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
  date,
} from 'drizzle-orm/pg-core';
import { Person } from './people';
import { Staff } from './hospital';
import { sql } from 'drizzle-orm';

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

export const users_view = Security.view('users_view', {
  user_id: integer(),
  person_id: integer(),
  first_name: varchar({ length: 45 }),
  person_name: text(),
  id_doc_type: varchar({ length: 16 }),
  id_doc_num: varchar({ length: 45 }),
  gender: boolean(),
  birthdate: date(),
  race: varchar({ length: 16 }),
  marital_status: boolean(),
  religion: varchar({ length: 15 }),
  occupation: varchar({ length: 45 }),
  contact_type: varchar({ length: 15 }),
  contact_string: varchar({ length: 100 }),
  username: varchar({ length: 45 }).notNull().unique(),
  hashed_pw: text().notNull(),
  role: integer().notNull(),
  staff_id: smallint().references(() => Staff.id),
  created_at: timestamp({ mode: 'date' }).defaultNow().notNull(),
  active: boolean().default(false).notNull(),
  last_login: timestamp({ mode: 'date' }),
  password_reset_required: boolean().default(false).notNull(),
}).as(sql`
SELECT 
  u.id AS user_id,
  u.person_id,
  pr.first_name,
  CONCAT_WS(' ', pr.first_name, pr.father_name, pr.grandfather_name, pr.family_name) as "person_name",
  doctype.name as id_doc_type,
	doc.document_number as id_doc_number,
	pr.gender,
	pr.birthdate,
	pr.race,
	pr.marital_status,
	pr.religion,
	pr.occupation,
	ct.name as contact_type,
	con.contact_string,
  u.username,
  u.hashed_pw,
  u.role,
  u.staff_id,
  u.created_at,
  u.active,
  u.last_login,
  u.password_reset_required
FROM "Security"."User" u
  LEFT JOIN "People"."Person" pr ON u.person_id = pr.id
  LEFT JOIN "People"."Person_IdDoc" doc on doc.person_id = pr.id
  LEFT JOIN "People"."IdDoc_type" doctype on doc.document_type = doctype.id
  LEFT JOIN "People"."People_contact_information" con on con.person_id = pr.id
  LEFT JOIN "People"."Contact_type" ct on con.contact_type = ct.id
  `);
