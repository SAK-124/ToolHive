import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  Switch,
  TextField,
  Button,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { isAdmin } from '../utils/adminUtils';
import { toolCards } from '../data/toolData';
import { databaseService } from '../services/databaseService';
import DatabaseInitializer from '../components/DatabaseInitializer';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase/config';

const AdminPanel = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [tools, setTools] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Check authentication and admin status
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserId(user.uid);
        const adminStatus = await isAdmin(user.uid);
        setIsAdminUser(adminStatus);
      } else {
        setUserEmail(null);
        setUserId(null);
        setIsAdminUser(false);
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  // Add real-time listener for tools
  useEffect(() => {
    if (!userId || !isAdminUser) return;

    const toolsRef = ref(database, 'tools');
    const unsubscribe = onValue(toolsRef, (snapshot) => {
      if (snapshot.exists()) {
        const toolsData = Object.entries(snapshot.val()).map(([id, tool]) => ({
          ...tool,
          id
        }));
        setTools(toolsData);
      } else {
        setTools([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error listening to tools:', error);
      setSnackbar({
        open: true,
        message: 'Error listening to tools: ' + error.message,
        severity: 'error'
      });
    });

    return () => unsubscribe();
  }, [userId, isAdminUser]);

  // Remove the old tools loading effect since we now have real-time updates
  useEffect(() => {
    if (!userId || !isAdminUser) return;
    
    const initializeTools = async () => {
      try {
        await databaseService.initializeDefaultTools(toolCards);
      } catch (error) {
        console.error('Error initializing tools:', error);
        setSnackbar({
          open: true,
          message: 'Error initializing tools: ' + error.message,
          severity: 'error'
        });
      }
    };

    initializeTools();
  }, [userId, isAdminUser]);

  // Show loading while checking auth
  if (!authChecked || loading) {
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
    );
  }

  // If not admin, redirect to home
  if (authChecked && !isAdminUser) {
    return <Navigate to="/" replace />;
  }

  const handleToggleAdmin = async (toolId) => {
    try {
      const tool = tools.find(t => t.id === toolId);
      if (!tool) {
        throw new Error('Tool not found');
      }
      
      // Get the complete updated tool object from the database service
      const updatedTool = await databaseService.updateTool(toolId, { 
        adminOnly: !tool.adminOnly 
      });
      
      // Update the local state with the complete tool object
      setTools(prevTools => prevTools.map(t => 
        t.id === toolId ? updatedTool : t
      ));
      
      setSnackbar({
        open: true,
        message: `Tool is now ${updatedTool.adminOnly ? 'admin-only' : 'public'}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating tool:', error);
      setSnackbar({
        open: true,
        message: 'Error updating tool: ' + error.message,
        severity: 'error'
      });
    }
  };

  const handleEditTool = (tool) => {
    setEditingTool(tool);
    setOpenDialog(true);
  };

  const handleAddNew = () => {
    setEditingTool({
      title: '',
      desc: '',
      url: '',
      logoUrl: '',
      fallbackLogo: `https://ui-avatars.com/api/?name=New+Tool&background=random`,
      keywords: [],
      adminOnly: false
    });
    setOpenDialog(true);
  };

  const generateLogoUrl = (url) => {
    try {
      // Add https:// if no protocol is specified
      const urlToUse = url.startsWith('http') ? url : `https://${url}`;
      const urlObj = new URL(urlToUse);
      return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log('Error generating logo URL:', error)
      }
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(editingTool?.title || 'New Tool')}&background=random`;
    }
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    // Clean the URL by removing any leading/trailing whitespace
    const cleanUrl = newUrl.trim();
    setEditingTool({
      ...editingTool,
      url: cleanUrl,
      logoUrl: generateLogoUrl(cleanUrl)
    });
  };

  const createSafeId = (str) => {
    return str
      .toLowerCase()
      .replace(/[.#$/[\]]/g, '_')  // Replace Firebase invalid chars
      .replace(/[^a-z0-9_-]/g, '_') // Replace any other non-alphanumeric chars
      .replace(/_+/g, '_')          // Replace multiple underscores with single
      .replace(/^_|_$/g, '');       // Remove leading/trailing underscores
  };

  const handleSave = async () => {
    try {
      if (!editingTool.title || !editingTool.url) {
        setSnackbar({
          open: true,
          message: 'Title and URL are required!',
          severity: 'error'
        });
        return;
      }

      // Ensure keywords is an array
      const keywords = Array.isArray(editingTool.keywords) 
        ? editingTool.keywords 
        : editingTool.keywords?.[0]?.split(',').map(k => k.trim()).filter(k => k) || [];

      // Create a clean tool object with a proper ID
      const toolToSave = {
        ...editingTool,
        id: editingTool.id || createSafeId(editingTool.url || editingTool.title),
        title: editingTool.title.trim(),
        desc: editingTool.desc?.trim() || '',
        url: editingTool.url.trim(),
        keywords: keywords,
        adminOnly: editingTool.adminOnly || false,
        logoUrl: editingTool.logoUrl || generateLogoUrl(editingTool.url),
        fallbackLogo: editingTool.fallbackLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(editingTool.title)}&background=random`
      };

      // Save to Firebase
      const savedTool = await databaseService.saveTool(toolToSave);
      if (import.meta.env.DEV) {
        console.log('Tool saved successfully:', savedTool)
      }
      
      // Close dialog and show success message
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: `Tool "${savedTool.title}" saved successfully!`,
        severity: 'success'
      });

      // The real-time listener will automatically update the UI
    } catch (error) {
      console.error('Error saving tool:', error);
      setSnackbar({
        open: true,
        message: 'Error saving tool: ' + error.message,
        severity: 'error'
      });
    }
  };

  const handleDelete = async (toolId) => {
    try {
      await databaseService.deleteTool(toolId);
      setTools(tools.filter(tool => tool.id !== toolId));
      setSnackbar({
        open: true,
        message: 'Tool deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error deleting tool: ' + error.message,
        severity: 'error'
      });
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
          filter: 'blur(60px) brightness(0.7)',
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
            Back to Home
          </Button>
          <Typography
            variant="h5"
            sx={{
              color: 'white',
              fontWeight: 600,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Admin Panel
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <DatabaseInitializer />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            sx={{
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
            Add New Tool
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Container 
        maxWidth="xl" 
        sx={{ 
          position: 'relative',
          zIndex: 2,
          flex: 1,
          mt: 4
        }}
      >
        <Grid container spacing={3}>
          {tools.map((tool) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={tool.id}>
              <Card
                sx={{
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(15px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
                    background: 'rgba(255, 255, 255, 0.08)',
                  }
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      {tool.title}
                    </Typography>
                    <Box>
                      <IconButton
                        onClick={() => handleEditTool(tool)}
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&:hover': { color: 'white', background: 'rgba(255, 255, 255, 0.1)' }
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(tool.id)}
                        sx={{ 
                          color: 'rgba(255, 107, 107, 0.7)',
                          '&:hover': { color: '#ff6b6b', background: 'rgba(255, 107, 107, 0.1)' }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                    {tool.desc}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={tool.adminOnly}
                        onChange={() => handleToggleAdmin(tool.id)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#4AFF4A',
                            '&:hover': {
                              backgroundColor: 'rgba(74, 255, 74, 0.1)',
                            },
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: 'rgba(74, 255, 74, 0.3)',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ color: tool.adminOnly ? '#4AFF4A' : 'rgba(255, 255, 255, 0.7)' }}>
                        Admin Only
                      </Typography>
                    }
                  />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(15px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            color: 'white',
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          {editingTool?.id ? 'Edit Tool' : 'Add New Tool'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              value={editingTool?.title || ''}
              onChange={(e) => setEditingTool({ ...editingTool, title: e.target.value })}
              fullWidth
              sx={{
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
              label="Description"
              value={editingTool?.desc || ''}
              onChange={(e) => setEditingTool({ ...editingTool, desc: e.target.value })}
              fullWidth
              multiline
              rows={3}
              sx={{
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
              label="URL"
              value={editingTool?.url || ''}
              onChange={handleUrlChange}
              fullWidth
              sx={{
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
              label="Logo URL (auto-generated)"
              value={editingTool?.logoUrl || ''}
              disabled
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'rgba(255, 255, 255, 0.5)',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&.Mui-disabled': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            />
            <TextField
              label="Keywords (comma-separated)"
              value={editingTool?.keywords?.join(', ') || ''}
              onChange={(e) => {
                const inputValue = e.target.value;
                // Store the raw input as a single keyword, preserving commas
                setEditingTool({
                  ...editingTool,
                  keywords: [inputValue]
                });
              }}
              onBlur={(e) => {
                // Only split into keywords when the field loses focus
                const keywords = e.target.value
                  .split(',')
                  .map(keyword => keyword.trim())
                  .filter(keyword => keyword.length > 0);
                setEditingTool({
                  ...editingTool,
                  keywords: keywords
                });
              }}
              onKeyDown={(e) => {
                // Also split keywords when Enter is pressed
                if (e.key === 'Enter') {
                  const keywords = e.target.value
                    .split(',')
                    .map(keyword => keyword.trim())
                    .filter(keyword => keyword.length > 0);
                  setEditingTool({
                    ...editingTool,
                    keywords: keywords
                  });
                }
              }}
              placeholder="Type keywords and separate with commas"
              fullWidth
              sx={{
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
            <FormControlLabel
              control={
                <Switch
                  checked={editingTool?.adminOnly || false}
                  onChange={(e) => setEditingTool({ ...editingTool, adminOnly: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#4AFF4A',
                      '&:hover': {
                        backgroundColor: 'rgba(74, 255, 74, 0.1)',
                      },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'rgba(74, 255, 74, 0.3)',
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ color: editingTool?.adminOnly ? '#4AFF4A' : 'rgba(255, 255, 255, 0.7)' }}>
                  Admin Only
                </Typography>
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: 'white',
                background: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
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
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            background: snackbar.severity === 'success' 
              ? 'rgba(76, 175, 80, 0.1)' 
              : 'rgba(211, 47, 47, 0.1)',
            color: snackbar.severity === 'success' ? '#69f0ae' : '#ff5252',
            border: `1px solid ${snackbar.severity === 'success' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(211, 47, 47, 0.3)'}`,
            backdropFilter: 'blur(10px)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPanel; 