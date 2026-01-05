import config from './seed.config.json' with {type:'json'};
import { admissions as new_PatientAdmissions } from './data/patient_admissions';
import { transfers as new_PatientTransfers } from './data/patient_transfers';
import { discharges as new_PatientDischarges } from './data/patient_discharges';
import { users as new_Users } from './data/users';

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
  seedPatientTransfer,seedPatientDischarge,
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

  console.time(seedName + ' seed, took');

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

  console.timeEnd(seedName + ' seed, took');
  console.info('Done Seeding ' + seedName);
}

export async function beginSeed() {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ BEWARE NOT TO SEED IN PRODUCTION!\n❌ ABORTING SEED!');
    process.exit(2);
  }
  console.time('total seeding time');

  // Seed Menu Lists
  if (config.all || config.menus || config.wards) await seed(ward_list, createWard);
  if (config.all || config.menus || config.id_doc_types)
    await seed(id_doc_type_list, createIdDocType);
  if (config.all || config.menus || config.discharge_reasons)
    await seed(discharge_reason_list, createDischargeReason);
  if (config.all || config.menus || config.dosage_unit)
    await seed(dosage_unit_list, createDrugUnit);
  if (config.all || config.menus || config.stock_categories)
    await seed(stock_category_list, createDrugCategory);
  if (config.all || config.menus || config.contact_types)
    await seed(contact_type_list, createContactType);

  // Diagnoses
  if (config.all || config.diagnoses) {
    const new_Diagnoses = Array.from(
      new Set(
        new_PatientAdmissions
          .map((p) => p.diagnosis?.split('+').map((d) => d.trim()))
          .flat()
          .sort()
      )
    );
    await seed(new_Diagnoses, createDiagnosis);
  }

  // Seed Initial Data
  if (config.all || config.data || config.patients || config.patientAdmissions) await seed(new_PatientAdmissions, seedPatient);
  if (config.all || config.data || config.patients || config.patientTransfers)
    await seed(new_PatientTransfers, seedPatientTransfer);
  if (config.all || config.data || config.patients || config.patientDischarges)
    await seed(new_PatientDischarges, seedPatientDischarge);
  if (config.all || config.data || config.users) await seed(new_Users, seedUser);

  console.timeEnd('total seeding time');
}
