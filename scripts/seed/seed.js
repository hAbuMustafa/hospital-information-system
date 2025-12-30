import { patients as new_Patients } from './data/patients';
import { users as new_Users } from './data/users';
import { transfers as new_PatientTransfers } from './data/patient_transfers';

import { seedUser } from '../../src/lib/server/db/operations/seed/users';
import {
  createWard,
  createIdDocType,
  createDischargeReason,
  createDiagnosis,
  createContactType,
} from '../../src/lib/server/db/operations/menus';
import {
  seedPatient,
  seedPatientTransfer,
} from '../../src/lib/server/db/operations/seed/patients';
import {
  createDrugUnit,
  createDrugCategory,
} from '../../src/lib/server/db/operations/drugs';

import {
  ward_list,
  id_doc_type_list,
  discharge_reason_list,
  dosage_unit_list,
  stock_category_list,
  contact_type_list,
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
  await seed(ward_list, createWard);
  await seed(id_doc_type_list, createIdDocType);
  await seed(discharge_reason_list, createDischargeReason);
  await seed(dosage_unit_list, createDrugUnit);
  await seed(stock_category_list, createDrugCategory);
  await seed(contact_type_list, createContactType);
  await seed(new_Diagnoses, createDiagnosis);

  // Seed Initial Data
  await seed(new_Users, seedUser);
  await seed(new_Patients, seedPatient);
  await seed(new_PatientTransfers, seedPatientTransfer);

  console.timeEnd('total seeding time');
}
