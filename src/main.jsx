// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { setPersistence, browserLocalPersistence } from 'firebase/auth'
import App from './App'
import './global.css'  // import your global styles
import { auth } from './firebase/config'

// Set persistence to LOCAL (this will persist the auth state)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Firebase persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });

// Add version number to help with cache busting
console.log('App Version:', import.meta.env.VITE_APP_VERSION || '1.0.0');
console.log('Environment:', import.meta.env.MODE);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App key={import.meta.env.VITE_APP_VERSION || '1.0.0'} />
    </BrowserRouter>
  </React.StrictMode>
)