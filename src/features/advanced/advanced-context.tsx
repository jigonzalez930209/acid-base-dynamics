import { createContext, useContext, useState } from "react"
import type { PropsWithChildren } from "react"

export type AdvancedContextValue = {
  advanced: boolean
  toggle: () => void
}

export const AdvancedContext = createContext<AdvancedContextValue>({ advanced: false, toggle: () => {} })

export function useAdvanced() {
  return useContext(AdvancedContext)
}

export function AdvancedProvider({ children }: PropsWithChildren) {
  const [advanced, setAdvanced] = useState(false)
  return (
    <AdvancedContext.Provider value={{ advanced, toggle: () => setAdvanced((v) => !v) }}>
      {children}
    </AdvancedContext.Provider>
  )
}
