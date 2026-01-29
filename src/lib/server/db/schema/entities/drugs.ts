import {
  pgSchema,
  serial,
  varchar,
  char,
  foreignKey,
  bigint,
  integer,
  decimal,
  boolean,
  smallint,
  smallserial,
} from 'drizzle-orm/pg-core';

export const Drug = pgSchema('Drug');

export const ActiveIngredient = Drug.table('ActiveIngredient', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  name_ar: varchar({ length: 100 }).notNull(),
  alias: varchar({ length: 45 }),
});

// Represents only ISO Units (liter, Gram, .. etc) without modifiers (milli-, Kilo-)
export const ActiveIngredient_Unit = Drug.table('ActiveIngredient_Unit', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 2 }).notNull(),
  name_ar: varchar({ length: 2 }).notNull(),
  fullname: varchar({ length: 15 }).notNull(),
  fullname_ar: varchar({ length: 15 }).notNull(),
});

export const ActiveIngredient_Role = Drug.table('ActiveIngredient_Role', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 15 }).notNull(),
  name_ar: varchar({ length: 15 }).notNull(),
});

// Modifier for parts (nano-, micro-, milli-, centi-, deci-) and multipliers (Kilo-, Mega-, Giga-)
export const ActiveIngredient_Unit_Modifier = Drug.table(
  'ActiveIngredient_Unit_Modifier',
  {
    id: smallserial().primaryKey(),
    name: varchar({ length: 2 }).notNull(),
    name_ar: varchar({ length: 2 }).notNull(),
    multiplier: decimal().notNull(),
  },
);

// (Bottle, Tablet, .. etc)
export const ProductUnit = Drug.table('ProductUnit', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 15 }),
  name_ar: varchar({ length: 15 }),
});

export const ActiveIngredient_Use = Drug.table('ActiveIngredient_Use', {
  id: smallserial().primaryKey(),
  ac_id: smallint().references(() => ActiveIngredient.id),
  use_id: smallint().references(() => Usage.id),
});

export const Product_drug = Drug.table('Product_drug', {
  id: smallserial().primaryKey(),
  formulary_id: integer().references(() => Formulary.id),
  name: varchar({ length: 45 }).notNull(),
  name_ar: varchar({ length: 45 }),
  size: decimal({ precision: 10, scale: 5 }),
  size_unit: smallint().references(() => ProductUnit.id),
  unit_representation: varchar({ length: 3 }),
  is_imported: boolean(),
  modifier: varchar({ length: 20 }), // (eg. ROM or With Rubber Cap)
  smc_code: integer(),
  producer: varchar({ length: 45 }),
});

export const DosageUnit_look_like = Drug.table('DosageUnit_look_like', {
  id: smallserial().primaryKey(),
  brand_name_id: smallint()
    .notNull()
    .references(() => Product_drug.id),
  look_like_id: smallint()
    .notNull()
    .references(() => Product_drug.id),
});

export const Formulary = Drug.table('Formulary', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  cat_strategy: boolean().default(false),
  cat_high_concentration_electrolyte: boolean().default(false),
  cat_dangerous: boolean().default(false),
  upa_code: bigint({ mode: 'bigint' }),
  formulation_cat_id: smallint()
    .references(() => Formulation_Dosing_Category.id)
    .notNull(),
});

export const Formulation = Drug.table(
  'Formulation',
  {
    id: serial().primaryKey(),
    formulary_id: smallint().references(() => Formulary.id),
    ac_id: smallint().references(() => ActiveIngredient.id),
    amount: decimal({ precision: 10, scale: 6 }).notNull(),
    amount_unit: smallint()
      .notNull()
      .references(() => ActiveIngredient_Unit.id)
      .notNull(),
    amount_unit_fraction: smallint().references(() => ActiveIngredient_Unit_Modifier.id),
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

// strategy, high_concentration_electrolyte, dangerous
export const FormulaCategory = Drug.table('FormulaCategory', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 30 }).notNull(),
  color: char({ length: 6 }),
});

export const Formulary_category = Drug.table('Formulary_category', {
  id: serial().primaryKey(),
  formula_id: smallint().references(() => Formulary.id),
  category_id: smallint().references(() => FormulaCategory.id),
});

export const Formulary_ROA = Drug.table('Formulary_ROA', {
  id: smallserial().primaryKey(),
  formulary_id: smallint().references(() => Formulary.id),
  roa: smallint()
    .notNull()
    .references(() => RouteOfAdministration.id),
});

// Helps calculate concentrations
// compressed, metered, powder for reconstitution, solution, spreadable
export const Formulation_Dosing_Category = Drug.table('Dosing_category', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 25 }).notNull(),
});

export const RouteOfAdministration = Drug.table('RouteOfAdministration', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 15 }).notNull(),
});

export const DosageForm = Drug.table('DosageForm', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 15 }).notNull(),
});

export const Usage = Drug.table('Usage', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 45 }).notNull(),
});
