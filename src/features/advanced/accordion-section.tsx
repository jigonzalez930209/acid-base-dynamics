import { ChevronDown } from "lucide-react"
import type { ReactNode } from "react"

type Props = {
  id: string
  title: string
  badge?: string
  open: boolean
  onToggle: (id: string) => void
  children: ReactNode
}

export function AccordionSection({ id, title, badge, open, onToggle, children }: Props) {
  return (
    <div className="rounded-md border border-border/40 bg-card/50 overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted/30"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{title}</span>
          {badge && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-border/30 px-5 py-5">
          {children}
        </div>
      )}
    </div>
  )
}
