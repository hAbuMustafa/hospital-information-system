import {
  pgSchema,
  serial,
  varchar,
  bigint,
  integer,
  decimal,
  timestamp,
} from 'drizzle-orm/pg-core';
import { InPatient } from './patients';
import { Sec_pb_key, User } from './system';
import { PharmacyStock_Drugs } from './pharmacy';

export const Finance = pgSchema('Finance');

export const Invoice_Drugs = Finance.table('Invoice_Drugs', {
  id: serial().primaryKey(),
  patient_id: integer()
    .notNull()
    .references(() => InPatient.id),
  created_by: integer()
    .notNull()
    .references(() => User.id),
  created_at: timestamp().notNull().default(new Date()),
  from: timestamp().notNull(),
  till: timestamp().notNull(),
  total: decimal({ precision: 10, scale: 5 }).notNull(),
  creator_pb_key_id: bigint({ mode: 'bigint' })
    .notNull()
    .references(() => Sec_pb_key.id),
  creator_signature: varchar({ length: 256 }),
});

export const Invoice_Item_Drugs = Finance.table('Invoice_Item_Drugs', {
  id: serial().primaryKey(),
  invoice_id: integer()
    .notNull()
    .references(() => Invoice_Drugs.id),
  item_id: integer()
    .notNull()
    .references(() => PharmacyStock_Drugs.id),
  amount: integer().notNull().default(1),
  unit_price: decimal({ precision: 10, scale: 5 }).notNull(),
});
