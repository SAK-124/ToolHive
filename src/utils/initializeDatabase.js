import { getDatabase, ref, set, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { toolCards } from '../data/toolData';
import { databaseService } from '../services/databaseService';

const initializeDatabase = async () => {
  const db = getDatabase();
  const auth = getAuth();
  
  try {
    // Initialize users node
    const usersRef = ref(db, 'users');
    const usersSnapshot = await get(usersRef);
    
    if (!usersSnapshot.exists()) {
      // Create users node with admin user
      await set(ref(db, `users/${auth.currentUser.uid}`), {
        isAdmin: true,
        email: auth.currentUser.email,
        createdAt: new Date().toISOString()
      });
      if (import.meta.env.DEV) {
        console.log('Users node initialized with admin user')
      }
    }

    // Initialize tools using databaseService
    if (import.meta.env.DEV) {
      console.log('Initializing tools from toolData...')
    }
    await databaseService.initializeDefaultTools(toolCards);
    if (import.meta.env.DEV) {
      console.log('Tools initialized successfully')
    }

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const setupDatabase = async () => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('User must be logged in to initialize database');
    }
    
    // Clear existing tools before initialization to prevent duplicates
    const db = getDatabase();
    const toolsRef = ref(db, 'tools');
    await set(toolsRef, null)
    if (import.meta.env.DEV) {
      console.log('Cleared existing tools')
    }
    
    await initializeDatabase()
    if (import.meta.env.DEV) {
      console.log('Database initialization complete')
    }
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
};

// Function to add a new admin user
export const addAdminUser = async (uid, email) => {
  const db = getDatabase();
  try {
    await set(ref(db, `users/${uid}`), {
      isAdmin: true,
      email: email,
      createdAt: new Date().toISOString()
    })
    if (import.meta.env.DEV) {
      console.log('Admin user added successfully')
    }
  } catch (error) {
    console.error('Error adding admin user:', error);
    throw error;
  }
}; 