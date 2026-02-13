export type SeedConfigSchema =
  | {
      all: true;
    }
  | {
      data?: boolean;
      menus?: boolean;
      diagnoses?: boolean;
      user?: boolean;
    }
  | {
      patient:
        | boolean
        | {
            admissions?: boolean;
            transfers?: boolean;
            discharges?: boolean;
          };
    }
  | {
      menus: {
        wards?: boolean;
        id_doc_types?: boolean;
        discharge_reasons?: boolean;
        dosage_unit?: boolean;
        stock_categories?: boolean;
        contact_types?: boolean;
      };
    };
