import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Container,
  Button,
} from '@mui/material'
import { getAuth } from 'firebase/auth'

function Tools() {
  const navigate = useNavigate()
  const auth = getAuth()
  const userEmail = auth.currentUser?.email
  const isAdminUser = auth.currentUser?.email === 'admin@example.com'

  // Example internal tools data
  const internalTools = [
    {
      title: 'Convert',
      desc: 'Convert files from one format to another',
      path: '/tools/cloudconvert',
    },
    // Add more internal tools here if you like
    // {
    //   title: 'Another Tool',
    //   desc: 'Description here',
    //   path: '/tools/another-tool',
    // },
  ]

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
            to="/"
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Home
          </Button>
          {isAdminUser && (
            <Button
              variant="outlined"
              size="small"
              component={Link}
              to="/admin"
              sx={{
                color: '#4AFF4A',
                borderColor: 'rgba(74,255,74,0.3)',
                animation: 'glow 2s infinite',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  borderColor: 'rgba(74,255,74,0.6)',
                  background: 'rgba(74,255,74,0.1)',
                  transform: 'translateY(-1px)',
                },
                '@keyframes glow': {
                  '0%': {
                    boxShadow: '0 0 0 0 rgba(74,255,74,0.4)',
                  },
                  '70%': {
                    boxShadow: '0 0 0 10px rgba(74,255,74,0)',
                  },
                  '100%': {
                    boxShadow: '0 0 0 0 rgba(74,255,74,0)',
                  },
                },
              }}
            >
              Admin Panel
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {userEmail ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.875rem'
                  }}
                >
                  {userEmail}
                </Typography>
                {isAdminUser && (
                  <Box
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: '4px',
                      background: 'rgba(0,255,0,0.1)',
                      border: '1px solid rgba(0,255,0,0.3)',
                      color: '#4AFF4A',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textShadow: '0 0 10px rgba(0,255,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    ADMIN
                  </Box>
                )}
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => getAuth().signOut()}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.6)',
                    background: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              size="small"
              component={Link}
              to="/login"
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.6)',
                  background: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Box>

      {/* Hero Section */}
      <Box 
        sx={{ 
          position: 'relative',
          zIndex: 2,
          textAlign: 'center', 
          color: '#fff', 
          mt: { xs: 4, sm: 6 },
          mb: { xs: 4, sm: 6 }
        }}
      >
        <Typography 
          variant="h2" 
          sx={{
            color: '#fff',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            fontWeight: 800,
            mb: 2,
            fontSize: {
              xs: '2rem',
              sm: '2.5rem',
              md: '3rem'
            }
          }}
        >
          Our Internal Tools
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: 'rgba(255,255,255,0.7)',
            fontSize: {
              xs: '0.875rem',
              sm: '1rem'
            },
            maxWidth: '600px',
            mx: 'auto',
            px: 2
          }}
        >
          Select any tool below to get started
        </Typography>
      </Box>

      {/* Card Grid Container */}
      <Container 
        maxWidth="xl"
        sx={{ 
          position: 'relative',
          zIndex: 2,
          flex: 1,
          pb: { xs: 6, sm: 10 },
          px: { xs: 2, sm: 3 }
        }}
      >
        <Grid container spacing={3} justifyContent="center">
          {internalTools.map((tool, idx) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
              <Card
                onClick={() => navigate(tool.path)}
                sx={{
                  height: '100%',
                  minHeight: { xs: '180px', sm: '240px' },
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
                    background: 'rgba(255, 255, 255, 0.08)',
                  }
                }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    height: '100%',
                    justifyContent: 'center',
                    p: { xs: 3, sm: 4 }
                  }}
                >
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: '#fff', 
                      fontWeight: 600, 
                      mb: { xs: 1.5, sm: 2 },
                      fontSize: {
                        xs: '1.25rem',
                        sm: '1.5rem'
                      }
                    }}
                  >
                    {tool.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: {
                        xs: '0.875rem',
                        sm: '1rem'
                      }
                    }}
                  >
                    {tool.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          py: { xs: 2, sm: 3 },
          color: 'rgba(255,255,255,0.7)',
          mt: 'auto',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          fontSize: { xs: '0.75rem', sm: '0.875rem' }
        }}
      >
        <Typography variant="body2">
          &copy; 2025 ToolHive. All rights reserved. Created and Owned by Saboor Ali Khan.
        </Typography>
      </Box>
    </Box>
  )
}

export default Tools