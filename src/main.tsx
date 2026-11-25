import { createRoot } from 'react-dom/client'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/schibsted-grotesk/index.css'
import './index.css'
import './day.css'
import App from './App'

// StrictMode is left off: its double-mount in development fights the separate
// React roots that drei's <Html> markers create inside the WebGL canvas.
createRoot(document.getElementById('root')!).render(<App />)
