import {
  pgSchema,
  serial,
  varchar,
  bigint,
  integer,
  decimal,
  timestamp,
  date,
  smallint,
  bigserial,
  smallserial,
} from 'drizzle-orm/pg-core';
import { InPatient } from './patients';
import { Sec_pb_key } from './system';
import { Staff } from './hospital';
import { MedPlan } from './medication_plan';
import { Product_drug } from './drugs';

export const Pharmacy = pgSchema('Pharmacy');

export const StockCategory = Pharmacy.table('StockCategory', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 15 }).notNull(),
});

export const Stock_Drugs = Pharmacy.table('Stock_Drugs', {
  id: serial().primaryKey(),
  brand_name_id: integer()
    .notNull()
    .references(() => Product_drug.id),
  amount: integer().notNull(),
  unit_price: decimal({ precision: 10, scale: 5 }).notNull(),
  expiry_date: date(),
  batch_number: varchar({ length: 32 }),
  stock_category: smallint().references(() => StockCategory.id),
});

export const Transaction_Drugs = Pharmacy.table('Transaction_Drugs', {
  id: bigserial({ mode: 'bigint' }).primaryKey(),
  timestamp: timestamp({ withTimezone: true }).notNull(),
  item_id: integer()
    .notNull()
    .references(() => Stock_Drugs.id),
  amount: integer().notNull(),
  pharmacist_id: smallint()
    .notNull()
    .references(() => Staff.id),
  pharmacist_signature: varchar({ length: 256 }).notNull(),
  pharmacist_sign_key: bigint({ mode: 'bigint' })
    .notNull()
    .references(() => Sec_pb_key.id),
  patient_id: integer().references(() => InPatient.id),
  med_plan_id: bigint({ mode: 'bigint' }).references(() => MedPlan.id),
  dispensing_nurse_id: smallint().references(() => Staff.id),
});
