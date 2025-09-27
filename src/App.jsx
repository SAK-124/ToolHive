import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { isAdmin } from './utils/adminUtils';
import Home from './pages/Home';
import Tools from './pages/Tools';
import CloudConvert from './pages/CloudConvert';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';

// Protected Route Component
const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminStatus = await isAdmin(user.uid);
        setIsAdminUser(adminStatus);
      } else {
        setIsAdminUser(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1a0033 0%, #302b63 50%, #24243e 100%)',
        color: 'white'
      }}>
        <div>Checking admin access...</div>
      </div>
    );
  }

  return isAdminUser ? children : <Navigate to="/" replace />;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          console.log('Auth state changed:', currentUser?.email);
          setUser(currentUser);
          setLoading(false);
        });

        // Set a timeout to prevent infinite loading
        const timeout = setTimeout(() => {
          console.log('Auth timeout - setting loading to false');
          setLoading(false);
        }, 5000);

        return () => {
          clearTimeout(timeout);
          unsubscribe();
        };
      } catch (error) {
        console.error("Error setting persistence:", error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, [auth]);

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1a0033 0%, #302b63 50%, #24243e 100%)',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid rgba(255,255,255,0.3)',
          borderTop: '3px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>ToolHive</h2>
        <p style={{ margin: '0', opacity: 0.8 }}>Loading your AI tools...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute user={user}>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/tools"
        element={
          <PrivateRoute user={user}>
            <Tools />
          </PrivateRoute>
        }
      />
      <Route
        path="/tools/cloudconvert"
        element={
          <PrivateRoute user={user}>
            <CloudConvert />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

const PrivateRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default App;
