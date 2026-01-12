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
  check,
  unique,
} from 'drizzle-orm/pg-core';
import { Staff, Ward } from './hospital';
import { Sec_pb_key } from './system';
import { Person } from './people';
import { sql } from 'drizzle-orm';

export const Patient = pgSchema('Patient');

export const InPatient = Patient.table('InPatient', {
  id: serial().primaryKey(),
  person_id: integer()
    .notNull()
    .references(() => Person.id),
  meal_type: varchar({ length: 45 }),
  recent_ward: smallint()
    .notNull()
    .references(() => Ward.id),
  security_status: boolean().default(false),
});

export const InPatient_file = Patient.table(
  'InPatient_file',
  {
    id: serial().primaryKey(),
    year: smallint().notNull(),
    number: smallint().notNull(),
    patient_id: integer()
      .references(() => InPatient.id)
      .notNull(),
  },
  (table) => [
    check(
      'year_check',
      sql`${table.year} >= (2024-2000) AND ${table.year} <= (date_part('year', CURRENT_DATE)-2000)`
    ),
    unique('unique_file_number_in_a_year').on(table.year, table.number),
  ]
);

export const inPatient_view = Patient.view('inPatient_view', {
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
SELECT p.id AS patient_id,
p.person_id,
CONCAT(pf.year, '/', pf.number) AS patient_file_number,
CONCAT_WS(' ', pr.first_name, pr.father_name, pr.grandfather_name, pr.family_name) AS patient_name,
doc.document_type AS id_doc_type,
doc.document_number AS id_doc_number,
i.insurance_entity AS health_insurance,
p.meal_type,
p.recent_ward AS recent_ward_id,
w.name AS ward_name,
w.floor AS ward_floor,
w.tags AS ward_tags,
p.security_status,
pr.gender,
pr.birthdate,
d.discharge_order_id,
d."timestamp" AS discharge_time,
r.name AS discharge_reason,
d.notes AS discharge_notes
FROM "Patient"."InPatient" p
 LEFT JOIN "People"."Person" pr ON p.person_id = pr.id
 LEFT JOIN "Patient"."InPatient_file" pf ON p.id = pf.patient_id
 LEFT JOIN "People"."Person_IdDoc" doc ON doc.person_id = pr.id
 LEFT JOIN "Patient"."Insurance_Doc" i ON i.patient_id = p.id
 LEFT JOIN "Hospital"."Ward" w ON p.recent_ward = w.id
 LEFT JOIN "Patient"."Discharge" d ON d.patient_id = p.id
 LEFT JOIN "Patient"."Discharge_Reason" r ON d.discharge_reason = r.id
ORDER BY p.id
`
);

export const Insurance_Doc = Patient.table('Insurance_Doc', {
  id: serial().primaryKey(),
  patient_id: integer()
    .notNull()
    .references(() => InPatient.id),
  insurance_entity: varchar({ length: 45 }),
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
  name: varchar({ length: 32 }).notNull(),
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
