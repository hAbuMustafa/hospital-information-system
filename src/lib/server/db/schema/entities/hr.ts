import {
  date,
  integer,
  pgSchema,
  smallint,
  smallserial,
  text,
  varchar,
} from 'drizzle-orm/pg-core';
import { Department } from './hospital';
import { Person } from './people';

export const HR = pgSchema('HR');

export const Staff = HR.table('Staff', {
  id: smallserial().primaryKey(),
  job: smallint().references(() => Job.id),
  job_level: text({ enum: ['1', '2', '3'] }),
  qualification: varchar({ length: 45 }),
  major: varchar({ length: 45 }),
  department: smallint().references(() => Department.id),
  employment_date: date(),
  person_id: integer()
    .notNull()
    .references(() => Person.id),
});

export const ReportsTo = HR.table('ReportsTo', {
  staff_id: smallint().references(() => Staff.id),
  reports_to_id: smallint().references(() => Staff.id),
});

export const Job = HR.table('Job', {
  id: smallserial().primaryKey(),
  name: text().notNull(),
});

export const Qualification = HR.table('Qualification', {
  id: smallserial().primaryKey(),
  name: text().notNull(),
});

export const Job_Qualification = HR.table('Job_Qualification', {
  job_id: smallint()
    .notNull()
    .references(() => Job.id),
  qualification_id: smallint()
    .notNull()
    .references(() => Qualification.id),
});
