export type newPatientT = {
  id: string;
  name: string;
  id_doc_type: number;
  id_doc_num: string;
  admission_ward: number;
  admission_date: Date;
  admission_notes: string;
  diagnosis: string[];
  security_status: boolean;
  referred_from: string;
  person_id?: number;
};

export type NewUserDataT = {
  username: string;
  password: string;
  name: string;
  national_id: string;
  email: string;
  phone_number: string;
};
