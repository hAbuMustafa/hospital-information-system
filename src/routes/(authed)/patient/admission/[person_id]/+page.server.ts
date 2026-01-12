import { failWithFormFieldsAndMessageArrayBuilder } from '$lib/utils/form-actions';
import { floors, ward_list } from '$server/db/menus';
import {
  createAdmission,
  getLastPatientFileNumber,
} from '$server/db/operations/patients';
import { getPerson } from '$server/db/operations/people.js';
import { getDiagnoses, isAdmitted } from '$server/db/operations/utils';
import { redirect } from '@sveltejs/kit';

export async function load({ params }) {
  const diagnoses_list = await getDiagnoses();
  const nextFileNumber = (await getLastPatientFileNumber(new Date().getFullYear())) + 1;

  let personId: number;

  try {
    personId = Number(params.person_id);
  } catch (error) {
    return redirect(303, '/patient/admission');
  }

  const person = await getPerson(personId);

  if (!person) return redirect(303, '/patient/admission');

  return {
    title: `دخول: ${person.full_name}`,
    wards_list: ward_list,
    floors_list: floors,
    diagnoses_list,
    nextFileNumber,
    person_name: person.full_name,
  };
}

export const actions = {
  default: async ({ request, params }) => {
    const data = await request.formData();
    const personId = Number(params.person_id);

    let patientFileNumber = data.get('patient_file_number') as unknown as number;
    let personName = data.get('person_name') as unknown as string;
    let admissionWard = data.get('admission_ward') as unknown as number;
    let diagnosis = data.getAll('diagnosis') as unknown as string[];
    let healthInsurance = data.get('health_insurance') as unknown as boolean;
    let referredFrom = data.get('referred_from') as unknown as string;
    let securityStatus = data.get('security_status') as unknown as boolean;
    let admissionDate = data.get('admission_date') as unknown as Date;
    let admissionNotes = data.get('admission_notes') as unknown as string;

    const failWithMessages = failWithFormFieldsAndMessageArrayBuilder({
      patientFileNumber,
      healthInsurance,
      diagnosis,
      admissionWard,
      admissionDate,
      admissionNotes,
      referredFrom,
      securityStatus,
    });

    const failMessages = [];

    if (!patientFileNumber) failMessages.push('الرقم الطبي مطلوب');
    if (!healthInsurance) failMessages.push('موقف المريض من التأمين الصحي مطلوب');
    if (!diagnosis.length)
      failMessages.push('التشخيص مطلوب. يلزم كتابة تشخيص واحد على الأقل');
    if (!admissionWard) failMessages.push('يلزم تحديد قسم الدخول');
    if (!admissionDate) failMessages.push('تاريخ الدخول مطلوب');

    if (!referredFrom)
      failMessages.push('يجب تحديد الجهة التي أوصت بتحويل المريض لدخول المستشفى');
    if (!securityStatus) failMessages.push('يجب تحديد الحالة الأمنية للمريض');

    try {
      patientFileNumber = Number(patientFileNumber);
      admissionWard = Number(admissionWard);
      healthInsurance = Boolean(Number(healthInsurance));
      securityStatus = Boolean(Number(securityStatus));
      admissionDate = new Date(admissionDate);
    } catch (e) {
      console.error(JSON.stringify(data, null, 4));
      console.error(e);
      failWithMessages([
        { message: 'خطأ في طبيعة البيانات المدخلة (أرقام أو تواريخ).', type: 'error' },
      ]);
    }

    const foundAdmitted = await isAdmitted(personId);

    if (foundAdmitted) {
      return failWithMessages([
        {
          message: `المريض "${foundAdmitted.patient_name}" محجوز بالفعل في "${foundAdmitted.ward_name}"`,
          type: 'error',
        },
      ]);
    }

    const result = await createAdmission({
      person_id: personId,
      file_number: patientFileNumber,
      admission_ward: admissionWard,
      diagnosis: diagnosis,
      health_insurance: healthInsurance,
      referred_from: referredFrom,
      security_status: securityStatus,
      admission_date: admissionDate,
      admission_notes: admissionNotes,
    });

    if (!result.success) {
      console.error(result.error);
      return failWithMessages([
        { message: 'حدث خطأ أثناء تسجيل بيانات المريض', type: 'error' },
      ]);
    }

    return {
      success: true,
      message: `تم تسجيل دخول المريض "${personName}" بنجاح`,
    };
  },
};
