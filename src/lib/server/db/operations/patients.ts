import { db } from '$lib/server/db';
import {
  Transfer,
  InPatient,
  Diagnosis,
  Patient_diagnosis,
  InPatient_file,
  Admission,
  Insurance_Doc,
  transfers_view,
  Discharge,
} from '$lib/server/db/schema/entities/patients';
import { Person } from '$lib/server/db/schema/entities/people';
import { eq, max } from 'drizzle-orm';
import type { newPatientT } from './types';
import { createDiagnosis } from './menus';

export async function createAdmission(patient: newPatientT) {
  try {
    const new_patient = await db.transaction(async (tx) => {
      const [newPatient] = await tx
        .insert(InPatient)
        .values({
          person_id: patient.person_id,
          recent_ward: patient.admission_ward,
          security_status: patient.security_status,
        })
        .returning();

      await tx.insert(InPatient_file).values({
        number: patient.file_number,
        patient_id: newPatient.id,
        year: patient.admission_date.getFullYear() - 2000,
      });

      await tx.insert(Admission).values({
        patient_id: newPatient.id,
        admission_notes: patient.admission_notes,
        timestamp: patient.admission_date,
        referred_from: patient.referred_from,
      });

      await tx.insert(Transfer).values({
        patient_id: newPatient.id,
        to_ward_id: patient.admission_ward,
        timestamp: patient.admission_date,
        notes: 'admission',
      });

      if (patient.health_insurance) {
        await tx.insert(Insurance_Doc).values({
          patient_id: newPatient.id,
          insurance_entity: 'الهيئة العامة للتأمين الصحي',
        });
      }

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
          const newDiagnosis = await createDiagnosis(currentDiagnosisText, tx);

          if (newDiagnosis.success) {
            diagnosis = newDiagnosis.data;
          } else {
            console.error(
              'failed creating diagnosis',
              currentDiagnosisText,
              'for patient',
              newPatient.id
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
        .set({ recent_ward: transfer.to_ward_id })
        .where(eq(InPatient.id, transfer.patient_id));

      const [afterInsert] = await tx
        .select()
        .from(transfers_view)
        .where(eq(transfers_view.id, transferInsert.id));

      return afterInsert;
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

export async function dischargePatient(patientDischarge: typeof Discharge.$inferInsert) {
  try {
    const [discharge] = await db.insert(Discharge).values(patientDischarge).returning();

    return {
      success: true,
      data: discharge,
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
    .where(eq(InPatient_file.year, year - 2000));

  return num?.number || 0;
}
