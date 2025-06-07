import React, { useState } from 'react'
import { AppBar, Toolbar, Typography, Box, Menu, MenuItem, IconButton } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { getAuth, signOut } from 'firebase/auth'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'

export function Header({ userEmail }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const navigate = useNavigate()
  const auth = getAuth()

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      handleMenuClose()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <AppBar position="static" sx={{ 
      backgroundColor: 'rgba(0,0,0,0.3)', 
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)'
    }}>
      <Toolbar sx={{ 
        minHeight: { xs: '48px', sm: '64px' },
        px: { xs: 1, sm: 2 }
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            flexGrow: 1,
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}
        >
          ToolHive
          {userEmail && (
            <Box
              component="span"
              onClick={handleMenuClick}
              sx={{
                color: 'rgba(255,255,255,0.7)',
                ml: 1,
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                outline: 'none',
                fontSize: { xs: '0.8rem', sm: '1rem' },
                '&:focus-visible': {
                  outline: 'none',
                },
                '&:hover': {
                  color: 'white',
                },
              }}
            >
              | {userEmail}
              {userEmail === 'saboor12124@gmail.com' && (
                <Typography 
                  component="span" 
                  sx={{ 
                    color: '#39FF14', 
                    ml: 1, 
                    fontWeight: 'normal',
                    fontSize: { xs: '0.7rem', sm: '0.875rem' }
                  }}
                >
                  [Admin]
                </Typography>
              )}
              <IconButton
                size="small"
                sx={{ 
                  ml: 0.5,
                  color: 'inherit',
                  padding: 0,
                  WebkitTapHighlightColor: 'transparent',
                  outline: 'none',
                  '& .MuiSvgIcon-root': {
                    fontSize: { xs: '1.2rem', sm: '1.5rem' }
                  },
                  '&:focus-visible': {
                    outline: 'none',
                  },
                }}
              >
                <AccountCircleIcon />
              </IconButton>
            </Box>
          )}
        </Typography>
        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, alignItems: 'center' }}>
          <Link 
            to="/" 
            style={{ 
              textDecoration: 'none', 
              color: '#fff',
              WebkitTapHighlightColor: 'transparent',
              outline: 'none',
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            Home
          </Link>
          <Link 
            to="/tools" 
            style={{ 
              textDecoration: 'none', 
              color: '#fff',
              WebkitTapHighlightColor: 'transparent',
              outline: 'none',
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            Tools
          </Link>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              mt: 1,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              '& .MuiMenuItem-root': {
                color: 'white',
                fontSize: { xs: '0.875rem', sm: '0.9rem' },
                py: { xs: 0.75, sm: 1 },
                px: { xs: 1.5, sm: 2 },
                '&:hover': {
                  background: 'rgba(255,255,255,0.1)',
                },
              },
            },
          }}
        >
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default Header
