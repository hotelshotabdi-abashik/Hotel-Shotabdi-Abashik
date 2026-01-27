
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, LogIn, Loader2, UserPlus, CheckCircle2, ShieldAlert, AlertTriangle, RefreshCw, Hourglass } from 'lucide-react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  googleProvider, 
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut
} from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login', onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'success' | 'verify-pending'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode === 'login' ? 'login' : 'register');
      setError('');
      setSuccessMessage('');
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const formatError = (err: any) => {
    const code = err.code || '';
    
    if (code === 'auth/operation-not-allowed') {
      return "Provider Disabled: Enable 'Email/Password' in your Firebase Console.";
    }
    if (code === 'auth/unauthorized-domain') {
      return "Domain Not Authorized: Add this URL to 'Authorized domains' in Firebase Settings.";
    }
    if (code === 'auth/email-already-in-use') {
      return "This email is already in our registry. Please sign in.";
    }
    if (code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
      return "Invalid credentials. Please verify your email and password.";
    }
    if (code === 'auth/too-many-requests') {
      return "Too many attempts. Please try again later.";
    }
    
    return err.message.replace('Firebase:', '').replace(/auth\//g, '').replace(/-/g, ' ').trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const result = await signInWithEmailAndPassword(auth, email, password);
        
        // STRICT CHECK: If user isn't verified, don't let them in
        if (!result.user.emailVerified) {
          await signOut(auth); // Boot them out immediately
          setMode('verify-pending');
          setLoading(false);
          return;
        }

        if (onSuccess) onSuccess(result.user);
        onClose();
      } else if (mode === 'register') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        
        // Send verification link
        await sendEmailVerification(result.user);
        
        // Boot them out so they can't use the app until verified
        await signOut(auth);
        
        setSuccessMessage("REGISTRATION PENDING: Your account is created but locked. You must click the activation link sent to your email to use your account.");
        setMode('success');
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        setSuccessMessage("Recovery link sent! Check your inbox to reset your password.");
        setMode('success');
      }
    } catch (err: any) {
      console.error("Auth Exception:", err);
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    // Note: Since we sign out unverified users, we have to sign them in briefly to resend
    // or tell them to try signing in again to trigger the flow.
    setError("To receive a new link, please attempt to Sign In. If the account is unverified, we will offer a resend option there.");
    setMode('login');
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Google accounts are usually pre-verified by Google
      if (onSuccess) onSuccess(result.user);
      onClose();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(formatError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Dynamic Header */}
        <div className="bg-hotel-primary p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            {mode === 'login' && <LogIn size={24} />}
            {mode === 'register' && <UserPlus size={24} />}
            {mode === 'forgot' && <ShieldAlert size={24} />}
            {mode === 'success' && <CheckCircle2 size={24} />}
            {mode === 'verify-pending' && <Hourglass size={24} className="animate-spin" />}
          </div>
          <h3 className="text-2xl font-serif font-black mb-1">
            {mode === 'login' && 'Identity Check'}
            {mode === 'register' && 'Apply for Residency'}
            {mode === 'forgot' && 'Access Recovery'}
            {mode === 'success' && 'Registration Sent'}
            {mode === 'verify-pending' && 'Action Required'}
          </h3>
          <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em]">
            Mandatory Email Verification
          </p>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-hotel-primary text-[10px] font-black rounded-xl text-center uppercase tracking-widest flex items-center gap-3">
              <AlertTriangle size={18} className="shrink-0" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          {mode === 'verify-pending' ? (
            <div className="text-center space-y-6 py-4">
              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 shadow-inner">
                <p className="text-sm text-amber-900 leading-relaxed font-bold">
                  Account found, but it is NOT ACTIVE.
                </p>
                <p className="text-[11px] text-amber-700 mt-2 font-medium">
                  We have sent a verification LINK to your email. You must click that link before you can log in to Shotabdi Residential.
                </p>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => setMode('login')}
                  className="w-full bg-hotel-primary text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2"
                >
                  I've Verified, Let's Login
                </button>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                  Don't see the email? Check your Spam or Promotions folder.
                </p>
              </div>
            </div>
          ) : mode === 'success' ? (
            <div className="text-center space-y-6 py-4">
              <div className="p-5 bg-green-50 rounded-2xl border border-green-100 shadow-sm">
                <p className="text-sm text-green-800 leading-relaxed font-bold uppercase tracking-tight">
                  Verification Required
                </p>
                <p className="text-[11px] text-green-700 mt-2 font-medium">
                  {successMessage}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-100">
                 <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Next Steps:</p>
                 <ul className="text-[10px] text-gray-600 space-y-1.5 font-medium">
                   <li className="flex items-center gap-2"><div className="w-1 h-1 bg-hotel-primary rounded-full"></div> 1. Open your Email Inbox</li>
                   <li className="flex items-center gap-2"><div className="w-1 h-1 bg-hotel-primary rounded-full"></div> 2. Click the Verification Link</li>
                   <li className="flex items-center gap-2"><div className="w-1 h-1 bg-hotel-primary rounded-full"></div> 3. Return here to Sign In</li>
                 </ul>
              </div>
              <button 
                onClick={() => setMode('login')}
                className="w-full bg-hotel-primary text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-red-50 hover:bg-hotel-secondary transition-all active:scale-95"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <>
              {mode !== 'forgot' && (
                <>
                  <button 
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin text-hotel-primary" />
                    ) : (
                      <>
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                        Verify via Google
                      </>
                    )}
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-gray-100 w-full"></div>
                    <span className="bg-white px-4 text-[9px] font-black text-gray-300 uppercase tracking-widest absolute">Manual Entry</span>
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Official Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 pl-11 pr-4 text-xs font-medium focus:border-hotel-primary outline-none transition-all"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Security Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input 
                        type="password" 
                        required={mode !== 'forgot'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 pl-11 pr-4 text-xs font-medium focus:border-hotel-primary outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-hotel-primary text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-red-50 hover:bg-hotel-secondary transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' && <LogIn size={16} />}
                      {mode === 'register' && <UserPlus size={16} />}
                      {mode === 'forgot' && <Mail size={16} />}
                      {mode === 'login' && 'Sign In'}
                      {mode === 'register' && 'Register Account'}
                      {mode === 'forgot' && 'Send Recovery Link'}
                    </>
                  )}
                </button>
              </form>

              <div className="flex flex-col gap-3 text-center pt-2">
                {mode === 'login' ? (
                  <>
                    <button 
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[10px] font-black text-gray-400 hover:text-hotel-primary uppercase tracking-widest transition-colors"
                    >
                      Forgot Credentials?
                    </button>
                    <button 
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-[10px] font-black text-gray-400 hover:text-hotel-primary uppercase tracking-widest transition-colors"
                    >
                      Need an Account? Register
                    </button>
                  </>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-[10px] font-black text-gray-400 hover:text-hotel-primary uppercase tracking-widest transition-colors"
                  >
                    Back to Secure Login
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
