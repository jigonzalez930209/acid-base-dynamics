import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import 'katex/dist/katex.min.css'
import '@/features/i18n/i18n'
import './index.css'
import MinimalistLayout from './layouts/minimalist/index.tsx'
import FullLayout from './layouts/full/index.tsx'
import ProLayout from './layouts/pro/index.tsx'
import { AppProviders } from '@/app/providers'

const PhosphLayout = lazy(() => import('./layouts/phosph/index.tsx'))
const DocLayout = lazy(() => import('./layouts/doc/index.tsx'))
const LaboratoryForm = lazy(() => import('./features/laboratory-form/laboratory-form.tsx'))

const Fallback = () => (
  <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
    Loading…
  </div>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <HashRouter>
        <Routes>
          <Route path="/" element={<MinimalistLayout />} />
          <Route path="/form" element={<Suspense fallback={<Fallback />}><LaboratoryForm /></Suspense>} />
          <Route path="/full" element={<FullLayout />} />
          <Route path="/pro" element={<ProLayout />} />
          <Route path="/phosph" element={<Suspense fallback={<Fallback />}><PhosphLayout /></Suspense>} />
          <Route path="/doc" element={<Suspense fallback={<Fallback />}><DocLayout /></Suspense>} />
        </Routes>
      </HashRouter>
    </AppProviders>
  </StrictMode>,
)
