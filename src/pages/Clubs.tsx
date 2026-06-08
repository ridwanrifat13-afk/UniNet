import React, { useState, useEffect } from 'react';
import { Plus, Facebook, Linkedin, Globe, X, Loader2, Trash2, Users, Image as ImageIcon, ExternalLink, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { useStore } from '../lib/store';
import { useAuthState } from 'react-firebase-hooks/auth';
import { uploadFileToR2 } from '../lib/storage';
import { useNetwork } from '../lib/network-context';

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  bannerUrl?: string;
  fbUrl?: string;
  liUrl?: string;
  webUrl?: string;
  joinUrl?: string;
  addedBy: string;
  createdAt: any;
}

export default function Clubs() {
  const [user] = useAuthState(auth);
  const { clubs, clubsLoaded, fetchClubs } = useStore();
  const loading = !clubsLoaded;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { networkId } = useNetwork();

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [fbUrl, setFbUrl] = useState('');
  const [liUrl, setLiUrl] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [joinUrl, setJoinUrl] = useState('');
  const [banner, setBanner] = useState<File | null>(null);

  useEffect(() => {
    if (networkId) fetchClubs(networkId);
  }, [fetchClubs, networkId]);

  const handleAddClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !networkId) return;
    setUploading(true);

    try {
      let bannerUrl = '';
      if (banner) {
        bannerUrl = await uploadFileToR2(banner);
      }

      await addDoc(collection(db, `networks/${networkId}/clubs`), {
        name,
        description,
        category,
        fbUrl,
        liUrl,
        webUrl,
        joinUrl,
        bannerUrl,
        addedBy: user.uid,
        createdAt: Timestamp.now(),
      });

      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('');
    setFbUrl('');
    setLiUrl('');
    setWebUrl('');
    setJoinUrl('');
    setBanner(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this club from the directory?")) return;
    try {
      await deleteDoc(doc(db, `networks/${networkId}/clubs`, id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight font-display">Clubs & Societies</h1>
          <p className="text-brand-highlight/60 mt-2 font-medium">Join the most active student organizations in the network</p>
        </div>
        
        {user && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-8 py-3 bg-brand-magenta hover:bg-brand-pink text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-brand-magenta/20 uppercase tracking-widest"
          >
            <Plus size={18} /> Register Club
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-12 h-12 text-brand-magenta animate-spin" />
          <p className="text-[10px] font-black text-brand-highlight/40 uppercase tracking-widest">Scanning Organizations...</p>
        </div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-brand-magenta/10 rounded-[3rem]">
          <Users size={48} className="mx-auto text-brand-magenta/20 mb-4" />
          <p className="text-brand-highlight/30 font-bold italic">No clubs registered yet. Start a new legacy!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {clubs.map((club) => (
            <div key={club.id} className="group relative bg-brand-plum/10 backdrop-blur-2xl border border-brand-magenta/10 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all hover:border-brand-pink/30 flex flex-col">
              <div className="h-48 md:h-64 relative overflow-hidden bg-brand-black/40">
                {club.bannerUrl ? (
                  <img src={club.bannerUrl} alt={club.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-magenta/10 bg-gradient-to-br from-brand-magenta/5 to-transparent">
                    <ImageIcon size={64} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/20 to-transparent" />
                
                <div className="absolute bottom-6 left-8 right-8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-brand-magenta/30 backdrop-blur-md border border-brand-magenta/20 text-brand-highlight text-[10px] font-black uppercase tracking-widest rounded-lg">
                      {club.category || 'General'}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white group-hover:text-brand-highlight transition-colors">{club.name}</h3>
                </div>

                {user?.uid === club.addedBy && (
                  <button onClick={() => handleDelete(club.id)} className="absolute top-6 right-6 p-2.5 bg-brand-black/60 text-white/40 hover:text-red-400 rounded-xl backdrop-blur-md transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="p-8 flex flex-col flex-1 justify-between gap-8">
                <p className="text-sm text-white/50 leading-relaxed font-medium">
                  {club.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-brand-magenta/5">
                  <div className="flex items-center gap-4">
                    {club.fbUrl && (
                      <a href={club.fbUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-brand-magenta/10 text-brand-pink hover:text-brand-highlight hover:bg-brand-magenta/20 rounded-xl transition-all">
                        <Facebook size={18} />
                      </a>
                    )}
                    {club.liUrl && (
                      <a href={club.liUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-brand-magenta/10 text-brand-pink hover:text-brand-highlight hover:bg-brand-magenta/20 rounded-xl transition-all">
                        <Linkedin size={18} />
                      </a>
                    )}
                    {club.webUrl && (
                      <a href={club.webUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-brand-magenta/10 text-brand-pink hover:text-brand-highlight hover:bg-brand-magenta/20 rounded-xl transition-all">
                        <Globe size={18} />
                      </a>
                    )}
                  </div>

                  {club.joinUrl ? (
                    <a 
                      href={club.joinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 text-[10px] font-black text-brand-highlight uppercase tracking-[0.2em] group/join hover:text-white transition-all"
                    >
                      Join Community <ExternalLink size={12} className="group-hover/join:translate-x-1 group-hover/join:-translate-y-1 transition-transform" />
                    </a>
                  ) : (
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                      Community Invite Only
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Club Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-md" onClick={() => !uploading && setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-brand-plum/40 backdrop-blur-3xl border border-brand-magenta/20 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 max-h-[85dvh] overflow-y-auto">
            <div className="p-5 md:p-8 border-b border-brand-magenta/10 flex items-center justify-between sticky top-0 bg-brand-plum/10 backdrop-blur-3xl z-10">
              <h3 className="text-2xl font-bold text-white tracking-tight">Register Club</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-brand-magenta/10 rounded-full text-brand-highlight/40 hover:text-white transition-all"><X size={24} /></button>
            </div>

            <form onSubmit={handleAddClub} className="p-5 md:p-8 space-y-6">
              <div className="space-y-4">
                <div className="relative h-48 rounded-3xl overflow-hidden bg-brand-black/40 border border-brand-magenta/20 flex flex-col items-center justify-center group/upload cursor-pointer">
                  {banner ? (
                    <img src={URL.createObjectURL(banner)} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <ImageIcon size={48} className="text-brand-magenta/20 mb-2 group-hover/upload:scale-110 transition-transform" />
                      <p className="text-[10px] font-black text-brand-highlight/40 uppercase tracking-widest">Upload Official Banner</p>
                    </>
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => setBanner(e.target.files?.[0] || null)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Club Name</label>
                  <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Robotics Club" className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Category</label>
                  <input required type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Technology" className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">About the Club</label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Motto, goals, and membership info..." className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all resize-none" />
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Registration / Join Link</label>
                  <input type="url" value={joinUrl} onChange={(e) => setJoinUrl(e.target.value)} placeholder="e.g. https://bit.ly/join-club" className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Facebook URL</label>
                  <input type="url" value={fbUrl} onChange={(e) => setFbUrl(e.target.value)} className="w-full px-4 py-3 bg-brand-black/40 border border-brand-magenta/30 rounded-xl text-white text-xs focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">LinkedIn URL</label>
                  <input type="url" value={liUrl} onChange={(e) => setLiUrl(e.target.value)} className="w-full px-4 py-3 bg-brand-black/40 border border-brand-magenta/30 rounded-xl text-white text-xs focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Official Website</label>
                  <input type="url" value={webUrl} onChange={(e) => setWebUrl(e.target.value)} className="w-full px-4 py-3 bg-brand-black/40 border border-brand-magenta/30 rounded-xl text-white text-xs focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
                </div>
              </div>

              <button disabled={uploading} type="submit" className="w-full bg-brand-magenta text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-magenta/20 hover:bg-brand-pink transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2">
                {uploading ? <Loader2 className="animate-spin" /> : "Register Organization"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
