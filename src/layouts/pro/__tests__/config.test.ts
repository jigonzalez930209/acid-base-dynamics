/**
 * Pro layout types & config integration tests.
 */
import { describe, it, expect } from "vitest"
import { MODULE_DEFINITIONS } from "@/layouts/pro/config/modules"
import type { ModuleId } from "@/layouts/pro/types"

describe("MODULE_DEFINITIONS", () => {
  it("defines 8 modules", () => {
    expect(MODULE_DEFINITIONS).toHaveLength(8)
  })

  it("each module has required fields", () => {
    for (const mod of MODULE_DEFINITIONS) {
      expect(mod.id).toBeTruthy()
      expect(mod.icon).toBeTruthy()
      expect(mod.label.es).toBeTruthy()
      expect(mod.label.en).toBeTruthy()
      expect(mod.description.es).toBeTruthy()
      expect(mod.description.en).toBeTruthy()
      expect(mod.color).toBeTruthy()
    }
  })

  it("all module IDs are unique", () => {
    const ids = MODULE_DEFINITIONS.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("all module IDs are valid ModuleId values", () => {
    const validIds: ModuleId[] = [
      "dashboard", "acid-base", "complexation", "precipitation",
      "redox", "lab-tools", "visualization", "education", "settings",
    ]
    for (const mod of MODULE_DEFINITIONS) {
      expect(validIds).toContain(mod.id)
    }
  })

  it("subRoutes have unique IDs within each module", () => {
    for (const mod of MODULE_DEFINITIONS) {
      if (!mod.subRoutes) continue
      const ids = mod.subRoutes.map((sr) => sr.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })
})
