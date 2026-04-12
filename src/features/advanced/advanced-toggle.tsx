import { FlaskConical } from "lucide-react"
import { useAdvanced } from "./advanced-context"

export function AdvancedToggle() {
  const { advanced, toggle } = useAdvanced()

  return (
    <button
      onClick={toggle}
      className={`flex size-8 items-center justify-center rounded-md border transition-colors ${
        advanced
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
      }`}
      aria-label={advanced ? "Disable advanced mode" : "Enable advanced mode"}
      title={advanced ? "Advanced mode on" : "Advanced mode"}
    >
      <FlaskConical className="size-4" />
    </button>
  )
}
