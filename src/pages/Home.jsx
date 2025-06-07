import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
  AppBar,
  Toolbar,
  Typography,
  Grid,
  Box,
  Container,
  useTheme,
  useMediaQuery,
  Fade,
  Button,
  CircularProgress
} from '@mui/material'
import illustration from '../assets/illustration.png'
import Header from '../components/Header.jsx'
import SearchBar from '../components/SearchBar.jsx'
import ToolCard from '../components/ToolCard.jsx'
import { useToolSearch } from '../hooks/useToolSearch.js'
import { toolCards } from '../data/toolData.js'
import { isAdmin } from '../utils/adminUtils.js'
import { databaseService } from '../services/databaseService.js'

const glowKeyframes = `
  @keyframes glow {
    0% { box-shadow: 0 0 0 0 rgba(74, 255, 74, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(74, 255, 74, 0); }
    100% { box-shadow: 0 0 0 0 rgba(74, 255, 74, 0); }
  }
`;

function Home() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [userEmail, setUserEmail] = useState(null)
  const [userId, setUserId] = useState(null)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Add filtered tools using the useToolSearch hook
  const filteredTools = useToolSearch(tools, searchTerm, userEmail, isAdminUser)
  
  useEffect(() => {
    // Add a small delay for the fade-in animation
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Monitor filtered tools change (no logging in production)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Filtered tools updated:', {
        totalTools: tools.length,
        filteredCount: filteredTools.length,
        isAdminUser,
        adminOnlyShown: filteredTools.filter(t => t.adminOnly === true).length
      })
    }
  }, [filteredTools, tools, isAdminUser])

  // Check auth and admin status
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserId(user.uid);
        
        // Check admin status
        const adminStatus = await isAdmin(user.uid);
        if (import.meta.env.DEV) {
          console.log('Admin status check:', { email: user.email, adminStatus })
        }
        setIsAdminUser(adminStatus);
      } else {
        if (import.meta.env.DEV) {
          console.log('User logged out')
        }
        setUserEmail(null);
        setUserId(null);
        setIsAdminUser(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load tools from database
  useEffect(() => {
    const loadTools = async () => {
      try {
        setLoading(true);
        // Always sync with default tools to ensure updates are reflected
        const syncedTools = await databaseService.syncWithDefaultTools(toolCards);
        if (import.meta.env.DEV) {
          console.log('Loaded tools:', {
            count: syncedTools.length,
            adminOnlyCount: syncedTools.filter(t => t.adminOnly === true).length,
            adminOnlyTools: syncedTools.filter(t => t.adminOnly === true).map(t => t.title)
          })
        }
        setTools(syncedTools);
      } catch (error) {
        console.error('Error loading tools:', error);
        // Fallback to default tools if database fails
        setTools(toolCards);
      } finally {
        setLoading(false);
      }
    };

    loadTools();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1a0033 0%, #330066 100%)'
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    )
  }

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
          background: 'linear-gradient(-45deg, #1a0033 0%, #2d0066 20%, #1a0033 30%, #330066 50%, #1a0033 60%, #2d0066 80%, #1a0033 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientBG 30s ease infinite',
          zIndex: 0,
          filter: 'blur(60px) brightness(0.7)',
          transform: 'scale(1.2)', // Prevent blur edges from showing
          '@keyframes gradientBG': {
            '0%': {
              backgroundPosition: '0% 50%'
            },
            '50%': {
              backgroundPosition: '100% 50%'
            },
            '100%': {
              backgroundPosition: '0% 50%'
            }
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(255,107,220,0.15) 0%, rgba(255,255,255,0) 50%)',
            mixBlendMode: 'soft-light',
            pointerEvents: 'none',
            animation: 'colorPulse 12s ease-in-out infinite',
            '@keyframes colorPulse': {
              '0%, 100%': { 
                opacity: 0,
                transform: 'translate(-30%, -30%) scale(1.5)',
                background: 'radial-gradient(circle at 50% 50%, rgba(255,107,220,0.15) 0%, rgba(255,255,255,0) 50%)'
              },
              '33%': { 
                opacity: 1,
                transform: 'translate(30%, 0%) scale(1.2)',
                background: 'radial-gradient(circle at 50% 50%, rgba(255,156,107,0.1) 0%, rgba(255,255,255,0) 50%)'
              },
              '66%': { 
                opacity: 1,
                transform: 'translate(-10%, 20%) scale(1.3)',
                background: 'radial-gradient(circle at 50% 50%, rgba(107,255,220,0.12) 0%, rgba(255,255,255,0) 50%)'
              }
            }
          }
        }}
      />

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

      {/* Hero Section with Fixed Search */}
      <Box 
        sx={{ 
          position: 'relative',
          zIndex: 2,
          pt: searchTerm ? 2 : { xs: 8, sm: 12 },
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          height: searchTerm ? 'auto' : { xs: '75vh', sm: '85vh' },
          minHeight: searchTerm ? '200px' : 'auto',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Background Container */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1
          }}
        >
          <Box
            component="img"
            src={illustration}
            alt=""
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.6) saturate(1.2)',
              transform: searchTerm ? 'scale(1.1) translateY(-2%)' : 'scale(1.1)',
              opacity: searchTerm ? 0.2 : 1,
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'float 20s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: `scale(1.1) translateY(${searchTerm ? '-2%' : '0'})` },
                '50%': { transform: `scale(1.1) translate(-1%, ${searchTerm ? '-3%' : '-1%'})` }
              }
            }}
          />
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: searchTerm 
                ? 'linear-gradient(180deg, rgba(26,0,51,0.95), rgba(45,0,102,0.7))'
                : 'linear-gradient(180deg, rgba(26,0,51,0.2) 0%, rgba(26,0,51,0.4) 60%, rgba(26,0,51,0.95) 100%)',
              transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              pointerEvents: 'none'
            }}
          />
        </Box>

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              maxWidth: '800px',
              mx: 'auto',
              textAlign: 'center',
              px: { xs: 2, sm: 4 },
              transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: searchTerm ? 'scale(0.95)' : 'scale(1)',
              opacity: 1
            }}
          >
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                fontWeight: 800,
                background: 'linear-gradient(135deg, #fff 0%, #a8b1ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                mb: { xs: 2, sm: 3 },
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: searchTerm ? 'translateY(-20px) scale(0.8)' : 'translateY(0) scale(1)',
                height: searchTerm ? '0' : 'auto',
                opacity: searchTerm ? 0 : 1,
                overflow: 'hidden'
              }}
            >
              All Your AI Tools
              <Box 
                component="span" 
                sx={{ 
                  display: 'block',
                  fontSize: '0.7em',
                  background: 'linear-gradient(135deg, #a8b1ff 0%, #7c83ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                In One Place
              </Box>
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.8)',
                mb: { xs: 4, sm: 5 },
                fontWeight: 400,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6,
                transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: searchTerm ? 'translateY(-20px)' : 'translateY(0)',
                height: searchTerm ? '0' : 'auto',
                opacity: searchTerm ? 0 : 1,
                overflow: 'hidden'
              }}
            >
              Discover and access powerful AI tools to enhance your workflow
            </Typography>

            <SearchBar
              searchRef={searchRef}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setSelectedIndex={setSelectedIndex}
            />
          </Box>
        </Container>
      </Box>

      {/* Tool Grid Section */}
      <Container 
        component="section"
        aria-label="AI tools grid"
        maxWidth="xl"
        sx={{ 
          mt: searchTerm ? 2 : { xs: 4, sm: 6 },
          mb: { xs: 4, sm: 6 },
          position: 'relative',
          zIndex: 4,
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          opacity: 1,
          transform: 'translateY(0)'
        }}
      >
        <Grid 
          container 
          spacing={{ xs: 2, sm: 3 }}
        >
          {filteredTools.map((tool, idx) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              lg={3} 
              key={tool.id || idx}
            >
              <ToolCard 
                tool={tool} 
                isSelected={selectedIndex === idx} 
              />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          mt: 'auto',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
          }
        }}
      >
        <Container maxWidth="xl">
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'center',
              fontSize: '0.875rem',
              a: {
                color: 'inherit',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: theme.palette.primary.main
                }
              }
            }}
          >
            &copy; 2025 ToolHive. All rights reserved.
            <br />
            Created by <Link to="/about">Saboor Ali Khan</Link>
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}

export default Home