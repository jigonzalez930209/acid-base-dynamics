import { toChemicalLatex, buildSymbolicSpecies } from "@/features/chemistry/lib/formulas"
import type { AcidRecord } from "@/features/chemistry/types/models"

export type EquilibriumStep = {
  index: number
  equation: string
  pKa: number
  mode: "structural" | "symbolic"
}

export const getEquilibriumSteps = (acid: AcidRecord): EquilibriumStep[] => {
  const hasStructuralSpecies = acid.equilibriumSpecies?.length === acid.pKas.length + 1
  const species = hasStructuralSpecies ? acid.equilibriumSpecies! : buildSymbolicSpecies(acid.proticType)

  return acid.pKas.map((pKa, index) => ({
    index: index + 1,
    equation: toChemicalLatex(`${species[index]} <=> H+ + ${species[index + 1]}`),
    pKa,
    mode: hasStructuralSpecies ? "structural" : "symbolic",
  }))
}
