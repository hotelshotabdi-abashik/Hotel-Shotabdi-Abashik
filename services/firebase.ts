
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
  update,
  push,
  onValue,
  remove,
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

export const OWNER_EMAIL = "hotelshotabdiabashik@gmail.com";

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Checks if a username is already taken by another user
 */
export const checkUsernameUnique = async (username: string, currentUid: string) => {
  const normalized = username.toLowerCase().trim();
  const usernameRef = ref(db, `usernames/${normalized}`);
  const snapshot = await get(usernameRef);
  if (snapshot.exists()) {
    return snapshot.val() === currentUid;
  }
  return true;
};

/**
 * Syncs profile data and updates the login memory. 
 */
export const syncUserProfile = async (user: any) => {
  if (!user) return null;
  const userRef = ref(db, `profiles/${user.uid}`);
  const snapshot = await get(userRef);

  const now = Date.now();

  if (!snapshot.exists()) {
    const basicProfile = {
      uid: user.uid,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: now,
      lastLogin: now,
      isComplete: false
    };
    await set(userRef, basicProfile);
    return basicProfile;
  } else {
    const currentData = snapshot.val();
    update(userRef, { lastLogin: now }).catch(console.error);
    return { ...currentData, lastLogin: now };
  }
};

/**
 * Fully deletes a user's data from the database
 */
export const deleteUserProfile = async (uid: string, username?: string) => {
  const updates: any = {};
  updates[`profiles/${uid}`] = null;
  if (username) {
    updates[`usernames/${username.toLowerCase().trim()}`] = null;
  }
  updates[`notifications/${uid}`] = null;
  return update(ref(db), updates);
};

/** Admin Helpers **/
export const createNotification = async (userId: string, notification: any) => {
  const notificationsRef = ref(db, `notifications/${userId}`);
  const newNotificationRef = push(notificationsRef);
  return set(newNotificationRef, {
    ...notification,
    id: newNotificationRef.key,
    read: false,
    createdAt: Date.now()
  });
};

export { 
  onAuthStateChanged, 
  signOut, 
  signInWithPopup, 
  signInWithCredential, 
  GoogleAuthProvider, 
  ref, 
  get, 
  set, 
  update, 
  push,
  remove,
  onValue,
  serverTimestamp 
};
