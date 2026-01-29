import { sql } from 'drizzle-orm';
import {
  pgSchema,
  serial,
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
  birthdate: date(),
  race: varchar({ length: 16 }),
  marital_status: boolean(),
  religion: varchar({ length: 15 }),
  occupation: varchar({ length: 45 }),
});

export const people_view = People.view('people_view', {
  person_id: integer().notNull(),
  full_name: text().notNull(),
  first_name: varchar({ length: 45 }).notNull(),
  father_name: varchar({ length: 45 }).notNull(),
  grandfather_name: varchar({ length: 45 }).notNull(),
  family_name: varchar({ length: 45 }),
  id_doc_type_id: smallint().references(() => IdDoc_type.id),
  id_doc_type: varchar({ length: 16 }),
  id_doc_number: varchar({ length: 45 }),
  gender: boolean(),
  birthdate: date(),
  race: varchar({ length: 16 }),
  marital_status: boolean(),
  religion: varchar({ length: 15 }),
  occupation: varchar({ length: 45 }),
  contact_type: varchar({ length: 15 }),
  contact_string: varchar({ length: 100 }),
}).as(sql`
SELECT 
	pr.id as person_id,
	CONCAT_WS(' ', pr.first_name, pr.father_name, pr.grandfather_name, pr.family_name) as "full_name",
  pr.first_name,
  pr.father_name,
  pr.grandfather_name,
  pr.family_name,
  doctype.id as id_doc_type_id,
	doctype.name as id_doc_type,
	doc.document_number as id_doc_number,
	pr.gender,
	pr.birthdate,
	pr.race,
	pr.marital_status,
	pr.religion,
	pr.occupation,
	ct.name as contact_type,
	con.contact_string
FROM "People"."Person" pr
  LEFT JOIN "People"."Person_IdDoc" doc on doc.person_id = pr.id
  LEFT JOIN "People"."IdDoc_type" doctype on doc.document_type = doctype.id
  LEFT JOIN "People"."People_contact_information" con on con.person_id = pr.id
  LEFT JOIN "People"."Contact_type" ct on con.contact_type = ct.id
  `);

export const Contact_type = People.table('Contact_type', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 15 }).notNull(),
  tag: varchar({ length: 20 }).notNull(),
});

export const People_contact_information = People.table('People_contact_information', {
  id: serial().primaryKey(),
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
  id: smallserial().primaryKey(),
  name: varchar({ length: 16 }).notNull(),
});

export const Person_IdDoc = People.table('Person_IdDoc', {
  id: serial(),
  person_id: integer()
    .notNull()
    .references(() => Person.id),
  document_type: smallint().references(() => IdDoc_type.id),
  document_number: varchar({ length: 45 }).notNull().unique(),
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
