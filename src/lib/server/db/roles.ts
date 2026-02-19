export const roles = [
  {
    id: 1,
    title: 'System Admin',
  },
  {
    id: 2,
    title: 'Hospital Manager',
  },
  {
    id: 3,
    title: 'Hospital Deputy Manager',
  },
  {
    id: 4,
    title: 'Financial Manager',
  },
  {
    id: 5,
    title: 'Financial Assistant',
  },
  {
    id: 6,
    title: 'Senior Pharmacist',
  },
  {
    id: 7,
    title: 'Economy Medications Warehouse Manager',
  },
  {
    id: 8,
    title: 'Economy Medications Inpatient Pharmacy Manager',
  },
  {
    id: 9,
    title: 'Economy Medications Outpatient Pharmacy Manager',
  },
  {
    id: 10,
    title: 'Free Medications Warehouse Manager',
  },
  {
    id: 11,
    title: 'Free Medications Inpatient Pharmacy Manager',
  },
  {
    id: 12,
    title: 'Free Medications Outpatient Pharmacy Manager',
  },
  {
    id: 13,
    title: 'Economy Medications Warehouse Pharmacist',
  },
  {
    id: 14,
    title: 'Economy Medications Inpatient Pharmacist',
  },
  {
    id: 15,
    title: 'Economy Medications Outpatient Pharmacist',
  },
  {
    id: 16,
    title: 'Free Medications Warehouse Pharmacist',
  },
  {
    id: 17,
    title: 'Free Medications Inpatient Pharmacist',
  },
  {
    id: 18,
    title: 'Free Medications Outpatient Pharmacist',
  },
  {
    id: 19,
    title: 'Clinical Pharmacist',
  },
  {
    id: 20,
    title: 'Health Economics Manager',
  },
  {
    id: 21,
    title: 'Health Economics Assistant',
  },
  {
    id: 22,
    title: 'Registration Office',
  },
  {
    id: 23,
    title: 'Physician',
  },
];

const fmiPharmacist = roles.filter((r) => r.title.includes('Free Medications Inpatient'));
const fmoPharmacist = roles.filter((r) =>
  r.title.includes('Free Medications Outpatient')
);
const fmwPharmacist = roles.filter((r) => r.title.includes('Free Medications Warehouse'));

const emiPharmacist = roles.filter((r) =>
  r.title.includes('Economy Medications Inpatient')
);
const emoPharmacist = roles.filter((r) =>
  r.title.includes('Economy Medications Outpatient')
);
const emwPharmacist = roles.filter((r) =>
  r.title.includes('Economy Medications Warehouse')
);

const phManager = roles.filter((r) => r.title.includes('Pharmacy Manager'));
const wManager = roles.filter((r) => r.title.includes('Warehouse Manager'));

const pharmacist = roles.filter((r) => r.id >= 6 || r.id < 20);
