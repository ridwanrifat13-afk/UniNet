import React, { useState } from 'react';
import { Lock, Mail, Loader2, UserPlus, LogIn, AlertCircle, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup 
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { cn } from '../lib/utils';
import { doc, getDoc } from 'firebase/firestore';
import { useNetwork } from '../lib/network-context';

export default function Login() {
  const navigate = useNavigate();
  const { networkId } = useNetwork();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!networkId) {
      setError("No network context found.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      if (mode === 'register') {
        // 1. Verify Invitation Code dynamically
        const networkDoc = await getDoc(doc(db, 'networks', networkId));
        if (!networkDoc.exists()) {
          throw new Error("Network not found.");
        }
        const networkData = networkDoc.data();
        if (inviteCode.trim() !== networkData.inviteCode) {
          throw new Error("The Invitation Code you entered is incorrect.");
        }

        // 2. Create the account
        const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        // 3. Send Verification Email
        await sendEmailVerification(userCredential.user);
      } else {
        // Regular Login
        await setPersistence(auth, browserLocalPersistence);
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
      }
      
      navigate(`/n/${networkId}`);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email. Please register first.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("An account already exists with this email. Try logging in.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "An error occurred during authentication.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email.toLowerCase().trim());
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!networkId) return;
    setLoading(true);
    setError(null);
    try {
      // Always verify invite code for Google Login as requested
      const networkDoc = await getDoc(doc(db, 'networks', networkId));
      if (!networkDoc.exists()) {
        throw new Error("Network not found.");
      }
      if (inviteCode.trim() !== networkDoc.data().inviteCode) {
        throw new Error("Please enter the correct Invitation Code to use Google Login.");
      }

      const provider = new GoogleAuthProvider();
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, provider);
      navigate(`/n/${networkId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-black p-4 relative overflow-hidden">
      {/* Background Layer (Meet Us Style) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-magenta/10 rounded-full blur-[128px] mix-blend-screen" />
        <div className="absolute top-1/2 right-1/4 w-[30rem] h-[30rem] bg-brand-plum/20 rounded-full blur-[128px] mix-blend-screen" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-brand-pink/10 rounded-full blur-[128px] mix-blend-screen" />
        
        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
          <img 
            src="/eadb4a6d-c9e1-4278-979d-bcc7d8980362-removebg-preview.webp" 
            alt="Hardware Diagram" 
            className="w-full h-full object-contain opacity-[0.2] mix-blend-screen scale-125"
          />
        </div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-brand-plum/10 backdrop-blur-3xl rounded-[2.5rem] border border-brand-magenta/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-700">
          <div className="p-10 pb-8 text-center border-b border-brand-magenta/5">
            <div className="mx-auto w-20 h-20 bg-brand-magenta text-white rounded-3xl flex items-center justify-center font-bold text-4xl shadow-2xl shadow-brand-magenta/30 mb-8 relative -rotate-3 overflow-hidden group">
               U
              <div className="absolute inset-0 bg-white/20 -rotate-45 transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500"></div>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight font-display text-center">
              {resetMode ? 'Reset Password' : (mode === 'login' ? 'Department Auth' : 'Join the Network')}
            </h1>
            <p className="text-brand-highlight mt-3 text-sm font-bold uppercase tracking-widest text-center">
              {resetMode ? 'Security Recovery' : (mode === 'login' ? 'Student & Faculty Gateway' : 'Authorized Personnel Only')}
            </p>
          </div>
          
          <div className="p-10">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {resetMode ? (
              <form className="space-y-6" onSubmit={handleResetPassword}>
                {resetSent ? (
                  <div className="p-6 bg-brand-magenta/10 border border-brand-magenta/20 rounded-[2rem] text-center space-y-4 animate-in zoom-in-95">
                    <Mail className="mx-auto text-brand-pink" size={32} />
                    <p className="text-white font-medium">Reset link sent to your email!</p>
                    <button 
                      type="button"
                      onClick={() => setResetMode(false)}
                      className="text-xs font-black text-brand-highlight uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Back to Login
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-brand-highlight uppercase tracking-widest ml-1" htmlFor="reset-email">Email Address</label>
                      <input
                        id="reset-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full px-5 py-3.5 border border-brand-magenta/30 rounded-2xl bg-brand-black/40 text-white placeholder:text-brand-highlight/10 focus:ring-2 focus:ring-brand-pink/40 transition-all outline-none"
                        placeholder="student@uni.edu"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-brand-magenta text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-magenta/20 hover:bg-brand-pink transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setResetMode(false)}
                      className="w-full text-center text-xs font-black text-brand-highlight/40 uppercase tracking-widest hover:text-white transition-colors pt-4"
                    >
                      Cancel Recovery
                    </button>
                  </>
                )}
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-xs font-black text-brand-highlight uppercase tracking-widest ml-1" htmlFor="email">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-highlight/30 group-focus-within:text-brand-highlight transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 border border-brand-magenta/30 rounded-2xl bg-brand-black/40 text-white placeholder:text-brand-highlight/10 focus:ring-2 focus:ring-brand-pink/40 focus:border-brand-pink/50 transition-all outline-none backdrop-blur-xl"
                      placeholder="student@uni.edu"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-xs font-black text-brand-highlight uppercase tracking-widest" htmlFor="password">Password</label>
                    {mode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => {
                          setResetMode(true);
                          setResetSent(false);
                          setError(null);
                        }}
                        className="text-[10px] font-black text-brand-pink/60 hover:text-brand-pink uppercase tracking-widest transition-colors"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-highlight/30 group-focus-within:text-brand-highlight transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 border border-brand-magenta/30 rounded-2xl bg-brand-black/40 text-white placeholder:text-brand-highlight/10 focus:ring-2 focus:ring-brand-pink/40 focus:border-brand-pink/50 transition-all outline-none backdrop-blur-xl"
                      placeholder={"••••••••"}
                    />
                  </div>
                </div>

                {mode === 'register' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-xs font-black text-brand-highlight uppercase tracking-widest ml-1" htmlFor="inviteCode">Invitation Code</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-highlight/30 group-focus-within:text-brand-highlight transition-colors">
                        <KeyRound size={18} />
                      </div>
                      <input
                        id="inviteCode"
                        type="text"
                        required
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3.5 border border-brand-magenta/30 rounded-2xl bg-brand-black/40 text-white placeholder:text-brand-highlight/10 focus:ring-2 focus:ring-brand-pink/40 focus:border-brand-pink/50 transition-all outline-none backdrop-blur-xl"
                        placeholder="Enter Secret Code"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setMode(mode === 'login' ? 'register' : 'login');
                      setError(null);
                    }}
                    className="text-xs font-black text-brand-highlight hover:text-white tracking-widest uppercase transition-colors flex items-center gap-2"
                  >
                    {mode === 'login' ? <UserPlus size={14} /> : <LogIn size={14} />}
                    {mode === 'login' ? 'New here? Join' : 'Already joined? Login'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-magenta text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-magenta/20 hover:bg-brand-pink active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    mode === 'login' ? 'Enter Network' : 'Verify & Join'
                  )}
                </button>

                <div className="relative flex items-center justify-center my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-brand-magenta/10"></div>
                  </div>
                  <span className="relative px-4 bg-[#050505] text-[10px] font-black text-brand-highlight/30 uppercase tracking-widest">or</span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 text-white font-bold py-3.5 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.94 0 3.68.67 5.05 1.97l3.77-3.77C18.54 1.12 15.49 0 12 0 7.31 0 3.26 2.69 1.25 6.64l4.41 3.42c1.04-3.13 3.96-5.42 6.34-5.42z"/>
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.21-2.35H12v4.45h6.44c-.28 1.48-1.11 2.73-2.37 3.58l3.7 2.87c2.16-1.99 3.72-4.92 3.72-8.55z"/>
                    <path fill="#FBBC05" d="M5.66 14.56c-.28-.84-.44-1.74-.44-2.68s.16-1.84.44-2.68L1.25 5.76C.45 7.37 0 9.17 0 11.08s.45 3.71 1.25 5.32l4.41-3.42z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.7-2.87c-1.03.69-2.35 1.1-4.25 1.1-3.27 0-6.04-2.21-7.03-5.18L.55 17.56C2.56 21.43 6.96 24 12 24z"/>
                  </svg>
                  Continue with Google
                </button>
              </form>
            )}

            <div className="mt-10 text-center bg-brand-magenta/5 p-5 rounded-2xl border border-brand-magenta/10">
              <p className="text-[10px] text-brand-highlight/40 leading-relaxed font-bold uppercase tracking-widest">
                {mode === 'login' 
                  ? 'Access is logged for security auditing. Authorized devices only.' 
                  : 'You must have the secret departmental access code to create an account.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
