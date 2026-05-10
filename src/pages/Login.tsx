import React, { useState } from 'react';
import { Lock, Mail, Loader2, UserPlus, LogIn, AlertCircle, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';

// CHANGE THIS CODE TO YOUR SECURE SECRET
const SECRET_INVITE_CODE = "UNINET-CSE25";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      if (mode === 'register') {
        // 1. Verify Invitation Code
        if (inviteCode.trim() !== SECRET_INVITE_CODE) {
          throw new Error("The Invitation Code you entered is incorrect.");
        }

        // 2. Create the account
        await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      } else {
        // Regular Login
        await setPersistence(auth, browserLocalPersistence);
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
      }
      
      navigate('/');
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
              {mode === 'login' ? 'Department Auth' : 'Join the Network'}
            </h1>
            <p className="text-brand-highlight mt-3 text-sm font-bold uppercase tracking-widest text-center">
              {mode === 'login' ? 'Student & Faculty Gateway' : 'Authorized Personnel Only'}
            </p>
          </div>
          
          <div className="p-10">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="font-medium">{error}</p>
              </div>
            )}

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
                <label className="text-xs font-black text-brand-highlight uppercase tracking-widest ml-1" htmlFor="password">Password</label>
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
            </form>

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
