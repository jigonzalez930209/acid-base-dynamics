import "katex/dist/contrib/mhchem.mjs"

const buildAlphaTerm = (order: number, index: number) => {
  const protonPower = order - index
  const acidTerm = Array.from({ length: index }, (_, step) => `K_{a${step + 1}}`).join(" ")
  const protonTerm =
    protonPower === 0 ? "" : protonPower === 1 ? "[H^+]" : `[H^+]^{${protonPower}}`

  return [acidTerm, protonTerm].filter(Boolean).join(" ") || "1"
}

const buildChargeFragment = (charge: number) => {
  if (charge === 0) {
    return ""
  }

  if (charge === 1) {
    return "-"
  }

  return `^${charge}-`
}

export const toChemicalLatex = (expression: string) => String.raw`\ce{${expression}}`

export const buildSymbolicSpecies = (proticType: number) =>
  Array.from({ length: proticType + 1 }, (_, stage) => {
    const protonCount = proticType - stage
    const protonFragment = protonCount <= 0 ? "" : protonCount === 1 ? "H" : `H${protonCount}`
    return `${protonFragment}A${buildChargeFragment(stage)}`
  })

export const buildAlphaModel = (order: number) => {
  const denominator = Array.from({ length: order + 1 }, (_, index) => buildAlphaTerm(order, index)).join(" + ")
  const alphaExpressions = Array.from({ length: order + 1 }, (_, index) => {
    const numerator = buildAlphaTerm(order, index)
    return String.raw`\alpha_${index} = \frac{${numerator}}{D}`
  })

  return {
    denominator: String.raw`D = ${denominator}`,
    alphaExpressions,
    averageCharge: String.raw`\bar{n} = \sum_{i=0}^{${order}} i\alpha_i`,
    titration: String.raw`V_b = V_0\,\frac{C_a\bar{n} - [H^+] + [OH^-]}{C_b + [H^+] - [OH^-]}`,
    concentrations: String.raw`[H^+] = 10^{-pH}\qquad[OH^-] = 10^{-(14-pH)}`,
  }
}
