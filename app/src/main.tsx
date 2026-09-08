import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import './modern.css'
import App from './App.tsx'
import AppErrorBoundary from './components/AppErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
        <AppErrorBoundary><App /></AppErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
)
