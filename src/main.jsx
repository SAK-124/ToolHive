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

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1a0033 0%, #302b63 50%, #24243e 100%)',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1>Something went wrong</h1>
          <p>Please refresh the page or try again later.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App key={import.meta.env.VITE_APP_VERSION || '1.0.0'} />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)