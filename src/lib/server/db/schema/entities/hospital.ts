import {
  pgSchema,
  varchar,
  integer,
  text,
  date,
  smallserial,
  smallint,
} from 'drizzle-orm/pg-core';
import { Person } from './people';

export const Hospital = pgSchema('Hospital');

export const Ward = Hospital.table('Ward', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 10 }).notNull(),
  floor: integer().notNull(),
  capacity: integer().default(0),
  tags: text(),
});

export const Staff = Hospital.table('Staff', {
  id: smallserial().primaryKey(),
  job: varchar({ length: 45 }), // todo: make a list
  qualification: varchar({ length: 45 }),
  major: varchar({ length: 45 }),
  department: varchar({ length: 45 }), // todo: make a list
  employment_date: date({ mode: 'date' }),
  person_id: integer()
    .notNull()
    .references(() => Person.id),
});

export const ReportsTo = Hospital.table('ReportsTo', {
  staff_id: smallint().references(() => Staff.id),
  reports_to_id: smallint().references(() => Staff.id),
});

// Pharmacies, Warehouses, Crash Cars, ...etc
export const Custody_Units = Hospital.table('Custody_Units', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 32 }).notNull(),
  manager: smallint().references(() => Staff.id),
});
