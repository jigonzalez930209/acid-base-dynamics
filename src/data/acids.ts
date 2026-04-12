import type { AcidRecord, SlotState, SlotStyle } from "@/features/chemistry/types/models"

const buildAcid = (
  id: string,
  names: AcidRecord["names"],
  formula: string,
  pKas: number[],
  overrides: Partial<AcidRecord> = {}
): AcidRecord => ({
  id,
  names,
  formula,
  pKas,
  proticType: pKas.length as AcidRecord["proticType"],
  ...overrides,
})

export const ACID_DATABASE: AcidRecord[] = [
  buildAcid("none", { es: "Sin sistema", en: "No system" }, "", []),
  buildAcid("1-butanoico", { es: "1-Butanóico", en: "Butyric Acid" }, "CH3CH2CH2COOH", [4.81], {
    equilibriumSpecies: ["CH3CH2CH2COOH", "CH3CH2CH2COO-"],
  }),
  buildAcid("acetico", { es: "Ácido acético", en: "Acetic Acid" }, "CH3COOH", [4.75], {
    equilibriumSpecies: ["CH3COOH", "CH3COO-"],
  }),
  buildAcid(
    "acetil-salicilico",
    { es: "Ácido acetilsalicílico", en: "Acetylsalicylic Acid" },
    "C9H8O4",
    [3.49],
    { equilibriumSpecies: ["C9H8O4", "C9H7O4-"] }
  ),
  buildAcid("arsenico", { es: "Ácido arsénico", en: "Arsenic Acid" }, "H3AsO4", [2.23, 6.95, 11.49], {
    equilibriumSpecies: ["H3AsO4", "H2AsO4-", "HAsO4^2-", "AsO4^3-"],
  }),
  buildAcid("arsenioso", { es: "Ácido arsenioso", en: "Arsenous Acid" }, "H3AsO3", [9.29], {
    notes: {
      es: "La tabla del PDF solo informa el primer pKa utilizable del sistema.",
      en: "The PDF only reports the first usable pKa for this system.",
    },
  }),
  buildAcid("benzoico", { es: "Ácido benzoico", en: "Benzoic Acid" }, "C6H5COOH", [4.2], {
    equilibriumSpecies: ["C6H5COOH", "C6H5COO-"],
  }),
  buildAcid("borico", { es: "Ácido bórico", en: "Boric Acid" }, "H3BO3", [9.23], {
    notes: {
      es: "La disociación real de H3BO3 es especial; el simulador trabaja con el dato tabulado del PDF.",
      en: "The real dissociation of H3BO3 is special; the simulator uses the tabulated PDF value.",
    },
  }),
  buildAcid("carbonico", { es: "Ácido carbónico", en: "Carbonic Acid" }, "H2CO3", [6.35, 10.32], {
    equilibriumSpecies: ["H2CO3", "HCO3-", "CO3^2-"],
  }),
  buildAcid("cianhidrico", { es: "Ácido cianhídrico", en: "Hydrocyanic Acid" }, "HCN", [9.2], {
    equilibriumSpecies: ["HCN", "CN-"],
  }),
  buildAcid(
    "citrico",
    { es: "Ácido cítrico", en: "Citric Acid" },
    "HO2C(OH)C(CH2CO2H)2",
    [3.08, 4.74, 6.3],
    { equilibriumSpecies: ["H3Cit", "H2Cit-", "HCit^2-", "Cit^3-"] }
  ),
  buildAcid("cloroacetico", { es: "Ácido cloroacético", en: "Chloroacetic Acid" }, "ClCH2COOH", [2.86], {
    equilibriumSpecies: ["ClCH2COOH", "ClCH2COO-"],
  }),
  buildAcid("fenol", { es: "Fenol", en: "Phenol" }, "C6H5OH", [10], {
    equilibriumSpecies: ["C6H5OH", "C6H5O-"],
  }),
  buildAcid("fluorhidrico", { es: "Ácido fluorhídrico", en: "Hydrofluoric Acid" }, "HF", [3.16], {
    equilibriumSpecies: ["HF", "F-"],
  }),
  buildAcid("formico", { es: "Ácido fórmico", en: "Formic Acid" }, "HCOOH", [3.74], {
    equilibriumSpecies: ["HCOOH", "HCOO-"],
  }),
  buildAcid("fosforico", { es: "Ácido fosfórico", en: "Phosphoric Acid" }, "H3PO4", [2.14, 7.19, 12.34], {
    equilibriumSpecies: ["H3PO4", "H2PO4-", "HPO4^2-", "PO4^3-"],
  }),
  buildAcid("fosforoso", { es: "Ácido fosforoso", en: "Phosphorous Acid" }, "H3PO3", [1.52, 6.79], {
    equilibriumSpecies: ["H3PO3", "H2PO3-", "HPO3^2-"],
    notes: {
      es: "El ácido fosforoso se modela como diprótico, tal como aparece en la tabla.",
      en: "Phosphorous acid is modeled as diprotic, as shown in the table.",
    },
  }),
  buildAcid("fumarico", { es: "Ácido fumárico", en: "Fumaric Acid" }, "trans-HOOCCH=CHCOOH", [3.05, 4.49]),
  buildAcid("glicolico", { es: "Ácido glicólico", en: "Glycolic Acid" }, "HOCH2COOH", [3.83], {
    equilibriumSpecies: ["HOCH2COOH", "HOCH2COO-"],
  }),
  buildAcid("hidrazoico", { es: "Ácido hidrazoico", en: "Hydrazoic Acid" }, "HN3", [4.65], {
    equilibriumSpecies: ["HN3", "N3-"],
  }),
  buildAcid("hipocloroso", { es: "Ácido hipocloroso", en: "Hypochlorous Acid" }, "HClO", [7.52], {
    equilibriumSpecies: ["HClO", "ClO-"],
  }),
  buildAcid("ion-amonio", { es: "Ion amonio", en: "Ammonium Ion" }, "NH4+", [9.24], {
    equilibriumSpecies: ["NH4+", "NH3"],
  }),
  buildAcid("ion-anilinio", { es: "Ion anilinio", en: "Anilinium Ion" }, "C6H5NH3+", [4.6], {
    equilibriumSpecies: ["C6H5NH3+", "C6H5NH2"],
  }),
  buildAcid(
    "ion-dimetil-amonio",
    { es: "Ion dimetil amonio", en: "Dimethylammonium Ion" },
    "(CH3)2NH2+",
    [10.77],
    { equilibriumSpecies: ["(CH3)2NH2+", "(CH3)2NH"] }
  ),
  buildAcid(
    "ion-etanol-amonio",
    { es: "Ion etanol amonio", en: "Ethanolammonium Ion" },
    "HOC2H4NH3+",
    [9.49],
    { equilibriumSpecies: ["HOC2H4NH3+", "HOC2H4NH2"] }
  ),
  buildAcid("ion-etil-amonio", { es: "Ion etil amonio", en: "Ethylammonium Ion" }, "C2H5NH3+", [10.63], {
    equilibriumSpecies: ["C2H5NH3+", "C2H5NH2"],
  }),
  buildAcid(
    "ion-etilen-amonio",
    { es: "Ion etilén amonio", en: "Ethylenediammonium Ion" },
    "H3NCH2CH2NH3^2+",
    [6.84, 9.92],
    { equilibriumSpecies: ["H3NCH2CH2NH3^2+", "H2NCH2CH2NH3+", "H2NCH2CH2NH2"] }
  ),
  buildAcid("ion-hidrazinio", { es: "Ion hidrazinio", en: "Hydrazinium Ion" }, "H2NNH3+", [7.97], {
    equilibriumSpecies: ["H2NNH3+", "H2NNH2"],
  }),
  buildAcid(
    "ion-hidroxil-amonio",
    { es: "Ion hidroxil amonio", en: "Hydroxylammonium Ion" },
    "HONH3+",
    [5.95],
    { equilibriumSpecies: ["HONH3+", "HONH2"] }
  ),
  buildAcid("ion-metil-amonio", { es: "Ion metil amonio", en: "Methylammonium Ion" }, "CH3NH3+", [10.63], {
    equilibriumSpecies: ["CH3NH3+", "CH3NH2"],
  }),
  buildAcid(
    "ion-piperidinio",
    { es: "Ion piperidinio", en: "Piperidinium Ion" },
    "C5H11NH+",
    [11.12],
    { equilibriumSpecies: ["C5H11NH+", "C5H11N"] }
  ),
  buildAcid("ion-piridinio", { es: "Ion piridinio", en: "Pyridinium Ion" }, "C5H5NH+", [5.22], {
    equilibriumSpecies: ["C5H5NH+", "C5H5N"],
  }),
  buildAcid(
    "ion-trimetil-amonio",
    { es: "Ion trimetil amonio", en: "Trimethylammonium Ion" },
    "(CH3)3NH+",
    [9.8],
    { equilibriumSpecies: ["(CH3)3NH+", "(CH3)3N"] }
  ),
  buildAcid("lactico", { es: "Ácido láctico", en: "Lactic Acid" }, "CH3CHOHCOOH", [3.86], {
    equilibriumSpecies: ["CH3CHOHCOOH", "CH3CHOHCOO-"],
  }),
  buildAcid("maleico", { es: "Ácido maleico", en: "Maleic Acid" }, "cis-HOOCCH=CHCOOH", [1.88, 6.22]),
  buildAcid("malico", { es: "Ácido málico", en: "Malic Acid" }, "HOOCCHOHCH2COOH", [3.45, 5.09]),
  buildAcid("malonico", { es: "Ácido malónico", en: "Malonic Acid" }, "HOOCCH2COOH", [2.84, 5.69]),
  buildAcid("mandelico", { es: "Ácido mandélico", en: "Mandelic Acid" }, "C6H5(CHOHCOOH)", [3.39]),
  buildAcid("nitroso", { es: "Ácido nitroso", en: "Nitrous Acid" }, "HNO2", [3.14], {
    equilibriumSpecies: ["HNO2", "NO2-"],
  }),
  buildAcid("o-ftalico", { es: "Ácido o-ftálico", en: "o-Phthalic Acid" }, "C6H4(COOH)2", [2.95, 5.41]),
  buildAcid("oxalico", { es: "Ácido oxálico", en: "Oxalic Acid" }, "HOOCCOOH", [1.25, 4.26], {
    equilibriumSpecies: ["H2C2O4", "HC2O4-", "C2O4^2-"],
  }),
  buildAcid(
    "peroxido-hidrogeno",
    { es: "Peróxido de hidrógeno", en: "Hydrogen Peroxide" },
    "H2O2",
    [11.65],
    { equilibriumSpecies: ["H2O2", "HO2-"] }
  ),
  buildAcid("periodico", { es: "Ácido periódico", en: "Periodic Acid" }, "H2IO6", [1.69, 8.3], {
    notes: {
      es: "La tabla usa H2IO6 como convención de formulación del sistema.",
      en: "The table uses H2IO6 as the system formulation convention.",
    },
  }),
  buildAcid("picrico", { es: "Ácido pícrico", en: "Picric Acid" }, "(NO2)3C6H2OH", [0.36], {
    equilibriumSpecies: ["(NO2)3C6H2OH", "(NO2)3C6H2O-"],
  }),
  buildAcid("piruvico", { es: "Ácido pirúvico", en: "Pyruvic Acid" }, "CH3COCOOH", [2.49], {
    equilibriumSpecies: ["CH3COCOOH", "CH3COCOO-"],
  }),
  buildAcid("propanoico", { es: "Ácido propanoico", en: "Propionic Acid" }, "CH3CH2COOH", [4.87], {
    equilibriumSpecies: ["CH3CH2COOH", "CH3CH2COO-"],
  }),
  buildAcid("salicilico", { es: "Ácido salicílico", en: "Salicylic Acid" }, "C6H4(OH)COOH", [2.97], {
    equilibriumSpecies: ["C6H4(OH)COOH", "C6H4(OH)COO-"],
    notes: {
      es: "Se muestra el pKa carboxílico tabulado; el OH fenólico queda fuera del modelo base.",
      en: "The tabulated carboxylic pKa is shown; the phenolic OH stays outside the base model.",
    },
  }),
  buildAcid("succinico", { es: "Ácido succínico", en: "Succinic Acid" }, "HOOCCH2CH2COOH", [4.2, 5.63]),
  buildAcid("sulfamico", { es: "Ácido sulfámico", en: "Sulfamic Acid" }, "H2NSO3H", [0.98], {
    equilibriumSpecies: ["H2NSO3H", "H2NSO3-"] ,
  }),
  buildAcid("sulfurico", { es: "Ácido sulfúrico", en: "Sulfuric Acid" }, "H2SO4", [1.99], {
    sourcePkas: [null, 1.99],
    equilibriumSpecies: ["HSO4-", "SO4^2-"],
    notes: {
      es: "El PDF marca la primera disociación como fuerte; el modelo simula el segundo equilibrio tabulado.",
      en: "The PDF marks the first dissociation as strong; the model simulates the second tabulated equilibrium.",
    },
  }),
  buildAcid("sulfhidrico", { es: "Ácido sulfhídrico", en: "Hydrogen Sulfide" }, "H2S", [7.01, 13.88], {
    equilibriumSpecies: ["H2S", "HS-", "S^2-"],
  }),
  buildAcid("sulfuroso", { es: "Ácido sulfuroso", en: "Sulfurous Acid" }, "H2SO3", [1.91, 7.18], {
    equilibriumSpecies: ["H2SO3", "HSO3-", "SO3^2-"],
  }),
  buildAcid("tartarico", { es: "Ácido tartárico", en: "Tartaric Acid" }, "HOOC(CHOH)2COOH", [3.03, 4.36], {
    notes: {
      es: "Se conservan los pKa del PDF aunque la lectura OCR del Ka1 aparece dañada.",
      en: "The PDF pKa values are preserved although the OCR reading of Ka1 appears damaged.",
    },
  }),
  buildAcid("tiocianico", { es: "Ácido tiociánico", en: "Thiocyanic Acid" }, "HSCN", [0.88], {
    equilibriumSpecies: ["HSCN", "SCN-"],
  }),
  buildAcid("tiosulfurico", { es: "Ácido tiosulfúrico", en: "Thiosulfuric Acid" }, "H2S2O3", [0.52, 1.6]),
  buildAcid(
    "tricloroacetico",
    { es: "Ácido tricloroacético", en: "Trichloroacetic Acid" },
    "Cl3CCOOH",
    [-0.47],
    {
      equilibriumSpecies: ["Cl3CCOOH", "Cl3CCOO-"],
      notes: {
        es: "El valor de Ka1 aparece truncado en el OCR; el pKa del PDF se conserva como referencia.",
        en: "The OCR truncates Ka1; the PDF pKa is preserved as the reference value.",
      },
    }
  ),
  buildAcid("yodico", { es: "Ácido yódico", en: "Iodic Acid" }, "HIO3", [0.76], {
    equilibriumSpecies: ["HIO3", "IO3-"],
  }),
]

export const SLOT_STYLES: SlotStyle[] = [
  { color: "#0f766e", dash: "", glow: "rgba(15, 118, 110, 0.18)" },
  { color: "#ea580c", dash: "7 4", glow: "rgba(234, 88, 12, 0.18)" },
  { color: "#2563eb", dash: "3 4", glow: "rgba(37, 99, 235, 0.18)" },
]

export const DEFAULT_SLOT_IDS = ["fosforico", "citrico", "carbonico"]

export const ACID_LOOKUP = new Map(ACID_DATABASE.map((acid) => [acid.id, acid]))

export const SUPPORTED_ACID_COUNT = ACID_DATABASE.filter((acid) => acid.id !== "none").length

export const getAcidById = (id: string): AcidRecord => ACID_LOOKUP.get(id) ?? ACID_DATABASE[0]

export const createInitialSlots = (): SlotState[] =>
  SLOT_STYLES.map((style, index) => {
    const acidId = DEFAULT_SLOT_IDS[index] ?? "none"
    const acid = getAcidById(acidId)

    return {
      acidId,
      pKas: [...acid.pKas],
      concentrationCA: 0.1,
      concentrationCB: 0.1,
      ...style,
    }
  })
