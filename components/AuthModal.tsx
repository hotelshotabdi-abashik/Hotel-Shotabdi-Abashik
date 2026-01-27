
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, LogIn, Loader2, UserPlus, CheckCircle2, ShieldAlert, AlertTriangle, RefreshCw, Hourglass, ShieldCheck } from 'lucide-react';
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

  // List of common disposable/fake email domains to block
  const DISPOSABLE_DOMAINS = [
    'mailinator.com', 'yopmail.com', 'temp-mail.org', 'guerrillamail.com', 
    '10minutemail.com', 'trashmail.com', 'dispostable.com', 'getnada.com',
    'tempmail.net', 'sharklasers.com', 'fake-mail.net'
  ];

  const validateEmailAuthenticity = (emailStr: string): { valid: boolean; message?: string } => {
    const email = emailStr.toLowerCase().trim();
    if (!email) return { valid: false };

    // Basic Structure Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: "Please enter a valid email structure (e.g. name@domain.com)" };
    }

    const domain = email.split('@')[1];
    
    // 1. Block Disposable Emails
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      return { valid: false, message: "Temporary/Disposable emails are not allowed for security reasons." };
    }

    // 2. Randomness Check (Detecting keyboard mashing like 'asdfghjkl@gmail.com')
    const username = email.split('@')[0];
    const uniqueChars = new Set(username).size;
    if (username.length > 8 && uniqueChars < 4) {
      return { valid: false, message: "This email address looks like random characters. Please use a real address." };
    }

    // 3. Sequential Character Check (Detecting 'abcde@gmail.com')
    if (/abcdef|123456|asdfgh/.test(username)) {
      return { valid: false, message: "Sequential character emails are flagged as suspicious. Please use your real name." };
    }

    return { valid: true };
  };

  const formatError = (err: any) => {
    const code = err.code || '';
    if (code === 'auth/operation-not-allowed') return "System Error: Email login is currently disabled.";
    if (code === 'auth/unauthorized-domain') return "Access denied: This website domain is not in the allowed list.";
    if (code === 'auth/email-already-in-use') return "This email is already registered. Please sign in.";
    if (code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
      return "Incorrect details. If you just registered, check your email for the activation link.";
    }
    return err.message.replace('Firebase:', '').replace(/auth\//g, '').replace(/-/g, ' ').trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Pre-flight check for "Real Email" quality
    if (mode === 'register') {
      const validation = validateEmailAuthenticity(email);
      if (!validation.valid) {
        setError(validation.message || "Invalid email address.");
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === 'login') {
        const result = await signInWithEmailAndPassword(auth, email, password);
        
        // Final verify check: Is it actually a real inbox?
        if (!result.user.emailVerified) {
          await signOut(auth);
          setMode('verify-pending');
          setLoading(false);
          return;
        }

        if (onSuccess) onSuccess(result.user);
        onClose();
      } else if (mode === 'register') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(result.user);
        await signOut(auth);
        setSuccessMessage("VERIFICATION SENT: We have sent a link to " + email + ". You must open your inbox and click the link to activate your membership.");
        setMode('success');
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        setSuccessMessage("A password reset link has been dispatched to your email address.");
        setMode('success');
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Google pre-verifies emails, so we don't need a separate link check here usually
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
            {mode === 'login' && 'Identity Portal'}
            {mode === 'register' && 'Apply for Residency'}
            {mode === 'forgot' && 'Access Recovery'}
            {mode === 'success' && 'Email Dispatched'}
            {mode === 'verify-pending' && 'Account Locked'}
          </h3>
          <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em]">
            {mode === 'register' ? 'Real Email Required' : 'Shotabdi Residential'}
          </p>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-hotel-primary text-[10px] font-black rounded-xl text-center uppercase tracking-widest flex items-center gap-3">
              <AlertTriangle size={18} className="shrink-0" />
              <span className="flex-1 leading-normal">{error}</span>
            </div>
          )}

          {mode === 'verify-pending' ? (
            <div className="text-center space-y-6 py-4">
              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 shadow-inner">
                <p className="text-sm text-amber-900 leading-relaxed font-bold">
                  UNVERIFIED ACCOUNT
                </p>
                <p className="text-[11px] text-amber-700 mt-2 font-medium">
                  To prevent fake registrations, you must click the link sent to your email. We do not accept random-word emails.
                </p>
              </div>
              <button 
                onClick={() => setMode('login')}
                className="w-full bg-hotel-primary text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2"
              >
                I've Verified, Log In
              </button>
            </div>
          ) : mode === 'success' ? (
            <div className="text-center space-y-6 py-4">
              <div className="p-5 bg-green-50 rounded-2xl border border-green-100 shadow-sm">
                <p className="text-sm text-green-800 leading-relaxed font-bold uppercase tracking-tight">
                  Action Required
                </p>
                <p className="text-[11px] text-green-700 mt-2 font-medium">
                  {successMessage}
                </p>
              </div>
              <div className="bg-gray-50 p-5 rounded-2xl text-left border border-gray-100">
                 <div className="flex items-center gap-2 mb-3 text-hotel-primary">
                    <ShieldCheck size={16} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Next Security Step</p>
                 </div>
                 <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                   Go to your inbox (e.g. Gmail/Outlook) and click the button in the email from <span className="text-hotel-primary">noreply@hotel-shotabdi...</span>
                 </p>
              </div>
              <button 
                onClick={() => setMode('login')}
                className="w-full bg-hotel-primary text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg hover:bg-hotel-secondary transition-all"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <>
              {mode !== 'forgot' && (
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                  Continue with Google
                </button>
              )}

              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-100 w-full"></div>
                <span className="bg-white px-4 text-[9px] font-black text-gray-300 uppercase tracking-widest absolute">Secure Registry</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Official Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 pl-11 pr-4 text-xs font-medium focus:border-hotel-primary outline-none transition-all"
                      placeholder="e.g. yourname@gmail.com"
                    />
                  </div>
                  {mode === 'register' && email.length > 5 && (
                    <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                      Will be verified via activation link.
                    </p>
                  )}
                </div>

                {mode !== 'forgot' && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Private Password</label>
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
                  className="w-full bg-hotel-primary text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-red-50 hover:bg-hotel-secondary transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' && <LogIn size={16} />}
                      {mode === 'register' && <UserPlus size={16} />}
                      {mode === 'forgot' && <Mail size={16} />}
                      {mode === 'login' && 'Sign In'}
                      {mode === 'register' && 'Register Residence'}
                      {mode === 'forgot' && 'Reset My Password'}
                    </>
                  )}
                </button>
              </form>

              <div className="flex flex-col gap-3 text-center pt-2">
                <button 
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-[10px] font-black text-gray-400 hover:text-hotel-primary uppercase tracking-widest transition-colors"
                >
                  {mode === 'login' ? 'New Member? Create Account' : 'Existing Member? Sign In'}
                </button>
                {mode === 'login' && (
                  <button 
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[10px] font-black text-gray-400 hover:text-hotel-primary uppercase tracking-widest transition-colors"
                  >
                    Lost Credentials?
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
