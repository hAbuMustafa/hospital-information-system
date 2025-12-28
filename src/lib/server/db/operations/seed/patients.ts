import { db } from '$lib/server/db';
import {
  Transfer,
  InPatient,
  Diagnosis,
  Patient_diagnosis,
} from '$lib/server/db/schema/entities/patients';
import { Person } from '$lib/server/db/schema/entities/people';
import { verifyEgyptianNationalId } from '$lib/utils/id-number-validation/egyptian-national-id';
import { eq } from 'drizzle-orm';

export async function seedPatient(patient: App.CustomTypes['PatientSeedT']) {
  try {
    const new_patient = await db.transaction(async (tx) => {
      let foundPerson: typeof Person.$inferSelect | null = null;

      if (!patient.person_id) {
        if (patient.id_doc_num) {
          [foundPerson] = await tx
            .select()
            .from(Person)
            .where(eq(Person.id_doc_num, patient.id_doc_num!));
        }

        if (!foundPerson) {
          let numberValidity;

          if (patient.id_doc_type === 1 && patient.id_doc_num) {
            try {
              numberValidity = verifyEgyptianNationalId(patient.id_doc_num);
              if (!numberValidity) patient.id_doc_num = patient.id_doc_num + ' INVALID';
            } catch (e) {
              patient.id_doc_num = patient.id_doc_num + ' INVALID';
            }
          }

          const { id: droppedPatientId, ...restOfPatientData } = patient;
          [foundPerson] = await tx.insert(Person).values(restOfPatientData).returning();
        }

        patient.person_id = foundPerson.id;
      }

      if (patient.admission_notes?.includes('مسجون')) {
        patient.security_status = true;
        patient.admission_notes?.replace('مسجون', '');
      }

      const [newPatient] = await tx
        .insert(InPatient)
        .values({
          ...patient,
          recent_ward: patient.admission_ward,
        } as App.Require<App.CustomTypes['PatientSeedT'], 'person_id'>)
        .returning();

      await tx.insert(Transfer).values({
        patient_id: newPatient.id,
        ward: patient.admission_ward,
        timestamp: patient.admission_date,
        notes: 'admission',
      });

      const pDiagnoses = patient.diagnosis.split('+').map((d) => d.trim());

      for (let i = 0; i < pDiagnoses.length; i++) {
        const currentDiagnosisText = pDiagnoses[i];

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
