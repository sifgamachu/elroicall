import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { MotionConfig } from 'framer-motion'
import './index.css'
import App from './App.tsx'
import AppErrorBoundary from './components/AppErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <AppErrorBoundary><App /></AppErrorBoundary>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
)
