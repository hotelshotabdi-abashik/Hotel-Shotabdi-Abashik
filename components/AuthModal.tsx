
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, LogIn, Loader2, UserPlus, CheckCircle2, ShieldAlert } from 'lucide-react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  googleProvider, 
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail
} from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login', onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'success'>(initialMode === 'login' ? 'login' : 'register');
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

  const formatError = (errMsg: string) => {
    return errMsg
      .replace('Firebase:', '')
      .replace('auth/', '')
      .replace(/-/g, ' ')
      .replace(/\(.*\)/, '')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (onSuccess) onSuccess(result.user);
        onClose();
      } else if (mode === 'register') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Send Email Verification Link
        await sendEmailVerification(result.user);
        setSuccessMessage("Account created! A verification link has been sent to your email. Please check your inbox (and spam) to activate your residency profile.");
        setMode('success');
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        setSuccessMessage("Password reset link sent! Check your email to create a new secure password.");
        setMode('success');
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(formatError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (onSuccess) onSuccess(result.user);
      onClose();
    } catch (err: any) {
      console.error("Popup Error:", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError("Google authentication failed. Ensure you have authorized this domain in your Firebase console.");
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
          </div>
          <h3 className="text-2xl font-serif font-black mb-1">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'register' && 'Join Membership'}
            {mode === 'forgot' && 'Account Recovery'}
            {mode === 'success' && 'Request Sent'}
          </h3>
          <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em]">
            Shotabdi Residential
          </p>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-hotel-primary text-[10px] font-black rounded-xl text-center uppercase tracking-widest animate-pulse">
              {error}
            </div>
          )}

          {mode === 'success' ? (
            <div className="text-center space-y-6 py-4">
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                {successMessage}
              </p>
              <button 
                onClick={() => setMode('login')}
                className="w-full bg-hotel-primary text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-red-50 hover:bg-hotel-secondary transition-all active:scale-95"
              >
                Return to Login
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
                        Google Sign In
                      </>
                    )}
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-gray-100 w-full"></div>
                    <span className="bg-white px-4 text-[9px] font-black text-gray-300 uppercase tracking-widest absolute">Or Standard Entry</span>
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
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
                  className="w-full bg-hotel-primary text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-red-50 hover:bg-hotel-secondary transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' && <LogIn size={16} />}
                      {mode === 'register' && <UserPlus size={16} />}
                      {mode === 'forgot' && <Mail size={16} />}
                      {mode === 'login' && 'Sign In Now'}
                      {mode === 'register' && 'Join Membership'}
                      {mode === 'forgot' && 'Send Reset Link'}
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
                      Forgot Password?
                    </button>
                    <button 
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-[10px] font-black text-gray-400 hover:text-hotel-primary uppercase tracking-widest transition-colors"
                    >
                      New to Shotabdi? Create Account
                    </button>
                  </>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-[10px] font-black text-gray-400 hover:text-hotel-primary uppercase tracking-widest transition-colors"
                  >
                    Already a Member? Login Here
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
