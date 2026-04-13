import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import 'katex/dist/katex.min.css'
import '@/features/i18n/i18n'
import './index.css'
import MinimalistLayout from './layouts/minimalist/index.tsx'
import { FullLayout } from './layouts/full/index.tsx'
import { ProLayout } from './layouts/pro/index.tsx'
import { AppProviders } from '@/app/providers'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <HashRouter>
        <Routes>
          <Route path="/" element={<MinimalistLayout />} />
          <Route path="/full" element={<FullLayout />} />
          <Route path="/pro" element={<ProLayout />} />
        </Routes>
      </HashRouter>
    </AppProviders>
  </StrictMode>,
)
