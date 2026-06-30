import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Viewer } from './components/Viewer.tsx'

// Sporter-viewer (Slice 5): de kale alleen-lezen rapportpagina draait op .../?rapport.
// Geen router nodig — statisch gehost (ADR-0005), dus we kiezen op de query.
const isViewer = new URLSearchParams(window.location.search).has('rapport')

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isViewer ? <Viewer /> : <App />}</StrictMode>,
)
