import { db } from '$lib/server/db';
import {
  StockCategory,
  DosageForm_SizeUnit,
} from '$lib/server/db/schema/entities/pharmacy';

export async function createDrugUnit(unit: typeof DosageForm_SizeUnit.$inferInsert) {
  try {
    const [drugUnit] = await db.insert(DosageForm_SizeUnit).values(unit).returning();

    return {
      success: true,
      data: drugUnit,
    };
  } catch (error) {
    return {
      error,
    };
  }
}

export async function createDrugCategory(category: typeof StockCategory.$inferInsert) {
  try {
    const [drugCategory] = await db.insert(StockCategory).values(category).returning();

    return {
      success: true,
      data: drugCategory,
    };
  } catch (error) {
    return {
      error,
    };
  }
}
