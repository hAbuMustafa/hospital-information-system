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
  job: varchar({ length: 45 }).notNull(),
  qualification: varchar({ length: 45 }).notNull(),
  major: varchar({ length: 45 }).notNull(),
  department: varchar({ length: 45 }).notNull(),
  employment_date: date({ mode: 'date' }).notNull(),
  person_id: integer()
    .notNull()
    .references(() => Person.id),
});

export const ReportsTo = Hospital.table('ReportsTo', {
  staff_id: smallint().references(() => Staff.id),
  reports_to_id: smallint().references(() => Staff.id),
});

export const Warehouse_Drug = Hospital.table('Warehouse_Drug', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 32 }).notNull(),
});

export const Warehouse_Supplies = Hospital.table('Warehouse_Supplies', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 32 }).notNull(),
});

export const Pharmacy_Drugs = Hospital.table('Pharmacy_Drugs', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 32 }).notNull(),
});

export const Pharmacy_Supplies = Hospital.table('Pharmacy_Supplies', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 32 }).notNull(),
});
