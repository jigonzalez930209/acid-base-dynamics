import type { PropsWithChildren } from "react"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import { AppStatusBar } from "./app-status-bar"

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Skip link for a11y */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2 focus:bg-primary focus:text-primary-foreground">
        Skip to main content
      </a>

      <AppSidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <AppHeader />

        <main id="main-content" role="main" className="flex-1 overflow-y-auto">
          {children}
        </main>

        <AppStatusBar />
      </div>
    </div>
  )
}
