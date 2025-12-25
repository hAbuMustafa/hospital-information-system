import { relations } from 'drizzle-orm/relations';
import { Invoice_Drugs, Invoice_Item_Drugs } from './finance';
import {
  InPatient,
  Admission_Order,
  Discharge,
  Discharge_Order,
  Discharge_Reason,
  Patient_diagnosis,
  Diagnosis,
  Transfer_Order,
  Admission,
  Insurance_Doc,
  Transfer,
} from './patients';
import { Staff, Ward, ReportsTo } from './hospital';
import {
  MedPlan,
  MedPlan_sign_nurse,
  MedPlan_note,
  MedPlan_note_type,
  MedPlan_sign_pharm,
  MedPlan_sign_phys,
} from './medication_plan';
import {
  Person,
  People_contact_information,
  Contact_type,
  IdDoc_type,
  Person_IdDoc,
  Person_relationship,
} from './people';
import {
  PharmacyStock_Drugs,
  Formulary,
  BrandName,
  StockCategory,
  ActiveIngredient,
  ActiveIngredient_Use,
  Use,
  DosageForm_SizeUnit,
  DosageUnit_look_like,
  Formulary_ROA,
  RouteOfAdministration,
  Formulation,
  ActiveIngredient_Unit,
  PharmacyTransaction_Drugs,
} from './pharmacy';
import { Sec_pb_key, User, RefreshToken, Sec_pv_key } from './system';

export const MedPlan_sign_nurseRelations = relations(MedPlan_sign_nurse, ({ one }) => ({
  MedPlan: one(MedPlan, {
    fields: [MedPlan_sign_nurse.med_plan_id],
    references: [MedPlan.id],
  }),
  Staff: one(Staff, {
    fields: [MedPlan_sign_nurse.nurse_id],
    references: [Staff.id],
  }),
  Sec_pb_key: one(Sec_pb_key, {
    fields: [MedPlan_sign_nurse.nurse_sign_key_id],
    references: [Sec_pb_key.id],
  }),
}));

export const MedPlanRelations = relations(MedPlan, ({ one, many }) => ({
  MedPlan_sign_nurses: many(MedPlan_sign_nurse),
  InPatient: one(InPatient, {
    fields: [MedPlan.patient_id],
    references: [InPatient.id],
  }),
  Formulary: one(Formulary, {
    fields: [MedPlan.medication_id],
    references: [Formulary.id],
  }),
  Staff: one(Staff, {
    fields: [MedPlan.discontinue_phys_id],
    references: [Staff.id],
  }),
  Sec_pb_key: one(Sec_pb_key, {
    fields: [MedPlan.discontinue_phys_sign_key_id],
    references: [Sec_pb_key.id],
  }),
  MedPlan: one(MedPlan, {
    fields: [MedPlan.mixed_with],
    references: [MedPlan.id],
    relationName: 'MedPlan_mixed_with_MedPlan_id',
  }),
  MedPlans: many(MedPlan, {
    relationName: 'MedPlan_mixed_with_MedPlan_id',
  }),
  MedPlan_notes: many(MedPlan_note),
  MedPlan_sign_pharms: many(MedPlan_sign_pharm),
  MedPlan_sign_physs: many(MedPlan_sign_phys),
  PharmacyTransaction_DrugsInPharmacies: many(PharmacyTransaction_Drugs),
}));

export const StaffRelations = relations(Staff, ({ one, many }) => ({
  MedPlan_sign_nurses: many(MedPlan_sign_nurse),
  PersonInPerson: one(Person, {
    fields: [Staff.person_id],
    references: [Person.id],
  }),
  MedPlans: many(MedPlan),
  MedPlan_notes: many(MedPlan_note),
  MedPlan_sign_pharms: many(MedPlan_sign_pharm),
  MedPlan_sign_physs: many(MedPlan_sign_phys),
  Admission_Orders: many(Admission_Order),
  Discharges: many(Discharge),
  Patient_diagnosiss: many(Patient_diagnosis),
  Transfer_Orders: many(Transfer_Order),
  PharmacyTransaction_DrugsInPharmacies_pharmacist_id: many(PharmacyTransaction_Drugs, {
    relationName: 'PharmacyTransaction_Drugs_pharmacist_id_Staff_id',
  }),
  PharmacyTransaction_DrugsInPharmacies_dispensing_nurse_id: many(
    PharmacyTransaction_Drugs,
    {
      relationName: 'PharmacyTransaction_Drugs_dispensing_nurse_id_Staff_id',
    }
  ),
  UserInSecurities: many(User),
  ReportsTos_staff_id: many(ReportsTo, {
    relationName: 'ReportsTo_staff_id_Staff_id',
  }),
  ReportsTos_reports_to_id: many(ReportsTo, {
    relationName: 'ReportsTo_reports_to_id_Staff_id',
  }),
  Admissions: many(Admission),
  Discharge_Orders: many(Discharge_Order),
}));

export const Sec_pb_keyRelations = relations(Sec_pb_key, ({ many }) => ({
  MedPlan_sign_nurses: many(MedPlan_sign_nurse),
  MedPlans: many(MedPlan),
  MedPlan_notes: many(MedPlan_note),
  MedPlan_sign_pharms: many(MedPlan_sign_pharm),
  MedPlan_sign_physs: many(MedPlan_sign_phys),
  Admission_Orders: many(Admission_Order),
  Discharges: many(Discharge),
  Patient_diagnosiss: many(Patient_diagnosis),
  Transfer_Orders: many(Transfer_Order),
  PharmacyTransaction_DrugsInPharmacies: many(PharmacyTransaction_Drugs),
  Invoice_Drugss: many(Invoice_Drugs),
  UserInSecurities: many(User),
  Discharge_Orders: many(Discharge_Order),
}));

export const Invoice_Item_DrugsRelations = relations(Invoice_Item_Drugs, ({ one }) => ({
  Invoice_Drugs: one(Invoice_Drugs, {
    fields: [Invoice_Item_Drugs.invoice_id],
    references: [Invoice_Drugs.id],
  }),
  PharmacyStock_Drugs: one(PharmacyStock_Drugs, {
    fields: [Invoice_Item_Drugs.item_id],
    references: [PharmacyStock_Drugs.id],
  }),
}));

export const Invoice_DrugsRelations = relations(Invoice_Drugs, ({ one, many }) => ({
  Invoice_Item_Drugss: many(Invoice_Item_Drugs),
  InPatient: one(InPatient, {
    fields: [Invoice_Drugs.patient_id],
    references: [InPatient.id],
  }),
  User: one(User, {
    fields: [Invoice_Drugs.created_by],
    references: [User.id],
  }),
  Sec_pb_key: one(Sec_pb_key, {
    fields: [Invoice_Drugs.creator_pb_key_id],
    references: [Sec_pb_key.id],
  }),
}));

export const PharmacyStock_DrugsRelations = relations(
  PharmacyStock_Drugs,
  ({ one, many }) => ({
    Invoice_Item_Drugss: many(Invoice_Item_Drugs),
    BrandName: one(BrandName, {
      fields: [PharmacyStock_Drugs.brand_name_id],
      references: [BrandName.id],
    }),
    StockCategory: one(StockCategory, {
      fields: [PharmacyStock_Drugs.stock_category],
      references: [StockCategory.id],
    }),
    PharmacyTransaction_DrugsInPharmacies: many(PharmacyTransaction_Drugs),
  })
);

export const PersonRelations = relations(Person, ({ many }) => ({
  Staffs: many(Staff),
  Admission_Orders: many(Admission_Order),
  People_contact_information: many(People_contact_information),
  InPatients: many(InPatient),
  UserInSecurities: many(User),
  Person_IdDoc: many(Person_IdDoc),
  Person_relationship_person_id: many(Person_relationship, {
    relationName: 'Person_relationship_person_id_Person_id',
  }),
  Person_relationship_related_to_id: many(Person_relationship, {
    relationName: 'Person_relationship_related_to_id_Person_id',
  }),
}));

export const InPatientRelations = relations(InPatient, ({ one, many }) => ({
  MedPlans: many(MedPlan),
  Discharges: many(Discharge),
  Patient_diagnosiss: many(Patient_diagnosis),
  Transfer_Orders: many(Transfer_Order),
  Insurance_Docs: many(Insurance_Doc),
  Transfers: many(Transfer),
  PharmacyTransaction_DrugsInPharmacies: many(PharmacyTransaction_Drugs),
  PersonInPerson: one(Person, {
    fields: [InPatient.person_id],
    references: [Person.id],
  }),
  Ward: one(Ward, {
    fields: [InPatient.recent_ward],
    references: [Ward.id],
  }),
  Invoice_Drugss: many(Invoice_Drugs),
  Admissions: many(Admission),
  Discharge_Orders: many(Discharge_Order),
}));

export const FormularyRelations = relations(Formulary, ({ many }) => ({
  MedPlans: many(MedPlan),
  BrandNameInPharmacies: many(BrandName),
  Formulary_ROAInPharmacies: many(Formulary_ROA),
  FormulationInPharmacies: many(Formulation),
}));

export const MedPlan_noteRelations = relations(MedPlan_note, ({ one }) => ({
  MedPlan: one(MedPlan, {
    fields: [MedPlan_note.med_plan_id],
    references: [MedPlan.id],
  }),
  MedPlan_note_type: one(MedPlan_note_type, {
    fields: [MedPlan_note.note_type],
    references: [MedPlan_note_type.id],
  }),
  Staff: one(Staff, {
    fields: [MedPlan_note.author_id],
    references: [Staff.id],
  }),
  Sec_pb_key: one(Sec_pb_key, {
    fields: [MedPlan_note.author_sign_key_id],
    references: [Sec_pb_key.id],
  }),
}));

export const MedPlan_note_typeRelations = relations(MedPlan_note_type, ({ many }) => ({
  MedPlan_notes: many(MedPlan_note),
}));

export const MedPlan_sign_pharmRelations = relations(MedPlan_sign_pharm, ({ one }) => ({
  MedPlan: one(MedPlan, {
    fields: [MedPlan_sign_pharm.med_plan_id],
    references: [MedPlan.id],
  }),
  Staff: one(Staff, {
    fields: [MedPlan_sign_pharm.pharm_id],
    references: [Staff.id],
  }),
  Sec_pb_key: one(Sec_pb_key, {
    fields: [MedPlan_sign_pharm.pharm_signature_key_id],
    references: [Sec_pb_key.id],
  }),
}));

export const MedPlan_sign_physRelations = relations(MedPlan_sign_phys, ({ one }) => ({
  MedPlan: one(MedPlan, {
    fields: [MedPlan_sign_phys.med_plan_id],
    references: [MedPlan.id],
  }),
  Staff: one(Staff, {
    fields: [MedPlan_sign_phys.phys_id],
    references: [Staff.id],
  }),
  Sec_pb_key: one(Sec_pb_key, {
    fields: [MedPlan_sign_phys.phys_signature_key_id],
    references: [Sec_pb_key.id],
  }),
}));

export const Admission_OrderRelations = relations(Admission_Order, ({ one, many }) => ({
  PersonInPerson: one(Person, {
    fields: [Admission_Order.person_id],
    references: [Person.id],
  }),
  Staff: one(Staff, {
    fields: [Admission_Order.admitting_phys],
    references: [Staff.id],
  }),
  Sec_pb_key: one(Sec_pb_key, {
    fields: [Admission_Order.admitting_phys_sign_key_id],
    references: [Sec_pb_key.id],
  }),
  Admissions: many(Admission),
}));

export const DischargeRelations = relations(Discharge, ({ one }) => ({
  InPatient: one(InPatient, {
    fields: [Discharge.patient_id],
    references: [InPatient.id],
  }),
  Discharge_Order: one(Discharge_Order, {
    fields: [Discharge.discharge_order_id],
    references: [Discharge_Order.id],
  }),
  Discharge_Reason: one(Discharge_Reason, {
    fields: [Discharge.discharge_reason],
    references: [Discharge_Reason.id],
  }),
  Staff: one(Staff, {
    fields: [Discharge.registrar],
    references: [Staff.id],
  }),
  Sec_pb_key: one(Sec_pb_key, {
    fields: [Discharge.registrar_sign_key],
    references: [Sec_pb_key.id],
  }),
}));

export const Discharge_OrderRelations = relations(Discharge_Order, ({ one, many }) => ({
  Discharges: many(Discharge),
  InPatient: one(InPatient, {
    fields: [Discharge_Order.patient_id],
    references: [InPatient.id],
  }),
  Staff: one(Staff, {
    fields: [Discharge_Order.phys_id],
    references: [Staff.id],
  }),
  Sec_pb_key: one(Sec_pb_key, {
    fields: [Discharge_Order.phys_sign_key],
    references: [Sec_pb_key.id],
  }),
}));

export const Discharge_ReasonRelations = relations(Discharge_Reason, ({ many }) => ({
  Discharges: many(Discharge),
}));

export const Patient_diagnosisRelations = relations(Patient_diagnosis, ({ one }) => ({
  InPatient: one(InPatient, {
    fields: [Patient_diagnosis.patient_id],
    references: [InPatient.id],
  }),
  Diagnosis: one(Diagnosis, {
    fields: [Patient_diagnosis.diagnosis_id],
    references: [Diagnosis.id],
  }),
  Staff: one(Staff, {
    fields: [Patient_diagnosis.diagnosing_phys_id],
    references: [Staff.id],
  }),
  Sec_pb_key: one(Sec_pb_key, {
    fields: [Patient_diagnosis.diagnosing_phys_sign_key_id],
    references: [Sec_pb_key.id],
  }),
}));

export const DiagnosisRelations = relations(Diagnosis, ({ many }) => ({
  Patient_diagnosiss: many(Patient_diagnosis),
}));

export const Transfer_OrderRelations = relations(Transfer_Order, ({ one, many }) => ({
  InPatient: one(InPatient, {
    fields: [Transfer_Order.patient_id],
    references: [InPatient.id],
  }),
  Ward: one(Ward, {
    fields: [Transfer_Order.to_ward],
    references: [Ward.id],
  }),
  Staff: one(Staff, {
    fields: [Transfer_Order.phys_id],
    references: [Staff.id],
  }),
  Sec_pb_key: one(Sec_pb_key, {
    fields: [Transfer_Order.phys_sign_key_id],
    references: [Sec_pb_key.id],
  }),
  Transfers: many(Transfer),
}));

export const WardRelations = relations(Ward, ({ many }) => ({
  Transfer_Orders: many(Transfer_Order),
  Transfers_from_ward_id: many(Transfer, {
    relationName: 'Transfer_from_ward_id_Ward_id',
  }),
  Transfers_to_ward_id: many(Transfer, {
    relationName: 'Transfer_to_ward_id_Ward_id',
  }),
  InPatients: many(InPatient),
}));

export const People_contact_informationRelations = relations(
  People_contact_information,
  ({ one }) => ({
    PersonInPerson: one(Person, {
      fields: [People_contact_information.person_id],
      references: [Person.id],
    }),
    Contact_typeInPerson: one(Contact_type, {
      fields: [People_contact_information.contact_type],
      references: [Contact_type.id],
    }),
  })
);

export const Contact_typeRelations = relations(Contact_type, ({ many }) => ({
  People_contact_information: many(People_contact_information),
}));

export const Insurance_DocRelations = relations(Insurance_Doc, ({ one }) => ({
  InPatient: one(InPatient, {
    fields: [Insurance_Doc.patient_id],
    references: [InPatient.id],
  }),
}));

export const TransferRelations = relations(Transfer, ({ one }) => ({
  InPatient: one(InPatient, {
    fields: [Transfer.patient_id],
    references: [InPatient.id],
  }),
  Ward_from_ward_id: one(Ward, {
    fields: [Transfer.from_ward_id],
    references: [Ward.id],
    relationName: 'Transfer_from_ward_id_Ward_id',
  }),
  Ward_to_ward_id: one(Ward, {
    fields: [Transfer.to_ward_id],
    references: [Ward.id],
    relationName: 'Transfer_to_ward_id_Ward_id',
  }),
  Transfer_Order: one(Transfer_Order, {
    fields: [Transfer.transfer_order_id],
    references: [Transfer_Order.id],
  }),
}));

export const BrandNameRelations = relations(BrandName, ({ one, many }) => ({
  PharmacyStock_DrugsInPharmacies: many(PharmacyStock_Drugs),
  Formulary: one(Formulary, {
    fields: [BrandName.formulary_id],
    references: [Formulary.id],
  }),
  DosageForm_SizeUnit: one(DosageForm_SizeUnit, {
    fields: [BrandName.size_unit],
    references: [DosageForm_SizeUnit.id],
  }),
  DosageUnit_look_likeInPharmacies_brand_name_id: many(DosageUnit_look_like, {
    relationName: 'DosageUnit_look_like_brand_name_id_BrandName_id',
  }),
  DosageUnit_look_likeInPharmacies_look_like_id: many(DosageUnit_look_like, {
    relationName: 'DosageUnit_look_like_look_like_id_BrandName_id',
  }),
}));

export const StockCategoryRelations = relations(StockCategory, ({ many }) => ({
  PharmacyStock_DrugsInPharmacies: many(PharmacyStock_Drugs),
}));

export const ActiveIngredient_UseRelations = relations(
  ActiveIngredient_Use,
  ({ one }) => ({
    ActiveIngredient: one(ActiveIngredient, {
      fields: [ActiveIngredient_Use.ac_id],
      references: [ActiveIngredient.id],
    }),
    Use: one(Use, {
      fields: [ActiveIngredient_Use.use_id],
      references: [Use.id],
    }),
  })
);

export const ActiveIngredientRelations = relations(ActiveIngredient, ({ many }) => ({
  ActiveIngredient_UseInPharmacies: many(ActiveIngredient_Use),
  FormulationInPharmacies: many(Formulation),
}));

export const UseRelations = relations(Use, ({ many }) => ({
  ActiveIngredient_UseInPharmacies: many(ActiveIngredient_Use),
}));

export const DosageForm_SizeUnitRelations = relations(
  DosageForm_SizeUnit,
  ({ many }) => ({
    BrandNameInPharmacies: many(BrandName),
  })
);

export const DosageUnit_look_likeRelations = relations(
  DosageUnit_look_like,
  ({ one }) => ({
    BrandName_brand_name_id: one(BrandName, {
      fields: [DosageUnit_look_like.brand_name_id],
      references: [BrandName.id],
      relationName: 'DosageUnit_look_like_brand_name_id_BrandName_id',
    }),
    BrandName_look_like_id: one(BrandName, {
      fields: [DosageUnit_look_like.look_like_id],
      references: [BrandName.id],
      relationName: 'DosageUnit_look_like_look_like_id_BrandName_id',
    }),
  })
);

export const Formulary_ROARelations = relations(Formulary_ROA, ({ one }) => ({
  Formulary: one(Formulary, {
    fields: [Formulary_ROA.formulary_id],
    references: [Formulary.id],
  }),
  RouteOfAdministration: one(RouteOfAdministration, {
    fields: [Formulary_ROA.roa],
    references: [RouteOfAdministration.id],
  }),
}));

export const RouteOfAdministrationRelations = relations(
  RouteOfAdministration,
  ({ many }) => ({
    Formulary_ROAInPharmacies: many(Formulary_ROA),
  })
);

export const FormulationRelations = relations(Formulation, ({ one, many }) => ({
  Formulary: one(Formulary, {
    fields: [Formulation.formulary_id],
    references: [Formulary.id],
  }),
  ActiveIngredient: one(ActiveIngredient, {
    fields: [Formulation.ac_id],
    references: [ActiveIngredient.id],
  }),
  ActiveIngredient_Unit: one(ActiveIngredient_Unit, {
    fields: [Formulation.amount_unit],
    references: [ActiveIngredient_Unit.id],
  }),
  Formulation: one(Formulation, {
    fields: [Formulation.role_target],
    references: [Formulation.id],
    relationName: 'Formulation_role_target_Formulation_id',
  }),
  FormulationInPharmacies: many(Formulation, {
    relationName: 'Formulation_role_target_Formulation_id',
  }),
}));

export const ActiveIngredient_UnitRelations = relations(
  ActiveIngredient_Unit,
  ({ many }) => ({
    FormulationInPharmacies: many(Formulation),
  })
);

export const PharmacyTransaction_DrugsRelations = relations(
  PharmacyTransaction_Drugs,
  ({ one }) => ({
    PharmacyStock_Drugs: one(PharmacyStock_Drugs, {
      fields: [PharmacyTransaction_Drugs.item_id],
      references: [PharmacyStock_Drugs.id],
    }),
    Staff_pharmacist_id: one(Staff, {
      fields: [PharmacyTransaction_Drugs.pharmacist_id],
      references: [Staff.id],
      relationName: 'PharmacyTransaction_Drugs_pharmacist_id_Staff_id',
    }),
    Sec_pb_key: one(Sec_pb_key, {
      fields: [PharmacyTransaction_Drugs.pharmacist_sign_key],
      references: [Sec_pb_key.id],
    }),
    InPatient: one(InPatient, {
      fields: [PharmacyTransaction_Drugs.patient_id],
      references: [InPatient.id],
    }),
    MedPlan: one(MedPlan, {
      fields: [PharmacyTransaction_Drugs.med_plan_id],
      references: [MedPlan.id],
    }),
    Staff_dispensing_nurse_id: one(Staff, {
      fields: [PharmacyTransaction_Drugs.dispensing_nurse_id],
      references: [Staff.id],
      relationName: 'PharmacyTransaction_Drugs_dispensing_nurse_id_Staff_id',
    }),
  })
);

export const RefreshTokenRelations = relations(RefreshToken, ({ one }) => ({
  User: one(User, {
    fields: [RefreshToken.user_id],
    references: [User.id],
  }),
}));

export const UserRelations = relations(User, ({ one, many }) => ({
  RefreshTokenInSecurities: many(RefreshToken),
  Invoice_Drugss: many(Invoice_Drugs),
  PersonInPerson: one(Person, {
    fields: [User.person_id],
    references: [Person.id],
  }),
  Staff: one(Staff, {
    fields: [User.staff_id],
    references: [Staff.id],
  }),
  Sec_pb_key: one(Sec_pb_key, {
    fields: [User.pb_key_id],
    references: [Sec_pb_key.id],
  }),
  Sec_pv_key: one(Sec_pv_key, {
    fields: [User.pv_key_id],
    references: [Sec_pv_key.id],
  }),
}));

export const Sec_pv_keyRelations = relations(Sec_pv_key, ({ many }) => ({
  UserInSecurities: many(User),
}));

export const ReportsToRelations = relations(ReportsTo, ({ one }) => ({
  Staff_staff_id: one(Staff, {
    fields: [ReportsTo.staff_id],
    references: [Staff.id],
    relationName: 'ReportsTo_staff_id_Staff_id',
  }),
  Staff_reports_to_id: one(Staff, {
    fields: [ReportsTo.reports_to_id],
    references: [Staff.id],
    relationName: 'ReportsTo_reports_to_id_Staff_id',
  }),
}));

export const AdmissionRelations = relations(Admission, ({ one }) => ({
  InPatient: one(InPatient, {
    fields: [Admission.patient_id],
    references: [InPatient.id],
  }),
  Admission_Order: one(Admission_Order, {
    fields: [Admission.admission_order_id],
    references: [Admission_Order.id],
  }),
  Staff: one(Staff, {
    fields: [Admission.registrar],
    references: [Staff.id],
  }),
}));

export const Person_IdDocRelations = relations(Person_IdDoc, ({ one }) => ({
  IdDoc_typeInPerson: one(IdDoc_type, {
    fields: [Person_IdDoc.document_type],
    references: [IdDoc_type.id],
  }),
  PersonInPerson: one(Person, {
    fields: [Person_IdDoc.person_id],
    references: [Person.id],
  }),
}));

export const IdDoc_typeRelations = relations(IdDoc_type, ({ many }) => ({
  Person_IdDoc: many(Person_IdDoc),
}));

export const Person_relationshipRelations = relations(Person_relationship, ({ one }) => ({
  PersonInPerson_person_id: one(Person, {
    fields: [Person_relationship.person_id],
    references: [Person.id],
    relationName: 'Person_relationship_person_id_Person_id',
  }),
  PersonInPerson_related_to_id: one(Person, {
    fields: [Person_relationship.related_to_id],
    references: [Person.id],
    relationName: 'Person_relationship_related_to_id_Person_id',
  }),
}));
