
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithCredential,
} from "firebase/auth";
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
  onDisconnect
} from "firebase/database";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Track Online Status
export const trackPresence = (uid: string) => {
  const statusRef = ref(db, `profiles/${uid}/onlineStatus`);
  set(statusRef, true);
  onDisconnect(statusRef).set(false);
};

export const requestNotificationToken = async () => {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return await getToken(messaging, { vapidKey: VAPID_KEY });
    }
    return null;
  } catch (error) {
    console.error("FCM Token Error:", error);
    return null;
  }
};

export const checkUsernameUnique = async (username: string, currentUid: string) => {
  try {
    const normalized = username.toLowerCase().trim();
    const usernameRef = ref(db, `usernames/${normalized}`);
    const snapshot = await get(usernameRef);
    if (snapshot.exists()) {
      return snapshot.val() === currentUid;
    }
    return true;
  } catch (e) {
    return true;
  }
};

export const syncUserProfile = async (user: any) => {
  if (!user) return null;
  const userRef = ref(db, `profiles/${user.uid}`);
  const roleRef = ref(db, `roles/${user.uid}`);
  const now = Date.now();
  
  try {
    const [profileSnap, roleSnap] = await Promise.all([get(userRef), get(roleRef)]);
    const role = roleSnap.exists() ? roleSnap.val() : (user.email === OWNER_EMAIL ? 'owner' : 'guest');
    
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
      if (user.email === OWNER_EMAIL) await set(roleRef, 'owner');
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

export const deleteUserProfile = async (uid: string, username?: string) => {
  const updates: any = {};
  updates[`profiles/${uid}`] = null;
  if (username) {
    updates[`usernames/${username.toLowerCase().trim()}`] = null;
  }
  updates[`notifications/${uid}`] = null;
  updates[`roles/${uid}`] = null;
  return update(ref(db), updates);
};

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
  serverTimestamp,
  onMessage,
  onDisconnect
};
