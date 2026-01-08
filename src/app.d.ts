// See https://svelte.dev/docs/kit/types#app.d.ts

import type { users_view } from '$lib/server/db/schema/entities/system';

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user:
        | (typeof users_view.$inferSelect & {
            gravatar?: string;
            father_name?: string;
            grandfather_name?: string;
            family_name?: string;
            national_id?: string;
          })
        | null;
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
