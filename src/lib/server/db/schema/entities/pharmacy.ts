import {
  pgSchema,
  serial,
  varchar,
  foreignKey,
  bigint,
  integer,
  decimal,
  boolean,
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

export const Pharmacy = pgSchema('Pharmacy');

export const ActiveIngredient = Pharmacy.table('ActiveIngredient', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  name_ar: varchar({ length: 100 }).notNull(),
  alias: varchar({ length: 45 }),
});

// Represents only ISO Units (liter, Gram, .. etc) without modifiers (milli-, Kilo-)
export const ActiveIngredient_Unit = Pharmacy.table('ActiveIngredient_Unit', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 2 }).notNull(),
  name_ar: varchar({ length: 2 }).notNull(),
  fullname: varchar({ length: 15 }).notNull(),
  fullname_ar: varchar({ length: 15 }).notNull(),
});

export const ActiveIngredient_Role = Pharmacy.table('ActiveIngredient_Role', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 15 }).notNull(),
  name_ar: varchar({ length: 15 }).notNull(),
});

// Modifier for parts (nano, micro, milli-, centi-, deci-) and multipliers (Kilo-, Mega-, Giga-)
export const ActiveIngredient_Unit_Modifier = Pharmacy.table(
  'ActiveIngredient_Unit_Modifier',
  {
    id: smallserial().primaryKey(),
    name: varchar({ length: 2 }).notNull(),
    name_ar: varchar({ length: 2 }).notNull(),
    multiplier: decimal().notNull(),
  },
);

// (Bottle, Tablet, .. etc)
export const DosageForm_SizeUnit = Pharmacy.table('DosageForm_SizeUnit', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 15 }),
  name_ar: varchar({ length: 15 }),
});

export const ActiveIngredient_Use = Pharmacy.table('ActiveIngredient_Use', {
  ac_id: smallint().references(() => ActiveIngredient.id),
  use_id: smallint().references(() => Usage.id),
});

export const BrandName = Pharmacy.table('BrandName', {
  id: smallserial().primaryKey(),
  formulary_id: integer().references(() => Formulary.id),
  name: varchar({ length: 45 }).notNull(),
  name_ar: varchar({ length: 45 }),
  size: decimal({ precision: 10, scale: 5 }),
  size_unit: smallint().references(() => DosageForm_SizeUnit.id),
  unit_representation: varchar({ length: 3 }),
  is_imported: boolean(),
  modifier: varchar({ length: 20 }), // (eg. ROM or With Rubber Cap)
  smc_code: integer(),
  producer: varchar({ length: 45 }),
});

export const DosageUnit_look_like = Pharmacy.table('DosageUnit_look_like', {
  brand_name_id: smallint()
    .notNull()
    .references(() => BrandName.id),
  look_like_id: smallint()
    .notNull()
    .references(() => BrandName.id),
});

export const Formulary = Pharmacy.table('Formulary', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  cat_strategy: boolean().default(false),
  cat_high_concentration_electrolyte: boolean().default(false),
  cat_dangerous: boolean().default(false),
  upa_code: bigint({ mode: 'bigint' }),
});

export const Formulary_ROA = Pharmacy.table('Formulary_ROA', {
  formulary_id: smallint().references(() => Formulary.id),
  roa: smallint()
    .notNull()
    .references(() => RouteOfAdministration.id),
});

export const Formulation = Pharmacy.table(
  'Formulation',
  {
    id: serial().primaryKey(),
    formulary_id: smallint().references(() => Formulary.id),
    ac_id: smallint().references(() => ActiveIngredient.id),
    amount: decimal({ precision: 10, scale: 5 }).notNull(),
    amount_unit: smallint()
      .notNull()
      .references(() => ActiveIngredient_Unit.id)
      .notNull(),
    unit_representation: smallint().references(() => ActiveIngredient_Unit_Modifier.id),
    role: varchar({ length: 45 }).notNull(),
    role_target: integer(),
  },
  (table) => [
    foreignKey({
      columns: [table.role_target],
      foreignColumns: [table.id],
      name: 'ac_role_target_link',
    }),
  ],
);

export const RouteOfAdministration = Pharmacy.table('RouteOfAdministration', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 15 }).notNull(),
});

export const DosageForm = Pharmacy.table('DosageForm', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 15 }).notNull(),
});

export const StockCategory = Pharmacy.table('StockCategory', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 15 }).notNull(),
});

export const Usage = Pharmacy.table('Usage', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 45 }).notNull(),
});

export const PharmacyStock_Drugs = Pharmacy.table('PharmacyStock_Drugs', {
  id: serial().primaryKey(),
  brand_name_id: smallint()
    .notNull()
    .references(() => BrandName.id),
  amount: integer().notNull(),
  unit_price: decimal({ precision: 10, scale: 5 }).notNull(),
  expiry_date: date({ mode: 'date' }),
  batch_number: varchar({ length: 32 }),
  stock_category: smallint().references(() => StockCategory.id),
});

export const PharmacyTransaction_Drugs = Pharmacy.table('PharmacyTransaction_Drugs', {
  id: bigserial({ mode: 'bigint' }).primaryKey(),
  timestamp: timestamp({ mode: 'date' }).notNull(),
  item_id: integer()
    .notNull()
    .references(() => PharmacyStock_Drugs.id),
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
