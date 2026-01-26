import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/server/db/schema/entities',
  out: './drizzle',
  dbCredentials: {
    url: `${process.env.PSQL_CONNECTION_STRING!}${
      process.env.NODE_ENV !== 'production' ? '_TEST' : ''
    }`,
  },
  introspect: {
    casing: 'preserve',
  },
  schemaFilter: [
    'Hospital',
    'MedicationPlan',
    'Finance',
    'Patient',
    'People',
    'Pharmacy',
    'Security',
    'Drug',
  ],
});
