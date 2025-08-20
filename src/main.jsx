import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext' // <-- 1. IMPORTAR

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider> {/* <-- 2. ENVOLVER LA APP */}
      <App />
    </AuthProvider>
  </StrictMode>,
)