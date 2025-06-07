import React, { useEffect } from 'react'
import { TextField, InputAdornment, Container, useTheme, useMediaQuery, Box, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import KeyboardIcon from '@mui/icons-material/Keyboard'

export const SearchBar = React.memo(({ searchRef, searchTerm, setSearchTerm, setSelectedIndex }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
    setSelectedIndex(-1)
  }

  useEffect(() => {
    if (!isMobile) {
      const handleKeyPress = (event) => {
        if (event.key === '/') {
          event.preventDefault()
          if (document.activeElement === searchRef.current) {
            searchRef.current.blur()
          } else {
            searchRef.current.focus()
            searchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }
      }

      document.addEventListener('keydown', handleKeyPress)
      return () => document.removeEventListener('keydown', handleKeyPress)
    }
  }, [searchRef, isMobile])

  return (
    <Container
      maxWidth="sm"
      sx={{
        maxWidth: '400px !important',
        px: isMobile ? 2 : 3,
        mx: 'auto',
        transition: 'max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:focus-within': {
          maxWidth: '500px !important',
        }
      }}
    >
      <Box
        sx={{
          position: 'relative',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: '2px',
          transform: 'scale(1)',
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))',
            transform: 'translateY(-1px) scale(1.01)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          },
          '&:focus-within': {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
            transform: 'translateY(-2px) scale(1.02)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
          }
        }}
      >
        <TextField
          inputRef={searchRef}
          fullWidth
          variant="standard"
          placeholder="Search tools..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => {
            if (!isMobile) {
              searchRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
              })
            }
          }}
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: isMobile ? 20 : 24,
                    transition: 'all 0.3s ease',
                    ml: 1.5,
                    transform: 'scale(1)',
                    '.MuiInputBase-root:focus-within &': {
                      color: 'rgba(255,255,255,0.9)',
                      transform: 'scale(1.1)',
                    }
                  }}
                />
              </InputAdornment>
            ),
            endAdornment: !isMobile && (
              <InputAdornment position="end">
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.75rem',
                    padding: '4px 8px',
                    margin: '0 8px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    transform: 'translateX(0)',
                    opacity: 1,
                    '.MuiInputBase-root:focus-within &': {
                      transform: 'translateX(5px)',
                      background: 'rgba(255,255,255,0.15)',
                    },
                    '&:hover': {
                      background: 'rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.7)'
                    }
                  }}
                >
                  <KeyboardIcon sx={{ fontSize: 16 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem'
                    }}
                  >
                    Press /
                  </Typography>
                </Box>
              </InputAdornment>
            )
          }}
          sx={{
            mt: 1,
            mb: 2,
            transform: 'translateZ(0)',
            animation: 'fadeIn 0.6s ease-out',
            '@keyframes fadeIn': {
              from: {
                opacity: 0,
                transform: 'translateY(20px) translateZ(0)'
              },
              to: {
                opacity: 1,
                transform: 'translateY(0) translateZ(0)'
              }
            },
            '& .MuiInputBase-root': {
              color: 'white',
              fontSize: isMobile ? '0.9rem' : '1rem',
              lineHeight: 1.2,
              paddingY: 0.5,
              paddingX: 0.5,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '& input': {
                padding: 0,
                transition: 'all 0.3s ease',
                '&::placeholder': {
                  color: 'rgba(255,255,255,0.5)',
                  opacity: 1,
                  transition: 'color 0.3s ease'
                },
                '&:focus::placeholder': {
                  color: 'rgba(255,255,255,0.7)'
                }
              }
            }
          }}
        />
      </Box>
    </Container>
  )
})

export default SearchBar
