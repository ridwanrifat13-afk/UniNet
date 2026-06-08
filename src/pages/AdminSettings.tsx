import React, { useState, useEffect } from 'react';
import { useNetwork } from '../lib/network-context';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc, collection, onSnapshot, deleteDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Settings, Users, Key, AlertCircle, Loader2, Shield, Trash2, Edit2, Check, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';
import { uploadFileToR2 } from '../lib/storage';

interface NetworkData {
  name: string;
  inviteCode: string;
  plan: string;
  logoUrl?: string;
  theme?: string;
}

interface Member {
  id: string;
  displayName: string;
  email: string;
  role?: string;
}

export default function AdminSettings() {
  const { networkId } = useNetwork();
  const [user, authLoading] = useAuthState(auth);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  
  const [newInviteCode, setNewInviteCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !networkId) {
      setChecking(false);
      return;
    }

    const checkAdmin = async () => {
      const adminDoc = await getDoc(doc(db, `networks/${networkId}/admins`, user.uid));
      if (adminDoc.exists()) {
        setIsAdmin(true);
        fetchNetworkData();
      }
      setChecking(false);
    };

    const fetchNetworkData = async () => {
      const netDoc = await getDoc(doc(db, 'networks', networkId));
      if (netDoc.exists()) {
        const data = netDoc.data() as NetworkData;
        setNetworkData(data);
        setNewInviteCode(data.inviteCode);
      }
    };

    checkAdmin();
    
    // Listen to members
    const unsubMembers = onSnapshot(collection(db, `networks/${networkId}/members`), (snap) => {
      const m = snap.docs.map(d => ({ id: d.id, ...d.data() } as Member));
      setMembers(m);
    });

    return () => unsubMembers();
  }, [user, networkId, authLoading]);

  const handleUpdateCode = async () => {
    if (!networkId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'networks', networkId), {
        inviteCode: newInviteCode.toUpperCase().replace(/\s/g, '')
      });
      setMessage("Invite code updated successfully.");
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!networkId || !window.confirm("Remove this member from the network?")) return;
    try {
      await deleteDoc(doc(db, `networks/${networkId}/members`, memberId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !networkId) return;
    
    setUploadingLogo(true);
    try {
      const publicUrl = await uploadFileToR2(file);
      await updateDoc(doc(db, 'networks', networkId), {
        logoUrl: publicUrl
      });
      setNetworkData(prev => prev ? { ...prev, logoUrl: publicUrl } : null);
      setMessage("Logo updated successfully.");
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingLogo(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleThemeChange = async (theme: string) => {
    if (!networkId) return;
    try {
      await updateDoc(doc(db, 'networks', networkId), { theme });
      setNetworkData(prev => prev ? { ...prev, theme } : null);
      setMessage("Theme updated successfully.");
      setTimeout(() => setMessage(''), 3000);
      
      // Update locally for immediate effect
      document.documentElement.className = theme === 'dark' ? '' : `theme-${theme}`;
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (checking || authLoading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-brand-magenta w-8 h-8" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto mt-20 p-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-center">
        <Shield className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-red-400">You do not have administrative privileges for this network.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white flex items-center gap-3">
          <Settings className="text-brand-magenta" size={36} /> Network Settings
        </h1>
        <p className="text-brand-highlight mt-2 uppercase tracking-widest text-sm font-bold">Manage {networkData?.name}</p>
      </div>

      {message && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center gap-2 font-bold">
          <Check size={20} /> {message}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Network Details */}
        <div className="bg-brand-black/40 border border-white/10 p-6 rounded-[2rem]">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Key className="text-brand-pink" /> Access Control</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-brand-highlight uppercase tracking-widest ml-1 mb-2 block">Secret Invite Code</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newInviteCode} 
                  onChange={(e) => setNewInviteCode(e.target.value.toUpperCase())}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-magenta/50 font-mono"
                />
                <button 
                  onClick={handleUpdateCode}
                  disabled={saving || newInviteCode === networkData?.inviteCode}
                  className="px-4 bg-brand-magenta hover:bg-brand-pink disabled:opacity-50 text-white rounded-xl font-bold transition-all"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : 'Save'}
                </button>
              </div>
              <p className="text-[10px] text-brand-highlight mt-2 ml-1">Change this code if you need to revoke access for new joiners.</p>
            </div>
            
            <div className="pt-4 border-t border-white/10 mt-6">
              <label className="text-xs font-bold text-brand-highlight uppercase tracking-widest ml-1 mb-2 block">Current Plan</label>
              <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold inline-block">
                {networkData?.plan || 'Unknown'}
              </div>
            </div>
          </div>
        </div>

        {/* Member Management */}
        <div className="bg-brand-black/40 border border-white/10 p-6 rounded-[2rem]">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Users className="text-purple-500" /> Members ({members.length})</h2>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {members.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div>
                  <p className="font-bold text-white text-sm">{member.displayName}</p>
                  <p className="text-xs text-brand-highlight">{member.email}</p>
                </div>
                {member.role === 'admin' ? (
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-magenta px-2 py-1 bg-brand-magenta/10 rounded-md">Admin</span>
                ) : (
                  <button 
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-2 text-brand-highlight hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Remove User"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Branding Details */}
      <div className="bg-brand-black/40 border border-white/10 p-6 rounded-[2rem]">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><ImageIcon className="text-brand-magenta" /> Branding & Logo</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-brand-highlight uppercase tracking-widest ml-1 mb-2 block">Network Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 relative">
                {networkData?.logoUrl ? (
                  <img src={networkData.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <ImageIcon className="text-brand-highlight/30" size={32} />
                )}
                {uploadingLogo && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div>
                <input 
                  type="file" 
                  id="logo-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleLogoUpload} 
                  disabled={uploadingLogo}
                />
                <label 
                  htmlFor="logo-upload"
                  className="px-4 py-2 bg-brand-magenta hover:bg-brand-pink text-white rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer w-fit"
                >
                  <Upload size={16} /> {uploadingLogo ? 'Uploading...' : 'Upload New Logo'}
                </label>
                <p className="text-[10px] text-brand-highlight mt-2">Recommended size: 500x500px (PNG or SVG). Used on the Landing Page.</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-white/10 mt-6">
            <label className="text-xs font-bold text-brand-highlight uppercase tracking-widest ml-1 mb-2 block">Network Theme</label>
            <select 
              value={networkData?.theme || 'dark'} 
              onChange={(e) => handleThemeChange(e.target.value)}
              className="w-full md:w-1/2 px-4 py-3 bg-brand-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-brand-magenta/50 appearance-none"
            >
              <option value="dark">Default Dark (Magenta/Plum)</option>
              <option value="light">Light Mode (White/Indigo)</option>
              <option value="premium">Premium Dark (Slate/Gold)</option>
            </select>
            <p className="text-[10px] text-brand-highlight mt-2 ml-1">This theme will be applied to all users in the network.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
