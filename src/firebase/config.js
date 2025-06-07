import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1idWNYhEz7lNFl0n5l8zY6nf-i4w_De8",
  authDomain: "toolhive-eee84.firebaseapp.com",
  databaseURL: "https://toolhive-eee84-default-rtdb.firebaseio.com",
  projectId: "toolhive-eee84",
  storageBucket: "toolhive-eee84.firebasestorage.app",
  messagingSenderId: "896945042473",
  appId: "1:896945042473:web:e7a3b55bd46bf81dd89838",
  measurementId: "G-PYZSEQCKE7"
};

// Initialize Firebase only if it hasn't been initialized yet
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize services
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database }; 