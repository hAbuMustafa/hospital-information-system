import { pgSchema, varchar, integer, text, date } from 'drizzle-orm/pg-core';
import { Person } from './people';

export const Hospital = pgSchema('Hospital');

export const Ward = Hospital.table('Ward', {
  id: integer().primaryKey(),
  name: varchar({ length: 10 }).notNull(),
  floor: integer().notNull(),
  capacity: integer().default(0),
  tags: text(),
});

export const Staff = Hospital.table('Staff', {
  id: integer().primaryKey(),
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
  staff_id: integer().references(() => Staff.id),
  reports_to_id: integer().references(() => Staff.id),
});
