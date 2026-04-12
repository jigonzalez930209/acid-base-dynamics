import { Link, useLocation } from "react-router-dom"

const LAYOUTS = [
  { path: "/", label: "Classic" },
  { path: "/minimalist", label: "Minimal" },
  { path: "/futuristic", label: "Futuristic" },
] as const

export function LayoutNav() {
  const { pathname } = useLocation()

  return (
    <nav className="flex items-center gap-0.5 rounded-lg border bg-muted/50 p-0.5 text-xs">
      {LAYOUTS.map(({ path, label }) => (
        <Link
          key={path}
          to={path}
          className={`rounded-md px-2.5 py-1 transition-colors ${
            pathname === path
              ? "bg-background text-foreground shadow-sm font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
