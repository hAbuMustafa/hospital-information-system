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
  pgView,
} from 'drizzle-orm/pg-core';
import { Staff, Ward } from './hospital';
import { Sec_pb_key } from './system';
import { Person } from './people';
import { sql } from 'drizzle-orm';

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

export const current_inPatient_view = pgView('current_inPatient_view', {
  patient_id: integer(),
  person_id: integer(),
  patient_file_number: varchar({ length: 8 }),
  patient_name: text(),
  id_doc_type: smallint(),
  id_doc_number: varchar({ length: 45 }),
  meal_type: varchar({ length: 45 }),
  recent_ward_id: smallint(),
  ward_name: varchar({ length: 10 }),
  ward_floor: integer(),
  ward_tags: text(),
  security_status: boolean(),
  gender: boolean(),
  birthdate: date(),
  discharge_order_id: integer(),
  discharge_time: timestamp(),
  discharge_reason: varchar({ length: 15 }),
  discharge_notes: text(),
}).as(
  sql`
SELECT 
	p.id as patient_id,
	p.person_id,
	p.file_id as patient_file_number,
	CONCAT_WS(' ', pr.first_name, pr.father_name, pr.grandfather_name, pr.family_name) as "patient_name",
	doc.document_type as id_doc_type,
	doc.document_number as id_doc_number,
  i.insurance_number as health_insurance,
	p.meal_type,
	p.recent_ward as recent_ward_id,
	w.name as ward_name,
	w.floor as ward_floor,
	w.tags as ward_tags,
	p.security_status,
	pr.gender,
	pr.birthdate,
	d.discharge_order_id,
	d.timestamp as discharge_time,
	r.reason as discharge_reason,
	d.notes as discharge_notes
FROM "Patient"."InPatient" p 
INNER JOIN "People"."Person" pr on p.person_id = pr.id
INNER JOIN "People"."Person_IdDoc" doc on doc.person_id = pr.id
INNER JOIN "Patient"."Insurance_Doc" i on i.patient_id = p.id
INNER JOIN "Hospital"."Ward" w on p.recent_ward = w.id
INNER JOIN "Patient"."Discharge" d on d.patient_id = p.id
INNER JOIN "Patient"."Discharge_Reason" r on d.discharge_reason = r.id
WHERE d.timestamp IS NOT NULL;
`
);

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
