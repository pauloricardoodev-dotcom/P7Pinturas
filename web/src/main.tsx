import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Remove a tela de carregamento assim que o app pintou o primeiro frame.
requestAnimationFrame(() => {
  const splash = document.getElementById('splash')
  if (!splash) return
  splash.style.transition = 'opacity .2s'
  splash.style.opacity = '0'
  setTimeout(() => splash.remove(), 220)
})
