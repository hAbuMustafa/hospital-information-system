import { id_doc_type_list } from '$lib/server/db/menus';
import type { people_view } from '$server/db/schema/entities/people.js';
import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
  const personId = params.id;

  if (!/^\d+$/.test(personId)) return error(404, 'الرقم الطبي الموحد للمريض غير صحيح');

  const person: typeof people_view.$inferSelect = await fetch(
    `/api/person?id=${personId}`
  ).then((r) => {
    if (r.ok) {
      return r.json();
    } else return null;
  });

  if (!person) error(404, 'لا يوجد مريض بالرقم الطبي الموحد المذكور');

  return {
    title: person.full_name,
    person,
    id_doc_type_list: id_doc_type_list,
  };
}

export const actions = {
  default: async ({ params }) => {
    const personId = params.id;
    // todo: implement editing person details
  },
};
