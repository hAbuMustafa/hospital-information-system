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
} from 'drizzle-orm/pg-core';
import { InPatient } from './patients';
import { Sec_pb_key, User } from './system';

export const Pharmacy = pgSchema('Pharmacy');

export const ActiveIngredient = Pharmacy.table('ActiveIngredient', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  name_ar: varchar({ length: 100 }).notNull(),
  alias: varchar({ length: 45 }),
});

// Represents only ISO Units (liter, Gram, .. etc) without modifiers (milli-, Kilo-)
export const ActiveIngredient_Unit = Pharmacy.table('ActiveIngredient_Unit', {
  id: integer().primaryKey(),
  name: varchar({ length: 15 }),
  name_ar: varchar({ length: 15 }),
});

// (Bottle, Tablet, .. etc)
export const DosageForm_SizeUnit = Pharmacy.table('DosageForm_SizeUnit', {
  id: integer().primaryKey(),
  name: varchar({ length: 15 }),
  name_ar: varchar({ length: 15 }),
});

export const ActiveIngredient_Use = Pharmacy.table('ActiveIngredient_Use', {
  ac_id: integer().references(() => ActiveIngredient.id),
  use_id: integer().references(() => Use.id),
});

export const BrandName = Pharmacy.table('BrandName', {
  id: serial().primaryKey(),
  formulary_id: integer().references(() => Formulary.id),
  name: varchar({ length: 45 }).notNull(),
  name_ar: varchar({ length: 45 }),
  size: decimal({ precision: 10, scale: 5 }),
  size_unit: integer().references(() => DosageForm_SizeUnit.id),
  unit_representation: varchar({ length: 3 }),
  is_imported: boolean(),
  modifier: varchar({ length: 20 }), // (eg. ROM or With Rubber Cap)
  smc_code: integer(),
  producer: varchar({ length: 45 }),
});

export const DosageUnit_look_like = Pharmacy.table('DosageUnit_look_like', {
  brand_name_id: integer()
    .notNull()
    .references(() => BrandName.id),
  look_like_id: integer()
    .notNull()
    .references(() => BrandName.id),
});

export const Formulary = Pharmacy.table('Formulary', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  cat_strategy: boolean().default(false),
  cat_high_concentration_electrolyte: boolean().default(false),
  cat_dangerous: boolean().default(false),
  upa_code: bigint({ mode: 'bigint' }),
});

export const Formulary_ROA = Pharmacy.table('Formulary_ROA', {
  formulary_id: integer().references(() => Formulary.id),
  roa: integer()
    .notNull()
    .references(() => RouteOfAdministration.id),
});

export const Formulation = Pharmacy.table(
  'Formulation',
  {
    id: serial().primaryKey(),
    formulary_id: integer().references(() => Formulary.id),
    ac_id: integer().references(() => ActiveIngredient.id),
    amount: decimal({ precision: 10, scale: 5 }).notNull(),
    amount_unit: integer()
      .notNull()
      .references(() => ActiveIngredient_Unit.id),
    unit_representation: varchar({ length: 3 }).notNull(), // Modifier for parts (nano, micro, milli-, centi-, deci-) and multipliers (Kilo-, Mega-, Giga-)
    role: varchar({ length: 45 }).notNull(),
    role_target: bigint({ mode: 'bigint' }),
  },
  (table) => [
    foreignKey({
      columns: [table.role_target],
      foreignColumns: [table.id],
      name: 'ac_role_target_link',
    }),
  ]
);

export const RouteOfAdministration = Pharmacy.table('RouteOfAdministration', {
  id: integer().primaryKey(),
  name: varchar({ length: 15 }).notNull(),
});

export const DosageForm = Pharmacy.table('DosageForm', {
  id: integer().primaryKey(),
  name: varchar({ length: 15 }).notNull(),
});

export const StockCategory = Pharmacy.table('StockCategory', {
  id: integer().primaryKey(),
  name: varchar({ length: 15 }).notNull(),
});

export const Use = Pharmacy.table('Use', {
  id: integer().primaryKey(),
  use: varchar({ length: 45 }).notNull(),
});

export const Invoice = Pharmacy.table('Invoice', {
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

// TEMPLATE: for all Pharmacies
/*
export const Invoice_Items = Pharmacy.table('Invoice_Items', {
  id: serial().primaryKey(),
  invoice_id: integer()
    .notNull()
    .references(() => Invoice.id),
  item_id: int()
    .notNull()
    .references(() => Ph_InEco_Stock.id),
  amount: int().notNull().default(1),
  unit_price: decimal({ precision: 10, scale: 5 }).notNull(),
});

  export const Ph_InEco = Pharmacy.table('Ph_InEco', {
   id: serial().primaryKey(),
   brand_name_id: integer()
     .notNull()
     .references(() => BrandNames.id),
   amount: int().notNull(),
   unit_price: decimal({ precision: 10, scale: 5 }).notNull(),
   expiry_date: date({ mode: 'date' }),
   batch_number: varchar({ length: 32 }),
   stock_category: int().reference(()=>StockCategory.id),
 });

 export const Ph_InEco_Transaction = Pharmacy.table('Ph_InEco_Transaction', {
   id: serial().primaryKey(),
   timestamp: timestamp({ mode: 'date' }).notNull(),
   item_id: bigint({ mode: "bigint" })
     .notNull()
     .references(() => Ph_InEco.id),
   amount: int().notNull(),
   pharm_id: smallint()
     .notNull()
     .references(() => Staff.id),
   pharm_signature: varchar({ length: 256 }).notNull(),
   pharm_sign_key: bigint({ mode: "bigint" })
     .notNull()
     .references(() => Sec_pb_key.id),
   med_plan_id: bigint({ mode: "bigint" }).references(() => MedPlan.id),
   dispensing_nurse_id: smallint().references(() => Staff.id),
 });
*/
