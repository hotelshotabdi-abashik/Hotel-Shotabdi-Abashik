
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAk6x2Mt9IqmQftA5YI-wBbPEP9KBH2wFQ",
  authDomain: "hotel-shotabdi.firebaseapp.com",
  projectId: "hotel-shotabdi",
  storageBucket: "hotel-shotabdi.firebasestorage.app",
  messagingSenderId: "682102275681",
  appId: "1:682102275681:web:f9362e8a87daed0736b420",
  measurementId: "G-BEMY9J3Z0M"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Custom parameters to improve the redirect experience
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
};
