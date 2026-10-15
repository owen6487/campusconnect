import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/Authcontext.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = import.meta.env.GOOGLE_CLIENT_ID || import.meta.env.REACT_APP_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID;
const hasGoogleClientId = !!googleClientId && googleClientId !== 'YOUR_GOOGLE_CLIENT_ID';

const app = (
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      {hasGoogleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>
      ) : (
        app
      )}
    </AuthProvider>
  </StrictMode>
);