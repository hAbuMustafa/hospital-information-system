import * as systemScheme from './entities/system';
import * as hospitalScheme from './entities/hospital';
import * as peopleScheme from './entities/people';
import * as patientsScheme from './entities/patients';
import * as pharmacyScheme from './entities/pharmacy';
import * as medication_planScheme from './entities/medication_plan';

const scheme = {
  ...systemScheme,
  ...hospitalScheme,
  ...peopleScheme,
  ...patientsScheme,
  ...pharmacyScheme,
  ...medication_planScheme,
};

export default scheme;
