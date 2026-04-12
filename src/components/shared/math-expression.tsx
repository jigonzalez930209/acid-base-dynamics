import katex from "katex"

import { cn } from "@/lib/utils"

type MathExpressionProps = {
  math: string
  block?: boolean
  className?: string
}

export function MathExpression({ math, block = false, className }: MathExpressionProps) {
  let html = ""
  try {
    html = katex.renderToString(math, {
      displayMode: block,
      errorColor: "#dc2626",
      throwOnError: false,
    })
  } catch (error) {
    console.error("KaTeX error:", error)
    html = math
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
