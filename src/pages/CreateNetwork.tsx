import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Key, Mail, Shield, Check, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function CreateNetwork() {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [networkName, setNetworkName] = useState('');
  const [slug, setSlug] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [plan, setPlan] = useState('Free Trial');
  const [creationError, setCreationError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user && user.emailVerified && step === 1) {
      setStep(2);
    }
  }, [user, step]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      await setPersistence(auth, browserLocalPersistence);
      if (authMode === 'register') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(cred.user);
        setStep(1.5); // Email Verification Step
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleNetworkNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNetworkName(name);
    setSlug(name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
  };

  const handleCreateNetwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.emailVerified) {
      setCreationError("Please verify your email first.");
      return;
    }
    if (!slug || !networkName || !inviteCode) {
      setCreationError("Please fill all fields.");
      return;
    }

    setCreating(true);
    setCreationError(null);

    try {
      // Check if slug is available
      const networkRef = doc(db, 'networks', slug);
      const networkSnap = await getDoc(networkRef);
      if (networkSnap.exists()) {
        throw new Error("This network URL is already taken.");
      }

      // Create network
      await setDoc(networkRef, {
        name: networkName,
        inviteCode: inviteCode,
        plan: plan,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });

      // Add user as admin
      await setDoc(doc(db, `networks/${slug}/admins`, user.uid), {
        role: 'admin',
        addedAt: serverTimestamp()
      });

      // Add user as member
      await setDoc(doc(db, `networks/${slug}/members`, user.uid), {
        displayName: user.displayName || user.email?.split('@')[0] || 'Admin',
        email: user.email,
        role: 'admin',
        joinedAt: serverTimestamp()
      });

      navigate(`/n/${slug}/admin`);
    } catch (err: any) {
      setCreationError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-brand-black flex items-center justify-center"><Loader2 className="animate-spin text-brand-magenta w-8 h-8" /></div>;
  }

  return (
    <div className="min-h-screen bg-brand-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-magenta/10 rounded-full blur-[128px] mix-blend-screen pointer-events-none" />
      
      <div className="max-w-xl w-full z-10">
        <div className="mb-8 text-center">
          <div className="mx-auto w-16 h-16 bg-brand-magenta text-white rounded-2xl flex items-center justify-center font-bold text-3xl shadow-xl shadow-brand-magenta/30 mb-4 rotate-3">
             U
          </div>
          <h1 className="text-3xl font-black mb-2">Setup Your Network</h1>
          <p className="text-brand-highlight">Create a dedicated space for your students</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 p-8 shadow-2xl">
          {step === 1 && (!user || !user.emailVerified) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Shield className="text-brand-magenta" /> Admin Account</h2>
              {authError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2"><AlertCircle size={16}/>{authError}</div>}
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-brand-highlight uppercase tracking-widest ml-1 mb-1 block">Work Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-magenta/50" />
                </div>
                <div>
                  <label className="text-xs font-bold text-brand-highlight uppercase tracking-widest ml-1 mb-1 block">Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-magenta/50" />
                </div>
                <button type="submit" disabled={authLoading} className="w-full py-3 bg-brand-magenta hover:bg-brand-pink text-white font-bold rounded-xl flex justify-center items-center gap-2 transition-all">
                  {authLoading ? <Loader2 className="animate-spin" /> : (authMode === 'register' ? 'Create Admin Account' : 'Login')}
                </button>
                <button type="button" onClick={() => setAuthMode(m => m === 'login' ? 'register' : 'login')} className="w-full text-sm text-brand-highlight hover:text-white transition-colors">
                  {authMode === 'login' ? "Need an account? Register" : "Already have an account? Login"}
                </button>
              </form>
            </motion.div>
          )}

          {step === 1.5 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <Mail className="mx-auto text-brand-magenta mb-4 w-12 h-12" />
              <h2 className="text-xl font-bold mb-2">Verify your email</h2>
              <p className="text-brand-highlight mb-6">We've sent a verification link to {email}. Please verify your email to continue setup.</p>
              <button onClick={() => window.location.reload()} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all">
                I've verified my email
              </button>
            </motion.div>
          )}

          {step === 2 && user && user.emailVerified && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Network className="text-brand-magenta" /> Network Details</h2>
              {creationError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2"><AlertCircle size={16}/>{creationError}</div>}
              <form onSubmit={handleCreateNetwork} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-brand-highlight uppercase tracking-widest ml-1 mb-1 block">Network Name</label>
                  <input type="text" required value={networkName} onChange={handleNetworkNameChange} placeholder="e.g., Computer Science 2025" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-magenta/50" />
                </div>
                <div>
                  <label className="text-xs font-bold text-brand-highlight uppercase tracking-widest ml-1 mb-1 block">Network URL slug</label>
                  <div className="flex">
                    <span className="bg-white/5 border border-white/10 border-r-0 rounded-l-xl px-4 py-3 text-brand-highlight text-sm flex items-center">uninet.app/n/</span>
                    <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="w-full bg-black/40 border border-white/10 rounded-r-xl px-4 py-3 outline-none focus:border-brand-magenta/50" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-brand-highlight uppercase tracking-widest ml-1 mb-1 block">Secret Invite Code</label>
                  <input type="text" required value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase().replace(/\s/g, ''))} placeholder="e.g., SECRET-2025" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-magenta/50 uppercase" />
                  <p className="text-[10px] text-brand-highlight mt-1 ml-1">Students will need this code to join your network.</p>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-brand-highlight uppercase tracking-widest ml-1 mb-2 block">Select Plan</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Free Trial', 'Starter', 'Pro'].map(p => (
                      <div 
                        key={p} 
                        onClick={() => setPlan(p)}
                        className={`cursor-pointer p-4 rounded-xl border transition-all ${plan === p ? 'bg-brand-magenta/20 border-brand-magenta text-white' : 'bg-white/5 border-white/10 text-brand-highlight hover:border-white/30'}`}
                      >
                        <div className="font-bold">{p}</div>
                        <div className="text-xs mt-1 opacity-80">{p === 'Free Trial' ? '50 students max' : p === 'Starter' ? '150 students max' : '400 students max'}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={creating} className="w-full mt-4 py-4 bg-brand-magenta hover:bg-brand-pink text-white font-black uppercase tracking-widest rounded-xl flex justify-center items-center gap-2 transition-all shadow-xl shadow-brand-magenta/20">
                  {creating ? <Loader2 className="animate-spin" /> : 'Launch Network'}
                  {!creating && <ArrowRight size={18} />}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
