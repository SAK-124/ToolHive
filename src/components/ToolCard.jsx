import React from 'react'
import { 
  Card, 
  CardActionArea, 
  CardMedia, 
  CardContent, 
  Typography, 
  Box, 
  useTheme, 
  useMediaQuery 
} from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { motion } from 'framer-motion'

const cardVariants = {
  initial: { 
    opacity: 0,
    y: 20
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.34, 1.56, 0.64, 1]
    }
  },
  hover: { 
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: [0.34, 1.56, 0.64, 1]
    }
  },
  tap: { 
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: [0.34, 1.56, 0.64, 1]
    }
  }
}

const glassEffectStyles = (isSelected) => ({
  position: 'relative',
  height: '100%',
  background: isSelected 
    ? 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.12))'
    : 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.08))',
  backdropFilter: 'blur(15px) saturate(180%)',
  WebkitBackdropFilter: 'blur(25px) saturate(190%)',
  borderRadius: 'inherit',
  border: `1px solid ${isSelected ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)'}`,
  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  overflow: 'hidden',
  boxShadow: isSelected 
    ? '0 8px 32px rgba(31, 38, 135, 0.37)'
    : '0 8px 32px rgba(31, 38, 135, 0.15)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.2), transparent 70%)',
    opacity: 0.5,
    transition: 'opacity 0.3s ease',
    mixBlendMode: 'soft-light'
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom right, rgba(255,255,255,0.2), transparent)',
    opacity: 0.3,
    transition: 'opacity 0.3s ease',
    mixBlendMode: 'overlay'
  }
})

export const ToolCard = React.memo(({ tool, isSelected }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Card
      component={motion.div}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      sx={{
        willChange: 'transform',
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: isMobile ? '16px' : '24px',
        overflow: 'hidden',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          backgroundColor: 'rgba(255,255,255,0.06)',
          '& .glass-effect::before': {
            opacity: 0.8
          },
          '& .glass-effect::after': {
            opacity: 0.6
          },
          '& .card-media': {
            transform: 'scale(1.1) rotate(2deg)',
            filter: 'brightness(1.1) saturate(1.2)'
          },
          '& .description': {
            maxHeight: '100px',
            opacity: 1,
            transform: 'translateY(0)'
          },
          '& .icon': {
            transform: 'translateX(0) rotate(0deg)',
            opacity: 1
          },
          '& .card-title': {
            background: 'linear-gradient(135deg, #fff 20%, #a8b1ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }
        },
        '@keyframes pulse': {
          '0%': { transform: 'scale(1)', boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)' },
          '50%': { transform: 'scale(1.02)', boxShadow: '0 12px 40px rgba(31, 38, 135, 0.25)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)' }
        },
        ...(isSelected && {
          animation: 'pulse 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite'
        })
      }}
    >
      <CardActionArea
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${tool.title} - ${tool.desc}`}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent',
          ...glassEffectStyles(isSelected)
        }}
        className="glass-effect"
      >
        <CardMedia
          component="img"
          height={isMobile ? 60 : 120}
          image={tool.logoUrl || tool.fallbackLogo}
          alt={`${tool.title} logo`}
          onError={(e) => {
            e.target.onerror = null
            e.target.src = tool.fallbackLogo
          }}
          className="card-media"
          sx={{
            objectFit: 'contain',
            p: isMobile ? 1.5 : 3,
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
            willChange: 'transform'
          }}
        />

        <CardContent 
          sx={{ 
            flexGrow: 1,
            p: isMobile ? '12px!important' : '20px!important',
            '&:last-child': { pb: isMobile ? '12px!important' : '20px!important' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography
                  variant="h6"
                  className="card-title"
                  sx={{
                    fontSize: isMobile ? '0.9rem' : '1.1rem',
                    fontWeight: 600,
                    color: 'white',
                    lineHeight: 1.2,
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                >
                  {tool.title}
                </Typography>
                {tool.adminOnly && (
                  <Box
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: '4px',
                      background: 'rgba(0,255,0,0.1)',
                      border: '1px solid rgba(0,255,0,0.3)',
                      color: '#4AFF4A',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      textShadow: '0 0 10px rgba(0,255,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      height: 'fit-content',
                      lineHeight: 1
                    }}
                  >
                    ADMIN
                  </Box>
                )}
              </Box>
              <Typography 
                variant="body2" 
                component="p"
                className="description"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  lineHeight: 1.5,
                  maxHeight: 0,
                  opacity: 0,
                  transform: 'translateY(10px)',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  overflow: 'hidden'
                }}
              >
                {tool.desc}
              </Typography>
            </Box>
            <OpenInNewIcon 
              className="icon"
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                fontSize: isMobile ? 16 : 20,
                transform: 'translateX(-10px) rotate(-45deg)',
                opacity: 0,
                transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
              }} 
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
})

export default ToolCard