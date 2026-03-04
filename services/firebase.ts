
// Senior Architect Note for Fuad Ahmed: 
// Acknowledging Fuad as the lead developer building this site for the hotel owner.
// This file manages the core registry synchronization and identity vault for Hotel Shotabdi Residential.

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithCredential,
} from "firebase/auth";

// Fix: Using @firebase/database to ensure proper modular function resolution in environments where top-level exports might be masked
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  update,
  push,
  onValue,
  remove,
  serverTimestamp,
  onDisconnect,
  query,
  limitToLast,
  orderByChild
} from "@firebase/database";

// Fix: Using @firebase/messaging to ensure proper modular function resolution and background messaging support
import { getMessaging, getToken, onMessage } from "@firebase/messaging";

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
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const OWNER_EMAIL = "hotelshotabdiabashik@gmail.com";
export const VAPID_KEY = "uQlADdOxjQ7QLMhQew2uYE-9LYVr9R9m73dzKlRVwSs";

// Check if current user is Admin (Owner only)
export const isAdminUser = async (uid: string) => {
  const roleRef = ref(db, `roles/${uid}`);
  const snapshot = await get(roleRef);
  return snapshot.exists() && snapshot.val() === 'owner';
};

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Track Online Status
export const trackPresence = (uid: string) => {
  const statusRef = ref(db, `profiles/${uid}/onlineStatus`);
  set(statusRef, true);
  onDisconnect(statusRef).set(false);
};

// Notification Sound Utility
export const playNotificationSound = () => {
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.warn("Audio play blocked by browser policy"));
  } catch (e) {
    console.error("Audio error", e);
  }
};

// Track User Movement (Optimized for Free Plan)
export const trackUserMovement = (uid: string, path: string) => {
  // Only track if it's the owner to save bandwidth/storage on Spark plan
  const user = auth.currentUser;
  if (user?.email !== OWNER_EMAIL) {
    // For guests, just update their last active status (1 write instead of 2+push)
    update(ref(db, `profiles/${uid}`), {
      lastActive: serverTimestamp(),
      lastSeenPath: path
    });
    return;
  }

  // If owner, record movement for the "Live" view
  const movementRef = ref(db, `analytics/movements/${uid}`);
  const newMoveRef = push(movementRef);
  set(newMoveRef, {
    path,
    timestamp: serverTimestamp()
  });
  
  update(ref(db, `profiles/${uid}`), {
    lastSeenPath: path,
    lastActive: serverTimestamp()
  });
};

// Save User History (Generic utility for Fuad Ahmed)
export const saveUserHistory = async (uid: string, type: string, data: any) => {
  const historyRef = ref(db, `history/${uid}/${type}`);
  const newEntryRef = push(historyRef);
  const entry = {
    ...data,
    id: newEntryRef.key,
    timestamp: serverTimestamp()
  };
  await set(newEntryRef, entry);
  
  // Also sync to user_registry for easy guest access
  await update(ref(db, `user_registry/${uid}/history/${type}/${newEntryRef.key}`), entry);
  
  return newEntryRef.key;
};

// Save to User Registry (Dedicated node for guest-accessible history)
export const saveToRegistry = async (uid: string, path: string, data: any) => {
  const registryRef = ref(db, `user_registry/${uid}/${path}`);
  if (path.includes('/')) {
    // If it's a specific item update
    await update(registryRef, { ...data, lastUpdated: serverTimestamp() });
  } else {
    // If it's a list push
    const newRef = push(registryRef);
    await set(newRef, { ...data, id: newRef.key, timestamp: serverTimestamp() });
    return newRef.key;
  }
};

// Fix: Added checkUsernameUnique to verify if a handle is available or owned by the current user
export const checkUsernameUnique = async (username: string, uid: string) => {
  const usernameRef = ref(db, `usernames/${username.toLowerCase()}`);
  const snapshot = await get(usernameRef);
  if (!snapshot.exists()) return true;
  return snapshot.val() === uid;
};

// Fix: Added deleteUserProfile to allow administrative account removal while cleaning up registry handles
export const deleteUserProfile = async (uid: string) => {
  const profileRef = ref(db, `profiles/${uid}`);
  const snap = await get(profileRef);
  if (snap.exists()) {
    const data = snap.val();
    if (data.username) {
      await remove(ref(db, `usernames/${data.username.toLowerCase()}`));
    }
  }
  await remove(profileRef);
  await remove(ref(db, `roles/${uid}`));
  await remove(ref(db, `notifications/${uid}`));
  await remove(ref(db, `help_dex/messages/${uid}`));
  await remove(ref(db, `help_dex/active_chats/${uid}`));
  await remove(ref(db, `user_registry/${uid}`));
  await remove(ref(db, `history/${uid}`));
};

/**
 * Registry Audit Log: Tracks critical administrative actions.
 */
export const createAdminLog = async (action: string, details: string) => {
  const user = auth.currentUser;
  if (!user) return;
  
  const logRef = push(ref(db, 'logs'));
  return set(logRef, {
    id: logRef.key,
    actorId: user.uid,
    actorName: user.displayName || user.email,
    action,
    details,
    timestamp: Date.now()
  });
};

export const syncUserProfile = async (user: any) => {
  if (!user) return null;
  const userRef = ref(db, `profiles/${user.uid}`);
  const roleRef = ref(db, `roles/${user.uid}`);
  const now = Date.now();
  
  try {
    const [profileSnap, roleSnap] = await Promise.all([get(userRef), get(roleRef)]);
    let role = roleSnap.exists() ? roleSnap.val() : (user.email === OWNER_EMAIL ? 'owner' : 'guest');
    
    // Senior Architect Fix: Ensure owner role is explicitly set in the roles node
    if (user.email === OWNER_EMAIL) {
      if (role !== 'owner') {
        await set(roleRef, 'owner');
        role = 'owner';
      }
    } else if (role === 'manager') {
      // Demote manager to guest as per new requirements
      await set(roleRef, 'guest');
      role = 'guest';
    }
    
    trackPresence(user.uid);

    if (!profileSnap.exists()) {
      const freshProfile = {
        uid: user.uid,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: now,
        lastLogin: now,
        isComplete: false,
        legalName: '',
        username: '',
        phone: '',
        guardianPhone: '',
        nidNumber: '',
        nidImageUrl: '',
        role: role
      };
      await set(userRef, freshProfile);
      return freshProfile;
    } else {
      const data = profileSnap.val();
      await update(userRef, { lastLogin: now, role: role });
      return { ...data, lastLogin: now, role: role };
    }
  } catch (e) {
    return null;
  }
};

export const createNotification = async (userId: string, notification: any) => {
  const notificationsRef = ref(db, `notifications/${userId}`);
  const newNotificationRef = push(notificationsRef);
  const data = {
    ...notification,
    id: newNotificationRef.key,
    read: false,
    createdAt: Date.now()
  };
  await set(newNotificationRef, data);
  
  // Also log to history and registry for persistence
  await saveUserHistory(userId, 'notifications', { title: notification.title, type: notification.type });
  await saveToRegistry(userId, `notifications/${newNotificationRef.key}`, data);
  
  return data;
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
  serverTimestamp,
  onMessage,
  onDisconnect,
  query,
  limitToLast,
  orderByChild
};
