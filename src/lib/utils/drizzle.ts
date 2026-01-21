import { sql } from 'drizzle-orm';

export function regexp(columnName: string, pattern: string | RegExp) {
  return sql.raw(
    `"${columnName}" ~* '${pattern instanceof RegExp ? pattern.source : pattern}'`
  );
}
