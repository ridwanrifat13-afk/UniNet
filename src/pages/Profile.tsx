import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Edit3, Link as LinkIcon, FileText, Lock, ChevronRight, Loader2, X, Plus, Trash2, Camera, Globe, Github } from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useParams } from 'react-router-dom';
import { uploadFileToR2 } from '../lib/storage';

interface UserProfile {
  displayName: string;
  email: string;
  bio?: string;
  photoURL?: string;
  batch?: string;
  department?: string;
  phone?: string;
  github?: string;
  website?: string;
  links?: { label: string, url: string }[];
  repository: any[];
}

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const targetUid = id || user?.uid;
  const isOwnProfile = !id || (user && id === user.uid);

  // Form State
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editBatch, setEditBatch] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editLinks, setEditLinks] = useState<{ label: string, url: string }[]>([]);

  useEffect(() => {
    if (!targetUid) return;

    const unsub = onSnapshot(doc(db, 'profiles', targetUid), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        setProfile(data);
        if (isOwnProfile) {
          setEditName(data.displayName || user?.displayName || '');
          setEditBio(data.bio || '');
          setEditBatch(data.batch || '');
          setEditDept(data.department || '');
          setEditPhone(data.phone || '');
          setEditGithub(data.github || '');
          setEditWebsite(data.website || '');
          setEditLinks(data.links || []);
        }
      } else if (isOwnProfile && user) {
        const initialData = {
          displayName: user.displayName || '',
          email: user.email,
          repository: []
        };
        setDoc(doc(db, 'profiles', user.uid), initialData);
      } else {
        setDbError("Profile not found or access denied.");
      }
      setLoading(false);
    }, (error) => {
      console.error("Profile Error:", error);
      setDbError(`Firestore Error: ${error.code} - ${error.message}`);
      setLoading(false);
    });

    return () => unsub();
  }, [targetUid, isOwnProfile, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      await updateDoc(doc(db, 'profiles', user.uid), {
        displayName: editName,
        bio: editBio,
        batch: editBatch,
        department: editDept,
        phone: editPhone,
        github: editGithub,
        website: editWebsite,
        links: editLinks
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const url = await uploadFileToR2(file);
      await updateDoc(doc(db, 'profiles', user.uid), { photoURL: url });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const url = await uploadFileToR2(file);
      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        url: url,
        type: 'Public', // Default
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
      await updateDoc(doc(db, 'profiles', user.uid), {
        repository: arrayUnion(newFile)
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async (file: any) => {
    if (!user || !window.confirm("Remove this file from your repository?")) return;
    try {
      await updateDoc(doc(db, 'profiles', user.uid), {
        repository: arrayRemove(file)
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-12 text-brand-magenta animate-spin" />
        <p className="text-[10px] font-black text-brand-highlight/40 uppercase tracking-[0.3em]">Syncing Neural Profile...</p>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="max-w-4xl mx-auto p-12 bg-red-500/5 border border-red-500/20 rounded-[2.5rem] text-center space-y-4 animate-in fade-in">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
          <Lock className="text-red-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Database Access Denied</h3>
          <p className="text-sm text-white/40 max-w-sm mx-auto">{dbError}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-brand-magenta text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-brand-pink"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="relative group">
        <div className="absolute inset-0 bg-brand-magenta/5 rounded-[2.5rem] blur-3xl group-hover:bg-brand-magenta/10 transition-all duration-700" />
        
        <div className="relative bg-brand-plum/10 backdrop-blur-3xl rounded-[2.5rem] border border-brand-magenta/10 overflow-hidden shadow-2xl">
          {/* Cover image */}
          <div className="h-40 bg-gradient-to-br from-brand-magenta/40 via-brand-pink/20 to-transparent relative">
            <div className="absolute inset-0 bg-brand-black/20" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-brand-plum/40 to-transparent" />
          </div>
          
          <div className="px-8 sm:px-12 pb-12 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-10">
              <div className="flex items-end gap-6">
                <div className="relative group/avatar">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 bg-brand-black/40 rounded-3xl p-1.5 shadow-2xl border border-brand-magenta/20 backdrop-blur-xl overflow-hidden">
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <div className="w-full h-full bg-brand-magenta/10 rounded-2xl flex items-center justify-center font-bold text-5xl text-brand-highlight tracking-tighter">
                        {editName.substring(0, 2).toUpperCase() || '??'}
                      </div>
                    )}
                  </div>
                  {isOwnProfile && (
                    <label className="absolute inset-0 flex items-center justify-center bg-brand-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
                      {uploading ? <Loader2 className="animate-spin text-white" /> : <Camera className="text-white" />}
                    </label>
                  )}
                </div>
                <div className="pb-4">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-display">{profile?.displayName || 'Anonymous'}</h1>
                  <div className="flex items-center gap-2 mt-2 text-brand-highlight font-black uppercase tracking-widest text-[10px]">
                    <span className="px-2 py-0.5 bg-brand-magenta/30 rounded-md">Batch {profile?.batch || 'N/A'}</span>
                    <span className="w-1 h-1 bg-brand-pink/50 rounded-full" />
                    <span>{profile?.department || 'Member'}</span>
                  </div>
                </div>
              </div>
              
              {isOwnProfile && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-magenta hover:bg-brand-pink text-white rounded-2xl font-bold transition-all text-sm shadow-xl shadow-brand-magenta/20 self-start sm:self-auto mb-2 active:scale-95"
                >
                  <Edit3 size={18} />
                  Edit Account
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="md:col-span-1 space-y-8">
                <div>
                  <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-brand-pink rounded-full" />
                    Bio
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed font-medium">
                    {profile?.bio || 'No bio yet. Tell the community about yourself!'}
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: Mail, value: profile?.email, isLink: false },
                    { icon: Phone, value: profile?.phone, isLink: false },
                    { icon: Github, value: profile?.github, isLink: true, prefix: 'https://github.com/' },
                    { icon: Globe, value: profile?.website, isLink: true },
                    ...(profile?.links || []).map(link => ({
                      icon: LinkIcon,
                      value: link.url,
                      label: link.label,
                      isLink: true
                    }))
                  ].filter(item => item.value).map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-sm font-medium group/link">
                      <div className="w-8 h-8 rounded-lg bg-brand-magenta/10 flex items-center justify-center text-brand-pink/60 group-hover/link:text-brand-pink transition-colors">
                        <item.icon size={16} />
                      </div>
                      {item.isLink ? (
                        <a href={item.prefix ? `${item.prefix}${item.value}` : (item.value?.startsWith('http') ? item.value : `https://${item.value}`)} target="_blank" rel="noopener noreferrer" className="text-brand-pink hover:text-brand-highlight transition-colors underline decoration-brand-pink/30 underline-offset-4 truncate max-w-[150px]">
                          {'label' in item ? item.label : item.value}
                        </a>
                      ) : (
                        <span className="text-white/50 truncate max-w-[150px]">{item.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 space-y-8">
                <div className="bg-brand-black/20 border border-brand-magenta/10 rounded-3xl overflow-hidden shadow-inner">
                  <div className="px-6 py-4 flex items-center justify-between border-b border-brand-magenta/5 bg-brand-black/20">
                    <h3 className="font-bold text-white tracking-wide">Academic Repository</h3>
                    {isOwnProfile && (
                      <label className="text-[10px] font-black text-brand-pink hover:text-brand-highlight uppercase tracking-widest px-3 py-1 bg-brand-magenta/10 rounded-lg transition-all cursor-pointer">
                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                        {uploading ? 'Uploading...' : 'Upload New'}
                      </label>
                    )}
                  </div>
                  
                  <div className="divide-y divide-brand-magenta/5">
                    {profile?.repository?.length === 0 ? (
                      <div className="p-12 text-center text-white/20 italic text-sm">No files uploaded yet.</div>
                    ) : (
                      profile?.repository?.map((doc, i) => (
                        <div key={doc.id} className="flex items-center justify-between p-5 hover:bg-brand-magenta/5 transition-all group/doc">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 flex-1">
                            <div className="p-3 bg-brand-magenta/10 text-brand-pink rounded-xl group-hover/doc:scale-110 transition-transform">
                              <FileText size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white group-hover/doc:text-brand-highlight transition-colors">{doc.name}</p>
                              <p className="text-[10px] font-bold text-brand-pink/30 uppercase mt-1">Added {doc.date}</p>
                            </div>
                          </a>
                          
                          <div className="flex items-center gap-4">
                            {isOwnProfile && (
                              <button onClick={() => removeFile(doc)} className="p-2 text-white/10 hover:text-red-400 transition-colors">
                                <Trash2 size={16} />
                              </button>
                            )}
                            <ChevronRight size={18} className="text-brand-pink/0 group-hover/doc:text-brand-pink group-hover/doc:translate-x-1 transition-all" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-md" onClick={() => setIsEditing(false)} />
          <div className="relative w-full max-w-2xl bg-brand-plum/40 backdrop-blur-3xl border border-brand-magenta/20 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 max-h-[85dvh] overflow-y-auto">
            <div className="p-5 md:p-8 border-b border-brand-magenta/10 flex items-center justify-between sticky top-0 bg-brand-plum/10 backdrop-blur-3xl z-10">
              <h3 className="text-2xl font-bold text-white tracking-tight">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-brand-magenta/10 rounded-full text-brand-highlight/40 hover:text-white transition-all"><X size={24} /></button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-5 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Full Name</label>
                  <input required type="text" value={editName} onChange={(e) => setEditName(e.target.value)} autoComplete="name" className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white outline-none focus:ring-2 focus:ring-brand-pink/40 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Batch (e.g. 2022)</label>
                  <input type="text" inputMode="numeric" value={editBatch} onChange={(e) => setEditBatch(e.target.value)} className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white outline-none focus:ring-2 focus:ring-brand-pink/40 transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Department</label>
                <input type="text" value={editDept} onChange={(e) => setEditDept(e.target.value)} className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white outline-none focus:ring-2 focus:ring-brand-pink/40 transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Bio</label>
                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3} className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white outline-none focus:ring-2 focus:ring-brand-pink/40 transition-all resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Phone Number</label>
                <input type="tel" inputMode="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} autoComplete="tel" className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white outline-none focus:ring-2 focus:ring-brand-pink/40 transition-all" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">GitHub Username</label>
                  <div className="flex bg-brand-black/40 border border-brand-magenta/30 rounded-2xl focus-within:ring-2 focus-within:ring-brand-pink/40 transition-all overflow-hidden">
                    <div className="px-5 py-3.5 bg-brand-black/60 text-white/40 border-r border-brand-magenta/10 text-sm">github.com/</div>
                    <input type="text" value={editGithub} onChange={(e) => setEditGithub(e.target.value)} className="w-full px-4 py-3.5 bg-transparent text-white outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Portfolio/Website</label>
                  <input type="url" value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} placeholder="https://..." className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white outline-none focus:ring-2 focus:ring-brand-pink/40 transition-all" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Connect Your Socials / Links</label>
                <div className="space-y-3">
                  {editLinks.map((link, index) => (
                    <div key={index} className="flex gap-3 animate-in slide-in-from-left-2">
                      <input 
                        type="text" 
                        value={link.label} 
                        onChange={(e) => {
                          const newLinks = [...editLinks];
                          newLinks[index].label = e.target.value;
                          setEditLinks(newLinks);
                        }}
                        placeholder="Label (e.g. Portfolio)"
                        className="flex-1 px-4 py-3 bg-brand-black/40 border border-brand-magenta/20 rounded-xl text-white text-xs focus:ring-1 focus:ring-brand-pink/40 outline-none" 
                      />
                      <input 
                        type="url" 
                        inputMode="url"
                        value={link.url} 
                        onChange={(e) => {
                          const newLinks = [...editLinks];
                          newLinks[index].url = e.target.value;
                          setEditLinks(newLinks);
                        }}
                        placeholder="https://..."
                        className="flex-[2] px-4 py-3 bg-brand-black/40 border border-brand-magenta/20 rounded-xl text-white text-xs focus:ring-1 focus:ring-brand-pink/40 outline-none" 
                      />
                      <button 
                        type="button"
                        onClick={() => setEditLinks(editLinks.filter((_, i) => i !== index))}
                        className="p-3 text-red-400/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => setEditLinks([...editLinks, { label: '', url: '' }])}
                    className="w-full py-3 border border-dashed border-brand-magenta/20 rounded-xl text-[10px] font-black text-brand-highlight/40 uppercase tracking-widest hover:border-brand-magenta/40 hover:text-brand-highlight transition-all"
                  >
                    + Add New Link
                  </button>
                </div>
              </div>

              <button disabled={loading} type="submit" className="w-full bg-brand-magenta text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-magenta/20 hover:bg-brand-pink transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2 mt-4">
                {loading ? <Loader2 className="animate-spin" /> : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
