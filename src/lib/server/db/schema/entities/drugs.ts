import {
  pgSchema,
  serial,
  varchar,
  text,
  char,
  foreignKey,
  bigint,
  integer,
  decimal,
  boolean,
  smallint,
  smallserial,
  numeric,
} from 'drizzle-orm/pg-core';

export const Drug = pgSchema('Drug');

export const ActiveIngredient = Drug.table('ActiveIngredient', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  name_ar: varchar({ length: 100 }).notNull(),
  alias: varchar({ length: 45 }),
  alias_ar: varchar({ length: 45 }),
});

// Represents only ISO Units (Gram, iu .. etc) without modifiers (milli-, Kilo-)
export const PreparationUnit = Drug.table('PreparationUnit', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 2 }).notNull(),
  name_ar: varchar({ length: 2 }).notNull(),
  fullname: varchar({ length: 15 }).notNull(),
  fullname_ar: varchar({ length: 15 }).notNull(),
});

// The role in a formula according to other ingredients (e.g. synergist, additive, excipient, ...etc)
export const ActiveIngredient_Role = Drug.table('ActiveIngredient_Role', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 15 }).notNull(),
  name_ar: varchar({ length: 15 }).notNull(),
});

// Modifier for parts (nano-, micro-, milli-, centi-, deci-) and multipliers (Kilo-, Mega-, Giga-)
export const PreparationUnit_modifier = Drug.table('PreparationUnit_modifier', {
  id: smallserial().primaryKey(),
  name: char({ length: 1 }).notNull(),
  name_ar: varchar({ length: 2 }).notNull(),
});

// The smallest sale unit
// (Bottle, Tube, blister-pack, jar .. etc)
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

// The product itself (Brand-name) packages.
export const Product_drug = Drug.table('Product_drug', {
  id: serial().primaryKey(),
  formulary_id: integer().references(() => Formulary.id),
  name: varchar({ length: 45 }).notNull(),
  name_ar: varchar({ length: 45 }),
  product_unit_id: smallint().references(() => ProductUnit.id),
  volume_in_ml: numeric({ precision: 7, scale: 2, mode: 'number' }).default(1.0), // for liquid forms only
  is_imported: boolean(),
  smc_code: integer(),
});

// package info
export const Product_Drug_Package = Drug.table('Product_Package', {
  id: serial().primaryKey(),
  product_drug_id: integer()
    .references(() => Product_drug.id)
    .notNull(),
  quantity: smallint().notNull(),
  unit_id: smallint().references(() => ProductUnit.id),
  gtin: bigint({ mode: 'bigint' }).unique(),
  producer: varchar({ length: 45 }),
});

// List for products whom their shape, or appearance could be deceptively misleading or mistakenly dispensed.
export const Product_looks_like = Drug.table('Product_looks_like', {
  id: smallserial().primaryKey(),
  brand_name_id: integer()
    .notNull()
    .references(() => Product_drug.id),
  look_like_id: integer()
    .notNull()
    .references(() => Product_drug.id),
});

// Index of all available formulae. Each formula should have a separate identifier if it should be administered through a different route, or it has a different concentration.
export const Formulary = Drug.table('Formulary', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  name_ar: varchar({ length: 100 }).notNull(),
  upa_code: bigint({ mode: 'bigint' }),
  formulation_category_id: smallint()
    .references(() => FormulationCategory.id)
    .notNull(),
});

// the ingredients of every formula
export const Formulation = Drug.table(
  'Formulation',
  {
    id: serial().primaryKey(),
    formulary_id: smallint().references(() => Formulary.id),
    ac_id: smallint().references(() => ActiveIngredient.id),
    amount: decimal({ precision: 10, scale: 6 }).notNull(),
    amount_unit: smallint()
      .notNull()
      .references(() => PreparationUnit.id)
      .notNull(),
    amount_unit_fraction: smallint().references(() => PreparationUnit_modifier.id),
    is_per_ml: boolean().notNull().default(false),
    role: varchar({ length: 45 }).notNull(),
    role_target: integer(),
  },
  (table) => [
    foreignKey({
      columns: [table.role_target],
      foreignColumns: [table.id],
      name: 'ac_role_target_link',
    }),
  ]
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

// Helps calculate concentrations:
// 'compressed', --> tab. / cap. / transdermal patch / pessary / supp.
// 'metered', --> mdi
// 'powder for reconstitution', --> vial / susp.
// 'solution', --> inj. / neb. solution / syp. / tpn sol. / vol. expanders
// 'bulk', --> cream / oint. / gel
export const FormulationCategory = Drug.table('FormulationCategory', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 25 }).notNull(),
  name_ar: varchar({ length: 25 }).notNull(),
});

// Routes of dosage administration (e.g. Oral[for tablets and syrups], transdermal [patches and creams], ...etc)
export const RouteOfAdministration = Drug.table('RouteOfAdministration', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 15 }).notNull(),
});

// Pharmaceutical Effect (e.g. antihypertensive, CNS stimulant, ...etc)
export const Usage = Drug.table('Usage', {
  id: smallserial().primaryKey(),
  name: varchar({ length: 45 }).notNull(),
});
