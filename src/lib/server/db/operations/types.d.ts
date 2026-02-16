export type newPersonT = {
  first_name: string;
  father_name: string;
  grandfather_name: string;
  family_name?: string;
  id_doc_type: number;
  id_doc_num: string;
  gender: boolean;
  birthdate: Date;
};

export type newPatientT = {
  file_number: number;
  person_id: number;
  admission_ward: number;
  admission_date: Date;
  admission_notes: string;
  diagnosis: string[];
  security_status: boolean;
  referred_from: string;
  health_insurance: boolean;
};

export type NewUserDataT = {
  username: string;
  password: string;
  first_name: string;
  father_name: string;
  grandfather_name: string;
  family_name: string | null;
  national_id: string;
  email: string;
  phone_number: string;
};

export type PatientSeedT = {
  file_id: string;
  name: string;
  id_doc_num?: string;
  diagnosis: string;
  admission_date: Date;
  discharge_date?: Date;
  admission_notes?: string;
  gender?: boolean;
  birthdate?: Date;
  nationality?: string;
  health_insurance?: boolean;
  id_doc_type?: number;
  discharge_reason?: number;
  admission_ward: number;
  security_status: boolean;
  person_id?: number;
};

export type seedTransferT = {
  file_id: string;
  timestamp: Date;
  ward: number;
};

export type seedDischargeT = {
  file_id: string;
  discharge_date: Date;
  discharge_reason: number;
};
