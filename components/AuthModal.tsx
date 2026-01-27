
import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup
} from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (onSuccess) onSuccess(result.user);
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setLoading(false);
        return;
      }
      setError(err.message.replace('Firebase:', '').trim());
    } finally {
      setLoading(false);
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
          <h3 className="text-xl font-serif font-black tracking-tight">Login</h3>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-70 mt-1">Shotabdi Residential</p>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-hotel-primary text-[10px] font-black rounded-xl text-center uppercase tracking-widest border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button 
              onClick={handleSignIn}
              disabled={loading}
              className="w-full bg-white border border-gray-200 text-gray-700 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin text-hotel-primary" />
              ) : (
                <>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                  Continue with Google
                </>
              )}
            </button>
          </div>

          <p className="text-center text-[8px] text-gray-300 font-bold uppercase tracking-widest">
            Secure verified access
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
