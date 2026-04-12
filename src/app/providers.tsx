import type { PropsWithChildren } from "react"

import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/features/theme/theme-provider"
import { AdvancedProvider } from "@/features/advanced/advanced-context"

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <AdvancedProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </AdvancedProvider>
    </ThemeProvider>
  )
}
