
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithCredential,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  child,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAk6x2Mt9IqmQftA5YI-wBbPEP9KBH2wFQ",
  authDomain: "hotel-shotabdi.firebaseapp.com",
  databaseURL: "https://hotel-shotabdi-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "hotel-shotabdi",
  storageBucket: "hotel-shotabdi.firebasestorage.app",
  messagingSenderId: "682102275681",
  appId: "1:682102275681:web:f9362e8a87daed0736b420",
  measurementId: "G-BEMY9J3Z0M"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Function to handle profile synchronization in Realtime Database
export const syncUserProfile = async (user: any) => {
  if (!user) return;
  const userRef = ref(db, `profiles/${user.uid}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    // First time login - create social profile
    await set(userRef, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      username: user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
      bio: "Checking in at Shotabdi Residential!",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
  } else {
    // Returning user - update last login
    const lastLoginRef = ref(db, `profiles/${user.uid}/lastLogin`);
    await set(lastLoginRef, serverTimestamp());
  }
};

export { 
  onAuthStateChanged, 
  signOut, 
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  ref,
  get,
  set
};
