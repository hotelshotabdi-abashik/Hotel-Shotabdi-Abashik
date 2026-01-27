
import React, { useState } from 'react';
import { X, Loader2, Facebook, Twitter } from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  facebookProvider, 
  twitterProvider, 
  signInWithPopup
} from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSignIn = async (provider: any, name: string) => {
    setLoading(name);
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      if (onSuccess) onSuccess(result.user);
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setLoading(null);
        return;
      }
      setError(err.message.replace('Firebase:', '').trim());
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-[340px] rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-gray-100">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="bg-hotel-primary p-8 text-white text-center">
          <h3 className="text-xl font-serif font-black tracking-tight">Member Access</h3>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-70 mt-1">Shotabdi Residential</p>
        </div>

        <div className="p-8 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-hotel-primary text-[10px] font-black rounded-xl text-center uppercase tracking-widest border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Google Login */}
            <button 
              onClick={() => handleSignIn(googleProvider, 'google')}
              disabled={!!loading}
              className="w-full bg-white border border-gray-200 text-gray-700 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading === 'google' ? (
                <Loader2 size={16} className="animate-spin text-hotel-primary" />
              ) : (
                <>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                  Google Sign In
                </>
              )}
            </button>

            {/* Facebook Login */}
            <button 
              onClick={() => handleSignIn(facebookProvider, 'facebook')}
              disabled={!!loading}
              className="w-full bg-[#1877F2] text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading === 'facebook' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Facebook size={16} fill="currentColor" />
                  Facebook Login
                </>
              )}
            </button>

            {/* Twitter Login */}
            <button 
              onClick={() => handleSignIn(twitterProvider, 'twitter')}
              disabled={!!loading}
              className="w-full bg-[#1DA1F2] text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading === 'twitter' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Twitter size={16} fill="currentColor" />
                  Twitter Login
                </>
              )}
            </button>
          </div>

          <p className="text-center text-[8px] text-gray-300 font-bold uppercase tracking-widest pt-4">
            Secure multi-provider verification
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
