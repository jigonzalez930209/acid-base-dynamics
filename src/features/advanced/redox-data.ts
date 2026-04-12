export type HalfReaction = {
  id: string
  label: { es: string; en: string }
  E0: number   // standard reduction potential, V vs SHE
  n: number    // electrons transferred
}

export const HALF_REACTIONS: HalfReaction[] = [
  { id: "mno4-mn2",   label: { es: "MnO₄⁻ / Mn²⁺ (H₂SO₄)",       en: "MnO₄⁻ / Mn²⁺ (H₂SO₄)"       }, E0:  1.510, n: 5 },
  { id: "cl2-cl",     label: { es: "Cl₂ / Cl⁻",                    en: "Cl₂ / Cl⁻"                    }, E0:  1.360, n: 2 },
  { id: "cr2o7-cr3",  label: { es: "Cr₂O₇²⁻ / Cr³⁺ (ácido)",      en: "Cr₂O₇²⁻ / Cr³⁺ (acid)"       }, E0:  1.330, n: 6 },
  { id: "o2-h2o",     label: { es: "O₂ / H₂O (ácido, 1 atm)",      en: "O₂ / H₂O (acid, 1 atm)"       }, E0:  1.229, n: 4 },
  { id: "fe3-fe2",    label: { es: "Fe³⁺ / Fe²⁺",                  en: "Fe³⁺ / Fe²⁺"                  }, E0:  0.771, n: 1 },
  { id: "cu2-cu",     label: { es: "Cu²⁺ / Cu",                    en: "Cu²⁺ / Cu"                    }, E0:  0.337, n: 2 },
  { id: "she",        label: { es: "2H⁺ / H₂ (SHE, referencia)",   en: "2H⁺ / H₂ (SHE, reference)"   }, E0:  0.000, n: 2 },
  { id: "fe2-fe",     label: { es: "Fe²⁺ / Fe",                    en: "Fe²⁺ / Fe"                    }, E0: -0.440, n: 2 },
  { id: "zn2-zn",     label: { es: "Zn²⁺ / Zn",                   en: "Zn²⁺ / Zn"                   }, E0: -0.763, n: 2 },
  { id: "mg2-mg",     label: { es: "Mg²⁺ / Mg",                   en: "Mg²⁺ / Mg"                   }, E0: -2.372, n: 2 },
]
