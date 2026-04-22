/**
 * Real-world analytical matrix presets
 * Water, food, pharmaceutical, mineral, and teaching samples
 */

import type { MatrixPreset, MethodSheet } from "../engine/types"

export const MATRIX_PRESETS: MatrixPreset[] = [
  {
    id: "tap-water", name: { es: "Agua potable", en: "Tap water" },
    type: "water",
    typicalAnalytes: ["Ca²⁺", "Mg²⁺", "Cl⁻", "HCO₃⁻", "SO₄²⁻", "Fe²⁺/³⁺"],
    pH_range: [6.5, 8.5],
    ionicStrength: 0.005,
    notes: { es: "Dureza total 100–300 mg/L CaCO₃. Alcalinidad por bicarbonato.", en: "Total hardness 100–300 mg/L CaCO₃. Alkalinity from bicarbonate." },
    warnings: { es: "Cl₂ residual puede interferir en redox.", en: "Residual Cl₂ may interfere in redox." },
  },
  {
    id: "wastewater", name: { es: "Agua residual", en: "Wastewater" },
    type: "water",
    typicalAnalytes: ["NH₄⁺", "PO₄³⁻", "NO₃⁻", "DBO", "metales pesados"],
    pH_range: [5.0, 9.0],
    ionicStrength: 0.05,
    notes: { es: "Alta materia orgánica. Buffer fosfato/amonio.", en: "High organic matter. Phosphate/ammonium buffer." },
    warnings: { es: "Matrices coloreadas dificultan indicadores visuales.", en: "Colored matrices complicate visual indicators." },
  },
  {
    id: "milk", name: { es: "Leche", en: "Milk" },
    type: "food",
    typicalAnalytes: ["Ca²⁺", "PO₄³⁻", "lactato", "caseína", "citrato"],
    pH_range: [6.4, 6.8],
    ionicStrength: 0.08,
    notes: { es: "pH ≈ 6.6. Ca/P ratio ≈ 1.2–1.4. Buffer fosfato-citrato.", en: "pH ≈ 6.6. Ca/P ratio ≈ 1.2–1.4. Phosphate-citrate buffer." },
    warnings: { es: "Proteínas pueden secuestrar metales y falsear EDTA.", en: "Proteins may sequester metals and bias EDTA." },
  },
  {
    id: "vinegar", name: { es: "Vinagre", en: "Vinegar" },
    type: "food",
    typicalAnalytes: ["CH₃COOH", "H⁺"],
    pH_range: [2.4, 3.4],
    ionicStrength: 0.01,
    notes: { es: "4–8% m/v ácido acético. Acidez valorable con NaOH.", en: "4–8% m/v acetic acid. Titratable acidity with NaOH." },
    warnings: { es: "Color del vinagre balsámico interfiere con indicadores.", en: "Balsamic vinegar color interferes with indicators." },
  },
  {
    id: "aspirin", name: { es: "Aspirina (comprimido)", en: "Aspirin (tablet)" },
    type: "pharmaceutical",
    typicalAnalytes: ["C₉H₈O₄", "excipientes"],
    pH_range: [2.0, 4.0],
    ionicStrength: 0.01,
    notes: { es: "500 mg ácido acetilsalicílico por comprimido nominal.", en: "500 mg acetylsalicylic acid per tablet (nominal)." },
    warnings: { es: "Excipientes insolubles: filtrar o centrifugar.", en: "Insoluble excipients: filter or centrifuge." },
  },
  {
    id: "antacid", name: { es: "Antiácido (tableta)", en: "Antacid (tablet)" },
    type: "pharmaceutical",
    typicalAnalytes: ["CaCO₃", "Mg(OH)₂", "Al(OH)₃"],
    pH_range: [8.0, 10.0],
    ionicStrength: 0.02,
    notes: { es: "Retrotitulación con HCl/NaOH. Capacidad neutralizante.", en: "Back-titration with HCl/NaOH. Neutralizing capacity." },
    warnings: { es: "Al³⁺ interfiere con EDTA si se analiza Ca.", en: "Al³⁺ interferes with EDTA if analyzing Ca." },
  },
  {
    id: "limestone", name: { es: "Caliza (mineral)", en: "Limestone (mineral)" },
    type: "mineral",
    typicalAnalytes: ["CaCO₃", "MgCO₃", "Fe₂O₃", "SiO₂"],
    pH_range: [7.0, 9.0],
    ionicStrength: 0.01,
    notes: { es: "Digestión ácida previa (HCl). % CaCO₃ por retrotitulación.", en: "Prior acid digestion (HCl). % CaCO₃ by back-titration." },
    warnings: { es: "SiO₂ insoluble: filtrar. Fe interfiere en EDTA.", en: "SiO₂ insoluble: filter. Fe interferes in EDTA." },
  },
  {
    id: "iron-ore", name: { es: "Mineral de hierro", en: "Iron ore" },
    type: "mineral",
    typicalAnalytes: ["Fe₂O₃", "FeO", "SiO₂", "Al₂O₃"],
    pH_range: [1.0, 3.0],
    ionicStrength: 0.1,
    notes: { es: "Reducción Sn²⁺/Jones, valoración con K₂Cr₂O₇.", en: "Sn²⁺/Jones reduction, titration with K₂Cr₂O₇." },
    warnings: { es: "HF necesario para disolver silicatos (¡tóxico!).", en: "HF needed to dissolve silicates (toxic!)." },
  },
  {
    id: "buffer-lab", name: { es: "Práctica: buffer fosfato", en: "Lab: phosphate buffer" },
    type: "teaching",
    typicalAnalytes: ["NaH₂PO₄", "Na₂HPO₄"],
    pH_range: [6.0, 8.0],
    ionicStrength: 0.05,
    notes: { es: "Preparar buffer 0.05M pH 7.2. Verificar con pHmetro.", en: "Prepare 0.05M buffer pH 7.2. Verify with pH meter." },
    warnings: { es: "Calibrar electrodo con buffers 4.00 y 7.00 antes.", en: "Calibrate electrode with pH 4.00 and 7.00 first." },
  },
  {
    id: "hardness-lab", name: { es: "Práctica: dureza del agua", en: "Lab: water hardness" },
    type: "teaching",
    typicalAnalytes: ["Ca²⁺", "Mg²⁺"],
    pH_range: [9.5, 10.5],
    ionicStrength: 0.01,
    notes: { es: "Valorar con EDTA 0.01M, negro de eriocromo T, buffer NH₃/NH₄⁺ pH 10.", en: "Titrate with 0.01M EDTA, eriochrome black T, NH₃/NH₄⁺ buffer pH 10." },
    warnings: { es: "Fe/Mn interfieren; añadir KCN o dietilamina.", en: "Fe/Mn interfere; add KCN or diethylamine." },
  },
]

export const METHOD_SHEETS: MethodSheet[] = [
  {
    title: { es: "Determinación de acidez en vinagre", en: "Vinegar acidity determination" },
    reagents: [
      { name: "NaOH 0.1M", amount: "50 mL" },
      { name: "Fenolftaleína 1%", amount: "3 gotas" },
      { name: "Muestra de vinagre", amount: "10.00 mL (pipeta)" },
    ],
    conditions: { es: "Temperatura ambiente. Agitación constante.", en: "Room temperature. Constant stirring." },
    keyCalculations: [
      "% acidez = (V_NaOH × C_NaOH × M_HAc) / (V_muestra × ρ × 10)",
      "M_HAc = 60.05 g/mol",
    ],
    risks: [
      { es: "NaOH corrosivo: usar gafas y guantes", en: "NaOH corrosive: use goggles and gloves" },
    ],
    checklist: [
      { es: "Calibrar bureta", en: "Calibrate burette" },
      { es: "Pipetear muestra (no succionar con la boca)", en: "Pipette sample (do not mouth-pipette)" },
      { es: "Anotar volumen inicial y final", en: "Record initial and final volume" },
      { es: "Repetir hasta concordancia ±0.2 mL", en: "Repeat until agreement ±0.2 mL" },
    ],
  },
  {
    title: { es: "Dureza total del agua con EDTA", en: "Total water hardness with EDTA" },
    reagents: [
      { name: "EDTA 0.01M", amount: "50 mL" },
      { name: "Buffer NH₃/NH₄⁺ pH 10", amount: "5 mL" },
      { name: "EBT indicador", amount: "punta de espátula" },
      { name: "Muestra de agua", amount: "25.00 mL (pipeta)" },
    ],
    conditions: { es: "pH 10 controlado con buffer. T ambiente.", en: "pH 10 controlled with buffer. Room T." },
    keyCalculations: [
      "Dureza (mg/L CaCO₃) = (V_EDTA × C_EDTA × 100.09 × 1000) / V_muestra",
    ],
    risks: [
      { es: "Buffer amoniacal: trabajar con ventilación", en: "Ammonium buffer: work with ventilation" },
    ],
    checklist: [
      { es: "Añadir buffer ANTES del indicador", en: "Add buffer BEFORE indicator" },
      { es: "Color: rosa → azul al punto final", en: "Color: pink → blue at endpoint" },
      { es: "No exceder 5 min de valoración (CO₂)", en: "Do not exceed 5 min titration (CO₂)" },
      { es: "Triplicar y promediar", en: "Triplicate and average" },
    ],
  },
]
