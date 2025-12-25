import { db } from '$lib/server/db';
import { IdDoc_type } from '$lib/server/db/schema/entities/people';

export async function createIdDocType(docType: typeof IdDoc_type.$inferInsert) {
  try {
    const [new_id_doc_type] = await db.insert(IdDoc_type).values(docType).returning();

    return { success: true, data: new_id_doc_type };
  } catch (error) {
    return {
      error,
    };
  }
}
