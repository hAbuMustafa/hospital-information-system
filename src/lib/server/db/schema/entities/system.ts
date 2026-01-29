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
import { People_contact_information, Person, Person_IdDoc } from './people';
import { Staff } from './hospital';
import { sql } from 'drizzle-orm';

export const Security = pgSchema('Security');

export const Sec_pb_key = Security.table('Sec_pb_key', {
  id: bigserial({ mode: 'bigint' }).primaryKey(),
  key: text().notNull(),
  timestamp: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const Sec_pv_key = Security.table('Sec_pv_key', {
  id: bigserial({ mode: 'bigint' }).primaryKey(),
  key: text().notNull(),
  timestamp: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const RefreshToken = Security.table('RefreshToken', {
  id: varchar({ length: 256 }).primaryKey(),
  user_id: integer()
    .notNull()
    .references(() => User.id),
  token_hash: varchar({ length: 64 }).notNull(),
  created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
  expires_at: timestamp({ withTimezone: true }).notNull(),
  last_used_at: timestamp({ withTimezone: true }).defaultNow(),
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
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  active: boolean().default(false).notNull(),
  last_login: timestamp({ withTimezone: true }),
  password_reset_required: boolean().default(false).notNull(),
});

export const users_view = Security.view('users_view', {
  user_id: integer().notNull(),
  person_id: integer().notNull(),
  first_name: varchar({ length: 45 }).notNull(),
  father_name: varchar({ length: 45 }).notNull(),
  grandfather_name: varchar({ length: 45 }).notNull(),
  family_name: varchar({ length: 45 }),
  full_name: text().notNull(),
  id_doc_type_id: smallint(),
  id_doc_type: varchar({ length: 16 }).notNull(),
  id_doc_number_id: integer()
    .references(() => Person_IdDoc.id)
    .notNull(),
  id_doc_number: varchar({ length: 45 }).notNull(),
  gender: boolean().notNull(),
  birthdate: date().notNull(),
  race: varchar({ length: 16 }),
  marital_status: boolean(),
  religion: varchar({ length: 15 }),
  occupation: varchar({ length: 45 }),
  email_id: integer().references(() => People_contact_information.id),
  email: varchar({ length: 100 }).notNull(),
  phone_number_id: integer().references(() => People_contact_information.id),
  phone_number: varchar({ length: 100 }).notNull(),
  username: varchar({ length: 45 }).notNull().unique(),
  hashed_pw: text().notNull(),
  role: integer().notNull(),
  staff_id: smallint().references(() => Staff.id),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  active: boolean().default(false).notNull(),
  last_login: timestamp({ withTimezone: true }),
  password_reset_required: boolean().default(false).notNull(),
}).as(sql`
SELECT 
  u.id AS user_id,
  u.person_id,
  pr.first_name,
  pr.father_name,
  pr.grandfather_name,
  pr.family_name,
  CONCAT_WS(' ', pr.first_name, pr.father_name, pr.grandfather_name, pr.family_name) AS "full_name",
  doctype.id AS id_doc_type_id,
  doctype.name AS id_doc_type,
  doc.id AS id_doc_number_id,
  doc.document_number AS id_doc_number,
  pr.gender,
  pr.birthdate,
  pr.race,
  pr.marital_status,
  pr.religion,
  pr.occupation,
  email.id as email_id,
  email.contact_string as email,
  phone_number.id as phone_number_id,
  phone_number.contact_string as phone_number,
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
  LEFT JOIN "People"."Person_IdDoc" doc ON doc.person_id = pr.id
  LEFT JOIN "People"."IdDoc_type" doctype ON doc.document_type = doctype.id
  LEFT JOIN "People"."People_contact_information" email ON email.person_id = pr.id AND email.contact_type = 3
  LEFT JOIN "People"."People_contact_information" phone_number ON phone_number.person_id = pr.id AND phone_number.contact_type = 1
  `);
