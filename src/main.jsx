import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
const GOOGLE_CLIENT_ID = "1072043026462-47uq1p82pada82f6a0f6jt9sfpntj1qi.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
