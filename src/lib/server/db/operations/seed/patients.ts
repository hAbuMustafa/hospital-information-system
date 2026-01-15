import { db } from '$lib/server/db';
import {
  Transfer,
  InPatient,
  Diagnosis,
  Patient_diagnosis,
  Discharge,
  Insurance_Doc,
  InPatient_file,
  Admission,
  inPatient_view,
} from '$lib/server/db/schema/entities/patients';
import { Person, Person_IdDoc } from '$lib/server/db/schema/entities/people';
import { verifyEgyptianNationalId } from '$lib/utils/id-number-validation/egyptian-national-id';
import { eq, and, like } from 'drizzle-orm';
import { createDiagnosis } from '$lib/server/db/operations/menus';
import type { PatientSeedT, seedDischargeT, seedTransferT } from '../types';

export async function seedPatientAdmission(admission: PatientSeedT) {
  try {
    const new_patient = await db.transaction(async (tx) => {
      let foundPersonId: number | null = null;

      if (admission.id_doc_num) {
        let [firstResult] = await tx
          .select({ id: Person_IdDoc.person_id })
          .from(Person_IdDoc)
          .where(like(Person_IdDoc.document_number, `${admission.id_doc_num}%`));
        foundPersonId = firstResult?.id;
      }

      if (!foundPersonId) {
        let numberValidity;

        if (admission.id_doc_type === 1 && admission.id_doc_num) {
          try {
            numberValidity = verifyEgyptianNationalId(admission.id_doc_num);
            if (!numberValidity) admission.id_doc_num = admission.id_doc_num + ' INVALID';
          } catch (e) {
            admission.id_doc_num = admission.id_doc_num + ' INVALID';
          }
        }

        const { name: patient_name, ...restOfPatientData } = admission;
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

        if (admission.id_doc_num) {
          await tx.insert(Person_IdDoc).values({
            person_id: foundPersonId,
            document_type: admission.id_doc_type,
            document_number: admission.id_doc_num,
          });
        }
      }

      admission.person_id = foundPersonId;

      if (admission.admission_notes?.includes('مسجون')) {
        admission.security_status = true;
        admission.admission_notes?.replace('مسجون', '');
      }

      const [newPatient] = await tx
        .insert(InPatient)
        .values({
          person_id: foundPersonId,
          security_status: admission.security_status,
          recent_ward: admission.admission_ward,
        })
        .returning();

      await tx.insert(Admission).values({
        patient_id: newPatient.id,
        admission_notes: admission.admission_notes,
        timestamp: admission.admission_date,
      });

      await tx.insert(Transfer).values({
        patient_id: newPatient.id,
        to_ward_id: admission.admission_ward,
        timestamp: admission.admission_date,
        notes: 'admission',
      });

      const [admYear, admFileNumber] = admission.file_id.split('/').map(Number);

      const [newFile] = await tx
        .insert(InPatient_file)
        .values({
          patient_id: newPatient.id,
          year: admYear,
          number: admFileNumber,
        })
        .returning();

      if (admission.health_insurance) {
        await tx.insert(Insurance_Doc).values({
          patient_id: newPatient.id,
          insurance_entity: 'الهيئة العامة للتأمين الصحي',
        });
      }

      const pDiagnoses = admission.diagnosis.split('+').map((d) => d.trim());

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
              admission.name
            );
            continue;
          }
        }

        await tx.insert(Patient_diagnosis).values({
          patient_id: newPatient.id,
          diagnosis_id: diagnosis.id,
          timestamp: admission.admission_date,
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

export async function seedPatientTransfer(transfer: seedTransferT) {
  try {
    const new_transfer = await db.transaction(async (tx) => {
      const [patient] = await tx
        .select()
        .from(inPatient_view)
        .where(and(eq(inPatient_view.patient_file_number, transfer.file_id)));

      const [transferInsert] = await tx
        .insert(Transfer)
        .values({
          patient_id: patient.patient_id,
          from_ward_id: patient.recent_ward_id,
          to_ward_id: transfer.ward,
          timestamp: transfer.timestamp,
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

export async function seedPatientDischarge(discharge: seedDischargeT) {
  try {
    const new_discharge = await db.transaction(async (tx) => {
      const [admYear, admFileNumber] = discharge.file_id.split('/').map(Number);
      const [patient] = await tx
        .select()
        .from(InPatient_file)
        .where(
          and(eq(InPatient_file.year, admYear), eq(InPatient_file.number, admFileNumber))
        );

      if (patient) {
        const [dischargeInsert] = await tx
          .insert(Discharge)
          .values({
            patient_id: patient.patient_id,
            discharge_reason: discharge.discharge_reason,
            timestamp: discharge.discharge_date,
          })
          .returning();

        return dischargeInsert;
      }
      return {
        message: 'no patient was found with the supplied file id',
      };
    });

    return {
      success: true,
      data: new_discharge,
    };
  } catch (error) {
    return {
      error,
    };
  }
}
