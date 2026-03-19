import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  getDocs,
  writeBatch,
  increment
} from "firebase/firestore";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithCredential,
} from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import firebaseConfig from "../firebase-applet-config.json";

export { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  getDocs,
  writeBatch,
  increment,
  onAuthStateChanged, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithCredential,
};

// Senior Architect Note: Using the newly provisioned project 'Shotabdi Abashik Test'
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const OWNER_EMAIL = "hotelshotabdiabashik@gmail.com";
export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "BMYSFivUjrkvc9y3v3f5xulgbXY0wXtPKl7HSco62Vky4icfBopDXzWBXZ73x2n3T5R_2iX5JoiCz3fY7yUCemk";

// Error Handling Spec for Firestore Permissions
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const playNotificationSound = () => {
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch (e) {}
};

// Check if current user is Admin (Owner only)
export const isAdminUser = async (uid: string) => {
  try {
    const roleDoc = await getDoc(doc(db, "roles", uid));
    return roleDoc.exists() && roleDoc.data()?.role === 'owner';
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `roles/${uid}`);
    return false;
  }
};

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Track User Movement (Optimized for Firestore)
export const trackUserMovement = async (uid: string, path: string) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await updateDoc(doc(db, "profiles", uid), {
      lastSeenPath: path,
      lastActive: serverTimestamp(),
      onlineStatus: true
    });

    if (user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
      await addDoc(collection(db, "analytics", user.uid, "movements"), {
        path,
        timestamp: serverTimestamp()
      });
    }
  } catch (error) {
    // Silent fail for movement tracking to not interrupt UX
    console.warn("Movement tracking failed", error);
  }
};

// Database Resilience Utility: Cleans up old data to stay within Spark plan limits.
export const cleanupDatabase = async () => {
  if (auth.currentUser?.email?.toLowerCase() !== OWNER_EMAIL.toLowerCase()) return;

  try {
    // Firestore cleanup is more complex due to lack of bulk delete in client SDK
    // We'll implement a simple version for logs
    const logsQuery = query(collection(db, "logs"), orderBy("timestamp", "desc"), limit(100));
    const logsSnap = await getDocs(logsQuery);
    if (logsSnap.size > 50) {
      const batch = writeBatch(db);
      logsSnap.docs.slice(50).forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
    console.log("Database cleanup completed.");
  } catch (e) {
    console.error("Cleanup failed", e);
  }
};

// Save User History
export const saveUserHistory = async (uid: string, type: string, data: any) => {
  try {
    const historyRef = collection(db, "history", uid, type);
    const docRef = await addDoc(historyRef, {
      ...data,
      timestamp: serverTimestamp()
    });
    
    // Also sync to user_registry
    await setDoc(doc(db, "user_registry", uid, "history", type, docRef.id), {
      ...data,
      id: docRef.id,
      timestamp: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `history/${uid}/${type}`);
  }
};

// Save to User Registry
export const saveToRegistry = async (uid: string, path: string, data: any) => {
  try {
    const parts = path.split('/');
    if (parts.length % 2 === 0) {
      // Specific document update
      await setDoc(doc(db, "user_registry", uid, ...parts), {
        ...data,
        lastUpdated: serverTimestamp()
      }, { merge: true });
    } else {
      // Collection push
      const docRef = await addDoc(collection(db, "user_registry", uid, ...parts), {
        ...data,
        timestamp: serverTimestamp()
      });
      return docRef.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `user_registry/${uid}/${path}`);
  }
};

// Check if a handle is available
export const checkUsernameUnique = async (username: string, uid: string) => {
  try {
    const usernameDoc = await getDoc(doc(db, "usernames", username.toLowerCase()));
    if (!usernameDoc.exists()) return true;
    return usernameDoc.data()?.uid === uid;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `usernames/${username}`);
    return false;
  }
};

// Delete User Profile
export const deleteUserProfile = async (uid: string) => {
  try {
    const profileDoc = await getDoc(doc(db, "profiles", uid));
    if (profileDoc.exists()) {
      const data = profileDoc.data();
      if (data?.username) {
        await deleteDoc(doc(db, "usernames", data.username.toLowerCase()));
      }
    }
    await deleteDoc(doc(db, "profiles", uid));
    await deleteDoc(doc(db, "roles", uid));
    // Subcollections need recursive deletion which is not supported in client SDK
    // We'll just delete the main docs for now
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `profiles/${uid}`);
  }
};

// Registry Audit Log
export const createAdminLog = async (action: string, details: string) => {
  const user = auth.currentUser;
  if (!user) return;
  
  try {
    await addDoc(collection(db, "logs"), {
      actorId: user.uid,
      actorName: user.displayName || user.email,
      action,
      details,
      timestamp: Date.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "logs");
  }
};

export const syncUserProfile = async (user: any) => {
  if (!user) return null;
  const userRef = doc(db, "profiles", user.uid);
  const roleRef = doc(db, "roles", user.uid);
  const now = Date.now();
  
  try {
    const [profileSnap, roleSnap] = await Promise.all([getDoc(userRef), getDoc(roleRef)]);
    const isOwner = user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
    let role = roleSnap.exists() ? roleSnap.data()?.role : (isOwner ? 'owner' : 'guest');
    
    if (isOwner) {
      if (role !== 'owner') {
        await setDoc(roleRef, { role: 'owner' }, { merge: true });
        role = 'owner';
      }
    }
    
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
      await setDoc(userRef, freshProfile);
      return freshProfile;
    } else {
      const data = profileSnap.data();
      await updateDoc(userRef, { lastLogin: now, role: role });
      return { ...data, lastLogin: now, role: role };
    }
  } catch (e) {
    console.error("Sync profile failed", e);
    return null;
  }
};

export const createNotification = async (userId: string, notification: any) => {
  try {
    const docRef = await addDoc(collection(db, "notifications", userId, "items"), {
      ...notification,
      read: false,
      createdAt: Date.now()
    });
    
    const data = { ...notification, id: docRef.id, read: false, createdAt: Date.now() };
    await saveUserHistory(userId, 'notifications', { title: notification.title, type: notification.type });
    return data;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `notifications/${userId}`);
  }
};
