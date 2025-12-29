// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: {
        id: number;
        username: string;
        name: string;
        phone_number: string;
        email: string | null;
        national_id: string | null;
        role: number;
        created_at: Date;
        last_login: Date | null;
        password_reset_required?: boolean;
        gravatar: string;
      } | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
    interface CustomTypes {
      PatientSeedT: {
        id: string;
        name: string;
        id_doc_num?: string;
        diagnosis: string;
        admission_date: Date;
        discharge_date?: Date;
        admission_notes?: string;
        gender?: boolean;
        birthdate?: Date;
        health_insurance?: boolean;
        id_doc_type?: number;
        discharge_reason?: number;
        admission_ward: number;
        security_status: boolean;
        person_id?: number;
      };
    }
    type Require<T, K extends keyof T> = T & { [P in K]-?: T[P] };
  }
  type ToastT = { type: 'info' | 'success' | 'error' | 'warning'; message: string };
}

export {};
