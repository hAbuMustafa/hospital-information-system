import { pgSchema, varchar, foreignKey, integer, text, date } from 'drizzle-orm/pg-core';
import { Person } from './people';

export const Hospital = pgSchema('Hospital');

export const Ward = Hospital.table('Ward', {
  id: integer().primaryKey(),
  name: varchar({ length: 10 }).notNull(),
  floor: integer().notNull(),
  capacity: integer().default(0),
  tags: text(),
});

export const Staff = Hospital.table(
  'Staff',
  {
    id: integer().primaryKey(),
    job: varchar({ length: 45 }).notNull(),
    qualification: varchar({ length: 45 }).notNull(),
    major: varchar({ length: 45 }).notNull(),
    department: varchar({ length: 45 }).notNull(),
    employment_date: date({ mode: 'date' }).notNull(),
    manager_id: integer().notNull(),
    person_id: integer()
      .notNull()
      .references(() => Person.id),
  },
  (table) => [
    foreignKey({
      columns: [table.manager_id],
      foreignColumns: [table.id],
      name: 'staff_manager_link',
    }),
  ]
);
