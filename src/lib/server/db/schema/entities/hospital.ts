import {
  pgSchema,
  varchar,
  integer,
  text,
  smallserial,
  smallint,
} from 'drizzle-orm/pg-core';
import { Staff } from './hr';

export const Hospital = pgSchema('Hospital');

export const Ward = Hospital.table('Ward', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 10 }).notNull(),
  floor: integer().notNull(),
  capacity: integer().default(0),
  tags: text(),
});

export const Department = Hospital.table('Department', {
  id: smallserial().primaryKey(),
  name: text().notNull(),
});

// Pharmacies, Warehouses, Crash Cars, ...etc
export const Custody_Units = Hospital.table('Custody_Units', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 32 }).notNull(),
  manager: smallint().references(() => Staff.id),
});
