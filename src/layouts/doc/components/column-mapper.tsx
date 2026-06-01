import { useDoc } from "../doc-context"
import { COLUMN_DEFS } from "../engine/schema"
import type { ColumnField } from "../engine/schema"

type Props = { locale: "es" | "en" }

const LABELS = {
  es: { title: "Mapeo de columnas", subtitle: "Verificá que cada campo apunte a la columna correcta de tu Excel.", noHeader: "— No asignado —", preview: "Vista previa (3 filas)" },
  en: { title: "Column mapping", subtitle: "Verify that each field points to the correct column in your Excel.", noHeader: "— Not assigned —", preview: "Preview (3 rows)" },
}

export function ColumnMapper({ locale }: Props) {
  const { state, dispatch } = useDoc()
  const L = LABELS[locale]

  function setField(field: ColumnField, header: string) {
    dispatch({ type: "SET_MAPPING", mapping: { ...state.mapping, [field]: header || undefined } })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{L.title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{L.subtitle}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {COLUMN_DEFS.map((def) => {
          const currentHeader = state.mapping[def.field] ?? ""
          return (
            <label key={def.field} className="flex flex-col gap-1">
              <span className="flex items-center gap-1 text-xs font-medium text-foreground">
                {def.label[locale]}
                {def.required && <span className="text-destructive">*</span>}
              </span>
              <select
                value={currentHeader}
                onChange={(e) => setField(def.field, e.target.value)}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{L.noHeader}</option>
                {state.rawHeaders.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </label>
          )
        })}
      </div>
    </div>
  )
}
