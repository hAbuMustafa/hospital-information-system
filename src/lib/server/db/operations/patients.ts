import { db } from '$lib/server/db';
import {
  Transfer,
  InPatient,
  Diagnosis,
  Patient_diagnosis,
  InPatient_file,
} from '$lib/server/db/schema/entities/patients';
import { Person } from '$lib/server/db/schema/entities/people';
import { eq, max } from 'drizzle-orm';
import type { newPatientT } from './types';

export async function createPatient(patient: newPatientT) {
  try {
    const new_patient = await db.transaction(async (tx) => {
      let foundPerson: typeof Person.$inferSelect | null = null;

      if (!patient.person_id) {
        if (patient.id_doc_num) {
          [foundPerson] = await tx
            .select()
            .from(Person)
            .where(eq(Person.id_doc_num, patient.id_doc_num));
        }

        if (!foundPerson) {
          const { id: droppedPatientId, ...restOfPatientData } = patient;
          [foundPerson] = await tx.insert(Person).values(restOfPatientData).returning();
        }

        patient.person_id = foundPerson.id;
      }

      const [newPatient] = await tx
        .insert(InPatient)
        .values({ ...patient, recent_ward: patient.admission_ward } as App.Require<
          newPatientT,
          'person_id'
        >)
        .returning();

      await tx.insert(Transfer).values({
        patient_id: newPatient.id,
        ward: patient.admission_ward,
        timestamp: patient.admission_date,
        notes: 'admission',
      });

      for (let i = 0; i < patient.diagnosis.length; i++) {
        const currentDiagnosisText = patient.diagnosis[i];

        let diagnosis: typeof Diagnosis.$inferSelect;

        const [foundDiagnosis] = await tx
          .select()
          .from(Diagnosis)
          .where(eq(Diagnosis.name, currentDiagnosisText));

        if (foundDiagnosis) {
          diagnosis = foundDiagnosis;
        } else {
          const newRow = await createDiagnosis(currentDiagnosisText, tx);

          if (newRow.success) {
            diagnosis = newRow.data;
          } else {
            console.error(
              'failed creating diagnosis',
              currentDiagnosisText,
              'for patient',
              newPatient.id,
              foundPerson?.name
            );
            continue;
          }
        }

        await tx.insert(Patient_diagnosis).values({
          patient_id: newPatient.id,
          diagnosis_id: diagnosis.id,
          timestamp: patient.admission_date,
        });
      }

      return newPatient;
    });

    return {
      success: true,
      data: new_patient,
    };
  } catch (error) {
    return {
      error,
    };
  }
}

export async function transferPatient(transfer: typeof Transfer.$inferInsert) {
  try {
    const new_transfer = await db.transaction(async (tx) => {
      const [transferInsert] = await tx.insert(Transfer).values(transfer).returning();

      await tx
        .update(InPatient)
        .set({ recent_ward: transfer.ward })
        .where(eq(InPatient.id, transfer.patient_id));

      return transferInsert;
    });

    return {
      success: true,
      data: new_transfer,
    };
  } catch (error) {
    return {
      error,
    };
  }
}

export async function dischargePatient(patientDischarge: {
  id: string;
  discharge_reason: number;
  discharge_date: Date;
  discharge_notes?: string;
}) {
  try {
    const [patient] = await db
      .update(InPatient)
      .set({
        discharge_date: patientDischarge.discharge_date,
        discharge_reason: patientDischarge.discharge_reason,
        discharge_notes: patientDischarge.discharge_notes ?? null,
      })
      .where(eq(InPatient.id, patientDischarge.id))
      .returning({ id: InPatient.id, person_id: InPatient.person_id });

    const [person] = await db
      .select()
      .from(Person)
      .where(eq(Person.id, patient.person_id));

    return {
      success: true,
      data: { id: patient.id, name: person.name },
    };
  } catch (error) {
    return {
      error,
    };
  }
}

export async function getLastPatientFileNumber(year: number) {
  const [num] = await db
    .select({ number: max(InPatient_file.number) })
    .from(InPatient_file)
    .where(eq(InPatient_file.year, year));

  return num?.number || 0;
}
