import { db } from '$lib/server/db';
import {
  Transfer,
  InPatient,
  Diagnosis,
  Patient_diagnosis,
  Discharge,
  Insurance_Doc,
  InPatient_file,
} from '$lib/server/db/schema/entities/patients';
import { Person, Person_IdDoc } from '$lib/server/db/schema/entities/people';
import { verifyEgyptianNationalId } from '$lib/utils/id-number-validation/egyptian-national-id';
import { eq, and } from 'drizzle-orm';
import { createDiagnosis } from '$lib/server/db/operations/menus';

export async function seedPatient(patient: App.CustomTypes['PatientSeedT']) {
  try {
    const new_patient = await db.transaction(async (tx) => {
      let foundPersonId: number | null = null;

      if (patient.id_doc_num) {
        let [firstResult] = await tx
          .select({ id: Person_IdDoc.person_id })
          .from(Person_IdDoc)
          .where(eq(Person_IdDoc.document_number, patient.id_doc_num));
        foundPersonId = firstResult?.id;
      }

      if (!foundPersonId) {
        let numberValidity;

        if (patient.id_doc_type === 1 && patient.id_doc_num) {
          try {
            numberValidity = verifyEgyptianNationalId(patient.id_doc_num);
            if (!numberValidity) patient.id_doc_num = patient.id_doc_num + ' INVALID';
          } catch (e) {
            patient.id_doc_num = patient.id_doc_num + ' INVALID';
          }
        }

        const {
          id: droppedPatientId,
          name: patient_name,
          ...restOfPatientData
        } = patient;
        const [first_name, father_name, grandfather_name, ...family_name] =
          patient_name.split(' ');
        let [newPersonInsert] = await tx
          .insert(Person)
          .values({
            ...restOfPatientData,
            first_name,
            father_name,
            grandfather_name,
            family_name: family_name.join(' '),
          })
          .returning();
        foundPersonId = newPersonInsert.id;

        if (patient.id_doc_num) {
          await tx.insert(Person_IdDoc).values({
            person_id: foundPersonId,
            document_type: patient.id_doc_type,
            document_number: patient.id_doc_num,
          });
        }
      }

      patient.person_id = foundPersonId;

      if (patient.admission_notes?.includes('مسجون')) {
        patient.security_status = true;
        patient.admission_notes?.replace('مسجون', '');
      }

      const [newPatient] = await tx
        .insert(InPatient)
        .values({
          person_id: foundPersonId,
          security_status: patient.security_status,
          recent_ward: patient.admission_ward,
        })
        .returning();

      await tx.insert(Transfer).values({
        patient_id: newPatient.id,
        to_ward_id: patient.admission_ward,
        timestamp: patient.admission_date,
        notes: 'admission',
      });

      const [admYear, admFileNumber] = patient.id.split('/').map(Number);

      const [newFile] = await tx
        .insert(InPatient_file)
        .values({
          patient_id: newPatient.id,
          year: admYear,
          number: admFileNumber,
        })
        .returning();

      if (patient.discharge_date && patient.discharge_reason) {
        await tx.insert(Discharge).values({
          patient_id: newPatient.id,
          discharge_reason: patient.discharge_reason,
          timestamp: patient.discharge_date,
        });
      }

      if (patient.health_insurance) {
        await tx.insert(Insurance_Doc).values({
          patient_id: newPatient.id,
          insurance_entity: 'الهيئة العامة للتأمين الصحي',
        });
      }

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
              patient.name
            );
            continue;
          }
        }

        await tx.insert(Patient_diagnosis).values({
          patient_id: newPatient.id,
          diagnosis_id: diagnosis.id,
          timestamp: patient.admission_date,
          type: 'Initial',
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

type seedTransferT = {
  patient_id: string;
  timestamp: Date;
  ward: number;
};

export async function seedPatientTransfer(transfer: seedTransferT) {
  try {
    const new_transfer = await db.transaction(async (tx) => {
      const [admYear, admFileNumber] = transfer.patient_id.split('/').map(Number);
      const [patient] = await tx
        .select()
        .from(InPatient_file)
        .where(
          and(eq(InPatient_file.year, admYear), eq(InPatient_file.number, admFileNumber))
        );

      const [transferInsert] = await tx
        .insert(Transfer)
        .values({
          patient_id: patient.patient_id,
          timestamp: transfer.timestamp,
          to_ward_id: transfer.ward,
        })
        .returning();

      await tx
        .update(InPatient)
        .set({ recent_ward: transfer.ward })
        .where(eq(InPatient.id, patient.patient_id));

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
