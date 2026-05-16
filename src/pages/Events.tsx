import React, { useState, useEffect } from 'react';
import { Calendar as CalIcon, MapPin, ExternalLink, Plus, X, Loader2, Trash2, Clock, Trophy, Users, Terminal, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, Timestamp, where } from 'firebase/firestore';
import { useStore } from '../lib/store';
import { useAuthState } from 'react-firebase-hooks/auth';
import { uploadFileToR2 } from '../lib/storage';

interface Event {
  id: string;
  title: string;
  description: string;
  date: any; // Firestore Timestamp
  location: string;
  category: string;
  imageUrl?: string;
  registerUrl?: string;
  addedBy: string;
  createdAt: any;
}

const CATEGORIES = [
  { id: 'coding', label: 'CP Contest', icon: Terminal },
  { id: 'business', label: 'Business Case', icon: Trophy },
  { id: 'robotics', label: 'Robotics', icon: Users },
  { id: 'seminar', label: 'Seminar/Workshop', icon: Users },
];

export default function Events() {
  const [user] = useAuthState(auth);
  const { events, eventsLoaded, fetchEvents } = useStore();
  const loading = !eventsLoaded;
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('coding');
  const [registerUrl, setRegisterUrl] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUploading(true);

    try {
      let imageUrl = '';
      if (image) {
        imageUrl = await uploadFileToR2(image);
      }

      await addDoc(collection(db, 'events'), {
        title,
        description,
        date: Timestamp.fromDate(new Date(date)),
        location,
        category,
        imageUrl,
        registerUrl,
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
    setTitle('');
    setDescription('');
    setDate('');
    setLocation('');
    setCategory('coding');
    setRegisterUrl('');
    setImage(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this event?")) return;
    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (ts: any) => {
    const d = ts.toDate();
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight font-display">Campus Events</h1>
          <p className="text-brand-highlight/60 mt-2 font-medium">Competitions, workshops, and student activities</p>
        </div>
        
        {user && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-8 py-3 bg-brand-magenta hover:bg-brand-pink text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-brand-magenta/20 uppercase tracking-widest"
          >
            <Plus size={18} /> Organize Event
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-12 h-12 text-brand-magenta animate-spin" />
          <p className="text-[10px] font-black text-brand-highlight/40 uppercase tracking-widest">Loading Timeline...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-brand-magenta/10 rounded-[3rem]">
          <CalIcon size={48} className="mx-auto text-brand-magenta/20 mb-4" />
          <p className="text-brand-highlight/30 font-bold italic">No upcoming events scheduled.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {events.map((event) => {
            const CatIcon = CATEGORIES.find(c => c.id === event.category)?.icon || CalIcon;
            return (
              <div key={event.id} className="group relative bg-brand-plum/10 backdrop-blur-2xl border border-brand-magenta/10 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all hover:border-brand-pink/30 flex flex-col md:flex-row">
                {event.imageUrl ? (
                  <div className="w-full md:w-64 shrink-0 relative overflow-hidden">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-brand-black/20" />
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-brand-plum/10 to-transparent hidden md:block" />
                  </div>
                ) : (
                  <div className="w-full md:w-48 bg-brand-magenta/20 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-brand-magenta/10 shrink-0">
                    <span className="text-sm font-black text-brand-highlight uppercase tracking-[0.2em] mb-1">{event.date.toDate().toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="text-4xl font-black text-white leading-none">{event.date.toDate().getDate()}</span>
                    <span className="text-sm font-black text-brand-pink uppercase tracking-[0.2em] mt-1">{event.date.toDate().toLocaleDateString('en-US', { month: 'short' })}</span>
                  </div>
                )}

                <div className="flex-1 p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-4 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        {event.imageUrl && (
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-[10px] font-black text-brand-highlight uppercase tracking-widest">{event.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                             <span className="w-1 h-1 bg-brand-magenta rounded-full" />
                           </div>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-brand-magenta/10 text-brand-pink rounded-lg">
                            <CatIcon size={14} />
                          </div>
                          <span className="text-[10px] font-black text-brand-highlight uppercase tracking-widest">{CATEGORIES.find(c => c.id === event.category)?.label}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white group-hover:text-brand-highlight transition-colors">{event.title}</h3>
                      <p className="text-sm text-white/50 leading-relaxed font-medium">{event.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-6 pt-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                        <Clock size={14} className="text-brand-pink" />
                        {event.date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                        <MapPin size={14} className="text-brand-pink" />
                        {event.location}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {event.registerUrl && (
                      <a href={event.registerUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-brand-magenta hover:bg-brand-pink text-white rounded-2xl font-black text-xs transition-all shadow-xl shadow-brand-magenta/20 uppercase tracking-widest flex items-center gap-2">
                        Register <ExternalLink size={14} />
                      </a>
                    )}
                    {user?.uid === event.addedBy && (
                      <button onClick={() => handleDelete(event.id)} className="p-3 bg-brand-black/40 text-white/20 hover:text-red-400 rounded-xl transition-all">
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-brand-plum/40 backdrop-blur-3xl border border-brand-magenta/20 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 max-h-[85dvh] overflow-y-auto">
            <div className="p-5 md:p-8 border-b border-brand-magenta/10 flex items-center justify-between sticky top-0 bg-brand-plum/10 backdrop-blur-3xl z-10">
              <h3 className="text-2xl font-bold text-white tracking-tight">Organize Event</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-brand-magenta/10 rounded-full text-brand-highlight/40 hover:text-white transition-all"><X size={24} /></button>
            </div>

            <form onSubmit={handleAddEvent} className="p-5 md:p-8 space-y-6">
              <div className="space-y-4">
                <div className="relative h-48 rounded-3xl overflow-hidden bg-brand-black/40 border border-brand-magenta/20 flex flex-col items-center justify-center group/upload cursor-pointer">
                  {image ? (
                    <img src={URL.createObjectURL(image)} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <ImageIcon size={48} className="text-brand-magenta/20 mb-2 group-hover/upload:scale-110 transition-transform" />
                      <p className="text-[10px] font-black text-brand-highlight/40 uppercase tracking-widest">Upload Event Banner</p>
                    </>
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Event Title</label>
                  <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. CUET Hackathon 2024" className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all appearance-none">
                    {CATEGORIES.map(cat => <option key={cat.id} value={cat.id} className="bg-brand-plum">{cat.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Date & Time</label>
                  <input required type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Location / Room</label>
                  <input required type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. CSE Seminar Library" className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Description</label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the event goals and requirements..." className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Registration Link (Optional)</label>
                <input type="url" value={registerUrl} onChange={(e) => setRegisterUrl(e.target.value)} placeholder="https://google.form/..." className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
              </div>

              <button disabled={uploading} type="submit" className="w-full bg-brand-magenta text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-magenta/20 hover:bg-brand-pink transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2">
                {uploading ? <Loader2 className="animate-spin" /> : "Publish Event"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
