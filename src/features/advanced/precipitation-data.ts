export type HydroxideEntry = {
  id: string
  formula: string
  label: { es: string; en: string }
  Ksp: number
  n: number   // charge of metal cation M^n+
}

export const HYDROXIDE_DATA: HydroxideEntry[] = [
  { id: "fe-oh3", formula: "Fe(OH)₃", label: { es: "Fe(OH)₃ · Hierro(III)",   en: "Fe(OH)₃ · Iron(III)"    }, Ksp: 2.79e-39, n: 3 },
  { id: "al-oh3", formula: "Al(OH)₃", label: { es: "Al(OH)₃ · Aluminio",      en: "Al(OH)₃ · Aluminum"     }, Ksp: 1.30e-33, n: 3 },
  { id: "cr-oh3", formula: "Cr(OH)₃", label: { es: "Cr(OH)₃ · Cromo(III)",   en: "Cr(OH)₃ · Chromium(III)" }, Ksp: 6.30e-31, n: 3 },
  { id: "cu-oh2", formula: "Cu(OH)₂", label: { es: "Cu(OH)₂ · Cobre",        en: "Cu(OH)₂ · Copper"       }, Ksp: 2.19e-19, n: 2 },
  { id: "pb-oh2", formula: "Pb(OH)₂", label: { es: "Pb(OH)₂ · Plomo",        en: "Pb(OH)₂ · Lead"         }, Ksp: 1.43e-20, n: 2 },
  { id: "zn-oh2", formula: "Zn(OH)₂", label: { es: "Zn(OH)₂ · Zinc",         en: "Zn(OH)₂ · Zinc"         }, Ksp: 3.00e-17, n: 2 },
  { id: "fe-oh2", formula: "Fe(OH)₂", label: { es: "Fe(OH)₂ · Hierro(II)",   en: "Fe(OH)₂ · Iron(II)"     }, Ksp: 4.87e-17, n: 2 },
  { id: "ni-oh2", formula: "Ni(OH)₂", label: { es: "Ni(OH)₂ · Níquel",       en: "Ni(OH)₂ · Nickel"       }, Ksp: 5.48e-16, n: 2 },
  { id: "mg-oh2", formula: "Mg(OH)₂", label: { es: "Mg(OH)₂ · Magnesio",     en: "Mg(OH)₂ · Magnesium"    }, Ksp: 5.61e-12, n: 2 },
  { id: "ca-oh2", formula: "Ca(OH)₂", label: { es: "Ca(OH)₂ · Calcio",       en: "Ca(OH)₂ · Calcium"      }, Ksp: 4.68e-6,  n: 2 },
]
