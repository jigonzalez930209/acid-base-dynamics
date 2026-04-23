import { useDoc } from "../doc-context"
import { FileDropzone } from "../components/file-dropzone"
import { ColumnMapper } from "../components/column-mapper"

type Props = { locale: "es" | "en" }

const LABELS = {
  es: { goValidate: "Revisar datos →", minRows: "Se necesitan al menos 5 filas válidas para continuar." },
  en: { goValidate: "Review data →", minRows: "At least 5 valid rows are needed to continue." },
}

export function UploadView({ locale }: Props) {
  const { state, dispatch } = useDoc()
  const L = LABELS[locale]
  const hasData = state.rawRows.length >= 5

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <FileDropzone locale={locale} />

      {state.rawHeaders.length > 0 && (
        <>
          <ColumnMapper locale={locale} />
          <button
            type="button"
            disabled={!hasData}
            onClick={() => dispatch({ type: "GO_TO", step: "validate" })}
            className={[
              "w-full rounded-lg px-4 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              hasData
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            ].join(" ")}
          >
            {hasData ? L.goValidate : L.minRows}
          </button>
        </>
      )}
    </div>
  )
}
