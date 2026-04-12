import katex from "katex"

import { toChemicalLatex } from "@/features/chemistry/lib/formulas"
import { cn } from "@/lib/utils"

type ChemicalFormulaProps = {
  formula: string
  block?: boolean
  className?: string
}

export function ChemicalFormula({ formula, block = false, className }: ChemicalFormulaProps) {
  if (!formula) {
    return null
  }

  const expression = toChemicalLatex(formula)

  let html = ""
  try {
    html = katex.renderToString(expression, {
      displayMode: block,
      errorColor: "#dc2626",
      throwOnError: false,
    })
  } catch (error) {
    console.error("KaTeX error:", error)
    html = expression
  }

  const Wrapper = block ? "div" : "span"

  return (
    <Wrapper
      className={cn(
        block ? "[&_.katex-display]:m-0" : "inline-flex items-center [&_.katex]:text-current",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
