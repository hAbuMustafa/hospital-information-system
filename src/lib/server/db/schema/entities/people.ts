import {
  pgSchema,
  serial,
  bigserial,
  varchar,
  integer,
  text,
  date,
  boolean,
  smallserial,
  smallint,
} from 'drizzle-orm/pg-core';

export const People = pgSchema('People');

export const Person = People.table('Person', {
  id: serial().primaryKey(),
  first_name: varchar({ length: 45 }).notNull(),
  father_name: varchar({ length: 45 }).notNull(),
  grandfather_name: varchar({ length: 45 }).notNull(),
  family_name: varchar({ length: 45 }),
  gender: boolean(),
  birthdate: date({ mode: 'date' }),
  race: varchar({ length: 16 }),
  marital_status: boolean(),
  religion: varchar({ length: 15 }),
  occupation: varchar({ length: 45 }),
});

export const Contact_type = People.table('Contact_type', {
  id: smallserial(),
  name: varchar({ length: 15 }).notNull(),
});

export const People_contact_information = People.table('People_contact_information', {
  id: bigserial({ mode: 'bigint' }).primaryKey(),
  person_id: integer()
    .notNull()
    .references(() => Person.id),
  contact_type: smallint()
    .notNull()
    .references(() => Contact_type.id),
  contact_string: varchar({ length: 100 }).notNull().unique(),
  is_verified: boolean().default(false),
});

export const IdDoc_type = People.table('IdDoc_type', {
  id: integer().primaryKey(),
  name: text().notNull(),
});

export const Person_IdDoc = People.table('Person_IdDoc', {
  id: bigserial({ mode: 'bigint' }).primaryKey(),
  document_number: varchar({ length: 45 }).notNull().unique(),
  document_type: integer().references(() => IdDoc_type.id),
  person_id: integer()
    .notNull()
    .references(() => Person.id),
});

export const Person_relationship = People.table('Person_relationship', {
  person_id: integer()
    .notNull()
    .references(() => Person.id),
  related_to_id: integer()
    .notNull()
    .references(() => Person.id),
  relationship: varchar({ length: 45 }).notNull(),
});
