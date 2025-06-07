import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Box,
  Typography,
  CircularProgress,
  Divider,
  styled
} from '@mui/material';
import { getAuth } from 'firebase/auth';
import { setupDatabase, addAdminUser } from '../utils/initializeDatabase';
import StorageIcon from '@mui/icons-material/Storage';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Create a styled button with the breathing animation
const GlowingButton = styled(Button)`
  position: relative;
  overflow: hidden;
  background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease-in-out;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, #21CBF3 30%, #2196F3 90%);
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
    &::before {
      opacity: 1;
    }
  }

  & .MuiButton-startIcon {
    position: relative;
    z-index: 1;
  }

  & .MuiButton-label {
    position: relative;
    z-index: 1;
  }

  @keyframes glowing {
    0% {
      box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(33, 150, 243, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
    }
  }

  animation: glowing 2s infinite;
`;

const DatabaseInitializer = () => {
  const [open, setOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminUid, setNewAdminUid] = useState('');
  const [status, setStatus] = useState({ message: '', severity: 'info' });
  const [isInitializing, setIsInitializing] = useState(false);

  const handleInitialize = async () => {
    try {
      setIsInitializing(true);
      setStatus({ message: 'Initializing database...', severity: 'info' });
      await setupDatabase();
      setStatus({ message: 'Database initialized successfully! Please refresh the page to see the changes.', severity: 'success' });
    } catch (error) {
      console.error('Initialization error:', error);
      setStatus({ 
        message: 'Error: ' + (error.message || 'Failed to initialize database'), 
        severity: 'error' 
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail || !newAdminUid) {
      setStatus({ message: 'Please fill in both fields', severity: 'error' });
      return;
    }

    try {
      setStatus({ message: 'Adding admin user...', severity: 'info' });
      await addAdminUser(newAdminUid, newAdminEmail);
      setStatus({ message: 'Admin user added successfully!', severity: 'success' });
      setNewAdminEmail('');
      setNewAdminUid('');
    } catch (error) {
      console.error('Add admin error:', error);
      setStatus({ 
        message: 'Error: ' + (error.message || 'Failed to add admin user'), 
        severity: 'error' 
      });
    }
  };

  return (
    <>
      <GlowingButton
        variant="contained"
        onClick={() => setOpen(true)}
        startIcon={<StorageIcon />}
      >
        Database Tools
      </GlowingButton>

      <Dialog 
        open={open} 
        onClose={() => !isInitializing && setOpen(false)}
        PaperProps={{
          sx: {
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(10px)',
            minWidth: '500px',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(0,0,0,0.1)', 
          background: 'rgba(0,0,0,0.02)',
          py: 2
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <StorageIcon /> Database Management
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <RestartAltIcon /> Initialize Database
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              This will reset the tools database and initialize it with the default tools from toolData.
              Any custom tools will be removed. Use with caution!
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleInitialize}
              fullWidth
              disabled={isInitializing}
              startIcon={isInitializing ? <CircularProgress size={20} /> : <RestartAltIcon />}
              color="warning"
              sx={{
                py: 1.5,
                background: isInitializing ? undefined : 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)'
                }
              }}
            >
              {isInitializing ? 'Initializing...' : 'Initialize Database'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonAddIcon /> Add Admin User
            </Typography>
            <TextField
              label="User UID"
              fullWidth
              value={newAdminUid}
              onChange={(e) => setNewAdminUid(e.target.value)}
              sx={{ mb: 2 }}
              helperText="You can find this in Firebase Authentication"
              disabled={isInitializing}
              variant="outlined"
            />
            <TextField
              label="User Email"
              fullWidth
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              sx={{ mb: 3 }}
              disabled={isInitializing}
              variant="outlined"
            />
            <Button 
              variant="contained" 
              onClick={handleAddAdmin}
              fullWidth
              disabled={isInitializing}
              startIcon={<PersonAddIcon />}
              sx={{
                py: 1.5,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)'
                }
              }}
            >
              Add Admin User
            </Button>
          </Box>

          {status.message && (
            <Alert 
              severity={status.severity} 
              sx={{ 
                mt: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '& .MuiAlert-message': {
                  fontSize: '0.95rem'
                }
              }}
              onClose={() => setStatus({ message: '', severity: 'info' })}
            >
              {status.message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: '1px solid rgba(0,0,0,0.1)', 
          px: 3,
          py: 2
        }}>
          <Button 
            onClick={() => setOpen(false)}
            disabled={isInitializing}
            variant="outlined"
            sx={{
              px: 3
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DatabaseInitializer; 