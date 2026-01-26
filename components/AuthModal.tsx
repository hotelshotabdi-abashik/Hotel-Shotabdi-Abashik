
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, LogIn, Sparkles, Loader2, UserPlus } from 'lucide-react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  googleProvider, 
  signInWithRedirect 
} from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message.replace('Firebase:', '').replace('auth/', '').replace('-', ' '));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
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
            {isLogin ? <LogIn size={24} /> : <UserPlus size={24} />}
          </div>
          <h3 className="text-2xl font-serif font-black mb-1">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h3>
          <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em]">
            Hotel Shotabdi Residential
          </p>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-hotel-primary text-[10px] font-black rounded-xl text-center uppercase tracking-widest">
              {error}
            </div>
          )}

          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {!loading && <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />}
            {loading ? <Loader2 size={16} className="animate-spin text-hotel-primary" /> : 'Sign in with Google'}
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-100 w-full"></div>
            <span className="bg-white px-4 text-[9px] font-black text-gray-300 uppercase tracking-widest absolute">Or use Email</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 pl-11 pr-4 text-xs font-medium focus:border-hotel-primary outline-none transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 pl-11 pr-4 text-xs font-medium focus:border-hotel-primary outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-hotel-primary text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-red-50 hover:bg-hotel-secondary transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : (isLogin ? <LogIn size={16} /> : <Sparkles size={16} />)}
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-black text-gray-400 hover:text-hotel-primary uppercase tracking-widest transition-colors"
            >
              {isLogin ? "Need an account? Sign Up" : "Already a member? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
