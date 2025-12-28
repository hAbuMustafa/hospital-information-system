import { floors, new_id_doc_type, new_Wards } from '$lib/server/db/menus';
import { getDiagnoses, isAdmitted } from '$lib/server/db/operations/utils';
import { createPatient } from '$lib/server/db/operations/patients';
import { failWithFormFieldsAndMessageArrayBuilder } from '$lib/utils/form-actions';
import { verifyEgyptianNationalId } from '$lib/utils/id-number-validation/egyptian-national-id.js';
import { DrizzleQueryError } from 'drizzle-orm';

export async function load() {
  const diagnoses_list = await getDiagnoses();

  return {
    title: 'تسجيل دخول مريض',
    id_doc_type_list: new_id_doc_type,
    wards_list: new_Wards,
    floors_list: floors,
    diagnoses_list,
  };
}

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();

    // Person Data
    let personId = data.get('person_id') as unknown as number;
    const patientName = data.get('name') as unknown as string;
    let idDocType = data.get('id_doc_type') as unknown as number;
    const idDocNum = data.get('id_doc_num') as unknown as string;
    let gender = data.get('gender') as unknown as boolean;
    let birthdate = data.get('birthdate') as unknown as Date;

    // Patient Data
    let patientFileNumber = data.get('patient_file_number') as unknown as number;
    let admissionWard = data.get('admission_ward') as unknown as number;
    let diagnosis = data.getAll('diagnosis') as unknown as string[];
    let heathInsurance = data.get('health_insurance') as unknown as boolean;
    let referredFrom = data.get('referred_from') as unknown as string;
    let securityStatus = data.get('security_status') as unknown as boolean;
    let admissionDate = data.get('admission_date') as unknown as Date;
    let admissionNotes = data.get('admission_notes') as unknown as string;

    const failWithMessages = failWithFormFieldsAndMessageArrayBuilder({
      patientFileNumber,
      patientName,
      idDocType,
      idDocNum,
      gender,
      birthdate,
      heathInsurance,
      diagnosis,
      admissionWard,
      admissionDate,
      personId,
      admissionNotes,
      referredFrom,
      securityStatus,
    });

    const failMessages = [];

    if (!patientFileNumber) failMessages.push('الرقم الطبي مطلوب');
    if (!patientName) failMessages.push(' اسم المريض مطلوب');
    if (!idDocType) failMessages.push('نوع الهوية مطلوبة');
    if (!idDocNum && idDocType != 6) failMessages.push('رقم الهوية مطلوب');
    if (idDocType == 1 && !verifyEgyptianNationalId(idDocNum))
      failMessages.push('صيغة رقم الهوية غير صحيحة');
    if (!gender) failMessages.push('الجنس/النوع مطلوب');
    if (!birthdate) failMessages.push('تاريخ الميلاد مطلوب');
    if (!heathInsurance) failMessages.push('موقف المريض من التأمين الصحي مطلوب');
    if (!diagnosis.length)
      failMessages.push('التشخيص مطلوب. يلزم كتابة تشخيص واحد على الأقل');
    if (!admissionWard) failMessages.push('يلزم تحديد قسم الدخول');
    if (!admissionDate) failMessages.push('تاريخ الدخول مطلوب');
    if (!admissionNotes && idDocType == 6)
      failMessages.push('يلزم الإفادة بملاحظات حال لم يتم كتابة رقم هوية');
    if (!referredFrom)
      failMessages.push('يجب تحديد الجهة التي أوصت بتحويل المريض لدخول المستشفى');
    if (!securityStatus) failMessages.push('يجب تحديد الحالة الأمنية للمريض');

    if (failMessages.length) return failWithMessages(failMessages);

    try {
      personId = Number(personId);
      patientFileNumber = Number(patientFileNumber);
      idDocType = Number(idDocType);
      admissionWard = Number(admissionWard);

      gender = Boolean(Number(gender));
      heathInsurance = Boolean(Number(heathInsurance));
      securityStatus = Boolean(Number(securityStatus));

      birthdate = new Date(birthdate);
      admissionDate = new Date(admissionDate);
    } catch (e) {
      console.error(JSON.stringify(data, null, 4));
      failWithMessages([
        { message: 'خطأ في طبيعة البيانات المدخلة (أرقام أو تواريخ).', type: 'error' },
      ]);
    }

    const foundAdmitted =
      idDocType !== 6 ? await isAdmitted(idDocType, idDocNum) : undefined;

    if (foundAdmitted) {
      return failWithMessages([
        {
          message: `المريض "${foundAdmitted.patient_name}" محجوز بالفعل في "${foundAdmitted.ward_name}"`,
          type: 'error',
        },
      ]);
    }

    const result = await createPatient({
      id: [admissionDate.getFullYear().toString().slice(2, 4), patientFileNumber].join(
        '/'
      ),
      name: patientName.trim(),
      id_doc_type: idDocType,
      id_doc_num: idDocNum.trim(),
      admission_ward: admissionWard,
      admission_date: admissionDate,
      admission_notes: admissionNotes,
      diagnosis: diagnosis.map((d) => d.trim()),
      security_status: securityStatus,
      referred_from: referredFrom,
      person_id: personId ?? undefined,
    });

    if (
      !result.success &&
      (result.error as DrizzleQueryError).cause?.message!.includes(
        'UNIQUE constraint failed'
      )
    ) {
      return failWithMessages([
        { message: `الرقم الطبي ${patientFileNumber} مسجل مسبقا`, type: 'error' },
      ]);
    }

    return {
      success: true,
      message: `تم تسجيل دخول المريض "${patientName}" بنجاح`,
    };
  },
};
