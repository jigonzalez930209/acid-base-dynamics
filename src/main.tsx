import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'katex/dist/katex.min.css'
import '@/features/i18n/i18n'
import './index.css'
import MinimalistLayout from './layouts/minimalist/index.tsx'
import { AppProviders } from '@/app/providers'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <MinimalistLayout />
    </AppProviders>
  </StrictMode>,
)
