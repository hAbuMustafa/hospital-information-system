import {
  pgSchema,
  bigserial,
  varchar,
  foreignKey,
  bigint,
  integer,
  decimal,
  text,
  timestamp,
  smallint,
} from 'drizzle-orm/pg-core';
import { InPatient } from './patients';
import { Formulary } from './pharmacy';
import { Staff } from './hospital';
import { Sec_pb_key } from './system';

export const MedicationPlan = pgSchema('MedicationPlan');

export const MedPlan = MedicationPlan.table(
  'MedPlan',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey(),
    timestamp: timestamp({ mode: 'date' }).notNull(),
    patient_id: integer()
      .notNull()
      .references(() => InPatient.id),
    medication_id: integer()
      .notNull()
      .references(() => Formulary.id),
    amount: decimal({ precision: 10, scale: 2 }).notNull(),
    amount_unit: varchar({ length: 15 }).notNull(),
    frequency: decimal({ precision: 10, scale: 2 }).notNull(),
    duration_days: decimal({ precision: 10, scale: 2 }).notNull(),
    mixed_with: bigint({ mode: 'bigint' }),
    discontinued_at: timestamp({ mode: 'date' }),
    discontinue_phys_id: smallint().references(() => Staff.id),
    discontinue_phys_signature: varchar({ length: 256 }),
    discontinue_phys_sign_key_id: bigint({ mode: 'bigint' }).references(
      () => Sec_pb_key.id
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.mixed_with],
      foreignColumns: [table.id],
      name: 'mixture_link',
    }),
  ]
);

export const MedPlan_note = MedicationPlan.table('MedPlan_note', {
  id: bigserial({ mode: 'bigint' }).primaryKey(),
  timestamp: timestamp({ mode: 'date' }).notNull(),
  med_plan_id: bigint({ mode: 'bigint' })
    .notNull()
    .references(() => MedPlan.id),
  note: text().notNull(),
  note_type: integer()
    .notNull()
    .references(() => MedPlan_note_type.id),
  author_id: smallint()
    .notNull()
    .references(() => Staff.id),
  author_signature: varchar({ length: 256 }).notNull(),
  author_sign_key_id: bigint({ mode: 'bigint' })
    .notNull()
    .references(() => Sec_pb_key.id),
});

export const MedPlan_note_type = MedicationPlan.table('MedPlan_note_type', {
  id: integer().primaryKey(),
  type: text().notNull(),
});

export const MedPlan_sign_nurse = MedicationPlan.table('MedPlan_sign_nurse', {
  med_plan_id: bigint({ mode: 'bigint' })
    .notNull()
    .references(() => MedPlan.id),
  nurse_id: smallint()
    .notNull()
    .references(() => Staff.id),
  nurse_signature: varchar({ length: 256 }).notNull(),
  nurse_sign_key_id: bigint({ mode: 'bigint' })
    .notNull()
    .references(() => Sec_pb_key.id),
  signature_time: timestamp({ mode: 'date' }).notNull(),
});

export const MedPlan_sign_pharm = MedicationPlan.table('MedPlan_sign_pharm', {
  med_plan_id: bigint({ mode: 'bigint' })
    .notNull()
    .references(() => MedPlan.id),
  pharm_id: smallint()
    .notNull()
    .references(() => Staff.id),
  pharm_signature: varchar({ length: 256 }).notNull(),
  pharm_signature_key_id: bigint({ mode: 'bigint' })
    .notNull()
    .references(() => Sec_pb_key.id),
  signature_time: timestamp({ mode: 'date' }).notNull(),
});

export const MedPlan_sign_phys = MedicationPlan.table('MedPlan_sign_phys', {
  med_plan_id: bigint({ mode: 'bigint' })
    .notNull()
    .references(() => MedPlan.id),
  phys_id: smallint()
    .notNull()
    .references(() => Staff.id),
  phys_signature: varchar({ length: 256 }).notNull(),
  phys_signature_key_id: bigint({ mode: 'bigint' })
    .notNull()
    .references(() => Sec_pb_key.id),
  signature_time: timestamp({ mode: 'date' }).notNull(),
});
