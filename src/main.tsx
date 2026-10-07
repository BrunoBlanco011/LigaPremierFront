import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'
import { queryClient } from '@/lib/queryClient'
import { installStaggerFallback } from '@/lib/stagger'
import { AuthProvider } from '@/auth/AuthProvider'
import App from '@/App'
import './index.css'

installStaggerFallback()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* reducedMotion="user": motion respeta "reducir movimiento" del sistema */}
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 420, damping: 34 }}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </MotionConfig>
  </StrictMode>,
)
