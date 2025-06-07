import { database } from '../firebase/config';
import { ref, get } from 'firebase/database';

// List of admin email addresses for fallback
const ADMIN_EMAILS = [
  'saboor12124@gmail.com',
  // Add more admin emails here
];

/**
 * Checks if a user is an admin using either their UID or email
 * @param {string} identifier - The user's UID or email
 * @param {boolean} isEmail - Whether the identifier is an email
 * @returns {Promise<boolean>} - True if the user is an admin, false otherwise
 */
export const isAdmin = async (identifier, isEmail = false) => {
  if (!identifier) return false;

  // If checking by email, use the simple array check
  if (isEmail) {
    return ADMIN_EMAILS.includes(identifier.toLowerCase());
  }

  // Otherwise, check the database using UID
  try {
    const userRef = ref(database, `users/${identifier}`);
    const snapshot = await get(userRef);
    return snapshot.exists() && snapshot.val().isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Function to check if user exists in database
export const checkUserExists = async (uid) => {
  if (!uid) return false;
  
  try {
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
}; 