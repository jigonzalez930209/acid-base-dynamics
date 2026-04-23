import { useRef, useState } from "react"
import { useDoc } from "../doc-context"
import { parseXlsx, readFileAsBuffer, detectColumnMapping } from "../engine/xlsx-parser"

type Props = { locale: "es" | "en" }

const LABELS = {
  es: {
    title: "Cargar datos del TP",
    subtitle: "Arrastrá tu archivo Excel o CSV aquí, o hacé clic para seleccionarlo.",
    privacy: "🔒 Ningún dato sale de tu navegador. Todo el procesamiento es local.",
    maxSize: "Tamaño máximo: 10 MB · Formatos: .xlsx, .csv",
    loading: "Procesando…",
    error: "Formato inválido o archivo demasiado grande (máx. 10 MB).",
    drop: "Soltá el archivo aquí",
    browse: "Seleccionar archivo",
    detected: "Archivo detectado:",
    rows: "filas",
  },
  en: {
    title: "Load TP data",
    subtitle: "Drag your Excel or CSV file here, or click to select it.",
    privacy: "🔒 No data leaves your browser. All processing is local.",
    maxSize: "Max size: 10 MB · Formats: .xlsx, .csv",
    loading: "Processing…",
    error: "Invalid format or file too large (max 10 MB).",
    drop: "Drop file here",
    browse: "Select file",
    detected: "Detected file:",
    rows: "rows",
  },
}

const MAX_BYTES = 10 * 1024 * 1024

export function FileDropzone({ locale }: Props) {
  const { dispatch } = useDoc()
  const L = LABELS[locale]
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function processFile(file: File) {
    setError(null)
    if (file.size > MAX_BYTES) { setError(L.error); return }
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!["xlsx", "csv", "xls"].includes(ext ?? "")) { setError(L.error); return }

    setLoading(true)
    try {
      const buffer = await readFileAsBuffer(file)
      const autoMapping = detectColumnMapping([])
      const result = parseXlsx(buffer, autoMapping)
      dispatch({
        type: "LOAD_DATA",
        rows: result.rows,
        errors: result.errors,
        mapping: result.autoMapping,
        rawHeaders: result.rawHeaders,
        totalRawRows: result.totalRawRows,
        fileName: file.name,
      })
    } catch {
      setError(L.error)
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">{L.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{L.subtitle}</p>
      </div>

      {/* Privacy banner */}
      <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400">
        {L.privacy}
      </div>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label={L.browse}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click() }}
        className={[
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer",
          "min-h-[160px] p-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/40 hover:bg-muted/30",
        ].join(" ")}
      >
        {loading ? (
          <span className="text-sm text-muted-foreground animate-pulse">{L.loading}</span>
        ) : (
          <>
            <svg className="h-10 w-10 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="text-sm font-medium text-muted-foreground">
              {dragging ? L.drop : L.browse}
            </span>
            <span className="text-xs text-muted-foreground/70">{L.maxSize}</span>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="sr-only"
        aria-hidden
        onChange={onInputChange}
      />
    </div>
  )
}
