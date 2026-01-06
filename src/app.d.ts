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
        first_name: string;
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
    // interface CustomTypes {}
    type Require<T, K extends keyof T> = T & { [P in K]-?: T[P] };
  }
  type ToastT = { type: 'info' | 'success' | 'error' | 'warning'; message: string };
}

export {};
