import {
  pgSchema,
  serial,
  varchar,
  bigint,
  integer,
  decimal,
  text,
  date,
  boolean,
  timestamp,
  smallint,
} from 'drizzle-orm/pg-core';
import { Staff, Ward } from './hospital';
import { Sec_pb_key } from './system';
import { Person } from './people';

export const Patient = pgSchema('Patient');

export const InPatient = Patient.table('InPatient', {
  id: serial().primaryKey(),
  file_id: varchar({ length: 8 }), // Archive File Number
  person_id: integer()
    .notNull()
    .references(() => Person.id),
  meal_type: varchar({ length: 45 }),
  recent_ward: smallint()
    .notNull()
    .references(() => Ward.id),
  security_status: boolean().default(false),
});

export const Insurance_Doc = Patient.table('Insurance_Doc', {
  patient_id: integer()
    .notNull()
    .references(() => InPatient.id),
  insurance_entity: varchar({ length: 45 }).notNull(),
  insurance_number: varchar({ length: 30 }),
  type: varchar({ length: 45 }),
  valid_from_date: date({ mode: 'date' }),
  expiration_date: date({ mode: 'date' }),
  stay: varchar({ length: 45 }),
  medication_deductible_percent: decimal(),
  lab_deductible_percent: decimal(),
  radiology_deductible_percent: decimal(),
  dental_deductible_percent: decimal(),
  maternal_deductible_percent: decimal(),
});

export const Diagnosis = Patient.table('Diagnosis', {
  id: serial().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  icd11: varchar({ length: 45 }),
});

export const Patient_diagnosis = Patient.table('Patient_diagnosis', {
  patient_id: integer()
    .notNull()
    .references(() => InPatient.id),
  diagnosis_id: integer()
    .notNull()
    .references(() => Diagnosis.id),
  timestamp: timestamp({ mode: 'date' }).notNull(),
  type: varchar({ length: 45 }),
  diagnosing_phys_id: smallint().references(() => Staff.id),
  diagnosing_phys_signature: varchar({ length: 256 }),
  diagnosing_phys_sign_key_id: bigint({ mode: 'bigint' }).references(() => Sec_pb_key.id),
});

export const Admission_Order = Patient.table('Admission_Order', {
  id: serial().primaryKey(),
  person_id: integer()
    .references(() => Person.id)
    .notNull(),
  notes: text(),
  timestamp: timestamp({ mode: 'date' }).notNull().defaultNow(),
  referred_from: varchar({ length: 100 }).default('reception'),
  admitting_phys: smallint()
    .references(() => Staff.id)
    .notNull(),
  admitting_phys_signature: varchar({ length: 256 }).notNull(),
  admitting_phys_sign_key_id: bigint({ mode: 'bigint' })
    .references(() => Sec_pb_key.id)
    .notNull(),
});

export const Admission = Patient.table('Admission', {
  id: integer().primaryKey(),
  patient_id: integer()
    .references(() => InPatient.id)
    .notNull(),
  admission_order_id: integer().references(() => Admission_Order.id),
  admission_notes: text(),
  timestamp: timestamp({ mode: 'date' }).notNull().defaultNow(),
  registrar: smallint().references(() => Staff.id),
});

export const Discharge_Reason = Patient.table('Discharge_Reason', {
  id: integer().primaryKey(),
  reason: varchar({ length: 15 }).notNull(),
});

export const Discharge_Order = Patient.table('Discharge_Order', {
  id: serial().primaryKey(),
  patient_id: integer()
    .references(() => InPatient.id)
    .notNull(),
  notes: text(),
  phys_id: smallint()
    .references(() => Staff.id)
    .notNull(),
  phys_signature: varchar({ length: 256 }).notNull(),
  phys_sign_key: bigint({ mode: 'bigint' })
    .references(() => Sec_pb_key.id)
    .notNull(),
  timestamp: timestamp({ mode: 'date' }).notNull(),
});

export const Discharge = Patient.table('Discharge', {
  id: serial().primaryKey(),
  patient_id: integer()
    .notNull()
    .references(() => InPatient.id),
  discharge_order_id: integer().references(() => Discharge_Order.id),
  timestamp: timestamp({ mode: 'date' }).notNull(),
  discharge_reason: integer()
    .notNull()
    .references(() => Discharge_Reason.id),
  notes: text(),
  registrar: smallint().references(() => Staff.id),
  registrar_signature: varchar({ length: 256 }),
  registrar_sign_key: bigint({ mode: 'bigint' }).references(() => Sec_pb_key.id),
});

export const Transfer_Order = Patient.table('Transfer_Order', {
  id: serial().primaryKey(),
  patient_id: integer()
    .notNull()
    .references(() => InPatient.id),
  to_ward: smallint()
    .notNull()
    .references(() => Ward.id),
  notes: text(),
  phys_id: smallint()
    .notNull()
    .references(() => Staff.id),
  phys_signature: varchar({ length: 256 }).notNull(),
  phys_sign_key_id: bigint({ mode: 'bigint' })
    .notNull()
    .references(() => Sec_pb_key.id),
  timestamp: timestamp({ mode: 'date' }).notNull(),
});

export const Transfer = Patient.table('Transfer', {
  id: serial().primaryKey(),
  patient_id: integer()
    .notNull()
    .references(() => InPatient.id),
  from_ward_id: smallint().references(() => Ward.id),
  to_ward_id: smallint()
    .notNull()
    .references(() => Ward.id),
  transfer_order_id: integer().references(() => Transfer_Order.id),
  notes: text(),
  timestamp: timestamp({ mode: 'date' }).notNull(),
});
