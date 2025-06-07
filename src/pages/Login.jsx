// Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  TextField,
  Alert,
} from '@mui/material';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';
import { auth } from '../firebase/config';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isManualLogin, setIsManualLogin] = useState(false);

  const googleProvider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    try {
      // Add additional scopes if needed
      googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
      googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
      
      // Set custom parameters for Google sign-in
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, googleProvider);
      setSuccess('Google login successful! Redirecting...');
      navigate('/');
    } catch (err) {
      // More descriptive error message for unauthorized domain
      if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google Sign In. Please add your domain to the Firebase Console under Authentication > Sign-in Methods > Google > Authorized Domains.');
      } else {
        setError(err.message);
      }
    }
  };

  const handleManualAuthAction = async () => {
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter a valid email and password.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      setSuccess('Login successful! Redirecting...');
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Gradient Backdrop */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #1a0033 0%, #330066 100%)',
          zIndex: 0,
          filter: 'blur(100px) brightness(0.7)',
          transform: 'scale(1.2)'
        }}
      />

      {/* Header */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            component={Link}
            to="/tools"
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            All Tools
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Container 
        maxWidth="sm" 
        sx={{ 
          position: 'relative',
          zIndex: 2,
          flex: 1,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Card
          sx={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            padding: '32px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography
            variant="h3"
            sx={{
              color: '#fff',
              mb: 3,
              fontWeight: 800,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Welcome to ToolHive
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2, background: 'rgba(211, 47, 47, 0.1)', color: '#ff5252' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2, background: 'rgba(76, 175, 80, 0.1)', color: '#69f0ae' }}>{success}</Alert>}

          {!isManualLogin ? (
            <Button
              variant="contained"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              sx={{
                width: '100%',
                mb: 2,
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                color: 'white',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                }
              }}
            >
              Sign In with Google
            </Button>
          ) : (
            <>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.7)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.7)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleManualAuthAction}
                sx={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  color: 'white',
                  mb: 2,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                  }
                }}
              >
                Sign In Manually
              </Button>
            </>
          )}

          <Button
            variant="text"
            onClick={() => setIsManualLogin(!isManualLogin)}
            startIcon={<EmailIcon />}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              mt: 2,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                color: 'white',
                background: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            {isManualLogin ? 'Use Google to Sign In' : 'Sign In Manually'}
          </Button>
        </Card>
      </Container>
    </Box>
  );
}

export default Login;