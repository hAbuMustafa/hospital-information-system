import * as Hospital from './hospital';
import * as Finance from './finance';
import * as MedicationPlan from './medication_plan';
import * as Patients from './patients';
import * as People from './people';
import * as Pharmacy from './pharmacy';
import * as System from './system';
import * as Drug from './drugs';

const schema = {
  ...Hospital,
  ...Finance,
  ...MedicationPlan,
  ...Patients,
  ...People,
  ...Pharmacy,
  ...System,
  ...Drug,
};

export default schema;
