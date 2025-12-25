import { patients as new_Patients } from './data/patients';
import { drugs as new_Drugs } from './data/drugs';
import { users as new_Users } from './data/users';
import { transfers as new_PatientTransfers } from './data/patient_transfers';

import { createUser } from '../../src/lib/server/db/operations/users';
import {
  createWard,
  createIdDocType,
  createDischargeReason,
  createPatientFromSeed,
  transferPatient,
  createDiagnosis,
} from '../../src/lib/server/db/operations/patients';
import {
  createDrugUnit,
  createDrugCategory,
} from '../../src/lib/server/db/operations/drugs';

import {
  new_Wards,
  new_id_doc_type,
  new_Patient_discharge_reasons,
  new_Drugs_unit,
  new_Drugs_category,
} from '../../src/lib/server/db/menus';

async function seed(items, insertFunction) {
  const seedName = insertFunction.name.replace('create', '');

  console.warn('\nStarting ' + seedName + ' seed..');

  console.time('seed ' + seedName);

  for (let i = 0; i < items.length; i++) {
    const itemReturn = await insertFunction(items[i]);

    if (!itemReturn.success) {
      console.error(
        'Failed adding',
        JSON.stringify(items[i], null, 4),
        'with error:\n',
        itemReturn.error
      );
      break;
    }
  }

  console.timeEnd('seed ' + seedName);
  console.info('Done Seeding ' + seedName);
}

export async function beginSeed() {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ BEWARE NOT TO SEED IN PRODUCTION!\n❌ ABORTING SEED!');
    process.exit(2);
  }
  console.time('total seeding time');

  const new_Diagnoses = Array.from(
    new Set(
      new_Patients
        .map((p) => p.diagnosis?.split('+').map((d) => d.trim()))
        .flat()
        .sort()
    )
  );

  // Seed Menu Lists
  await seed(new_Wards, createWard);
  await seed(new_id_doc_type, createIdDocType);
  await seed(new_Patient_discharge_reasons, createDischargeReason);
  await seed(new_Drugs_unit, createDrugUnit);
  await seed(new_Drugs_category, createDrugCategory);
  await seed(new_Diagnoses, createDiagnosis);

  // Seed Initial Data
  await seed(new_Users, createUser);
  await seed(new_Patients, createPatientFromSeed);
  await seed(new_PatientTransfers, transferPatient);

  console.timeEnd('total seeding time');
}
