import React, { useState, useEffect } from 'react';
import { Bell, Megaphone, Plus, X, Loader2, Trash2, Calendar, Tag, AlertCircle, ExternalLink, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { useStore } from '../lib/store';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNetwork } from '../lib/network-context';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'academic' | 'exam' | 'event' | 'general';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  link?: string;
  addedBy: string;
  createdAt: any;
}

const CATEGORIES = {
  academic: { label: 'Academic', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  exam: { label: 'Examination', color: 'text-red-400', bg: 'bg-red-500/10' },
  event: { label: 'Event', color: 'text-brand-pink', bg: 'bg-brand-pink/10' },
  general: { label: 'General', color: 'text-brand-highlight', bg: 'bg-brand-highlight/10' }
};

const PRIORITIES = {
  low: { label: 'Normal', color: 'text-white/40' },
  normal: { label: 'Important', color: 'text-brand-highlight' },
  high: { label: 'High Priority', color: 'text-brand-pink' },
  urgent: { label: 'Urgent', color: 'text-red-500' }
};

export default function Notices() {
  const [user] = useAuthState(auth);
  const { notices, noticesLoaded, fetchNotices } = useStore();
  const loading = !noticesLoaded;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { networkId } = useNetwork();

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Notice['category']>('general');
  const [priority, setPriority] = useState<Notice['priority']>('normal');
  const [link, setLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (networkId) fetchNotices(networkId);
  }, [fetchNotices, networkId]);

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, `networks/${networkId}/notices`), {
        title,
        content,
        category,
        priority,
        link,
        addedBy: user.uid,
        createdAt: Timestamp.now(),
      });

      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('general');
    setPriority('normal');
    setLink('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this notice?")) return;
    try {
      await deleteDoc(doc(db, `networks/${networkId}/notices`, id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-brand-magenta/10 rounded-[2rem] text-brand-magenta">
            <Bell size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight font-display">Notice Board</h1>
            <p className="text-brand-highlight/60 mt-1 font-medium italic">Official announcements and academic updates</p>
          </div>
        </div>
        
        {user && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-8 py-3 bg-brand-magenta hover:bg-brand-pink text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-brand-magenta/20 uppercase tracking-widest active:scale-95"
          >
            <Plus size={18} /> Post Notice
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-12 h-12 text-brand-magenta animate-spin" />
          <p className="text-[10px] font-black text-brand-highlight/40 uppercase tracking-widest">Updating Board...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-brand-magenta/10 rounded-[3rem]">
          <Megaphone size={48} className="mx-auto text-brand-magenta/20 mb-4" />
          <p className="text-brand-highlight/30 font-bold italic">The board is currently clear.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {notices.map((notice) => (
            <div 
              key={notice.id} 
              className={cn(
                "group relative bg-brand-plum/10 backdrop-blur-2xl border rounded-[2.5rem] overflow-hidden shadow-2xl transition-all p-8 flex flex-col md:flex-row gap-8",
                notice.priority === 'urgent' ? "border-red-500/30 bg-red-500/[0.03]" : "border-brand-magenta/10 hover:border-brand-pink/30"
              )}
            >
              {notice.priority === 'urgent' && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />
              )}

              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest", CATEGORIES[notice.category].bg, CATEGORIES[notice.category].color)}>
                    {CATEGORIES[notice.category].label}
                  </span>
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", PRIORITIES[notice.priority].color)}>
                    {notice.priority === 'urgent' && <ShieldAlert size={12} className="inline mr-1" />}
                    {PRIORITIES[notice.priority].label}
                  </span>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} />
                    {notice.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white group-hover:text-brand-highlight transition-colors">{notice.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed font-medium whitespace-pre-wrap">{notice.content}</p>
                </div>

                {notice.link && (
                  <a 
                    href={notice.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-magenta/10 hover:bg-brand-magenta/20 text-brand-pink rounded-xl text-xs font-bold transition-all border border-brand-magenta/5 active:scale-95"
                  >
                    View Resource <ExternalLink size={14} />
                  </a>
                )}
              </div>

              {user?.uid === notice.addedBy && (
                <button 
                  onClick={() => handleDelete(notice.id)}
                  className="self-start p-3 bg-brand-black/40 text-white/20 hover:text-red-400 rounded-xl transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Notice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-md" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-brand-plum/40 backdrop-blur-3xl border border-brand-magenta/20 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 max-h-[85dvh] overflow-y-auto">
            <div className="p-5 md:p-8 border-b border-brand-magenta/10 flex items-center justify-between sticky top-0 bg-brand-plum/10 backdrop-blur-3xl z-10">
              <h3 className="text-2xl font-bold text-white tracking-tight">Post New Notice</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-brand-magenta/10 rounded-full text-brand-highlight/40 hover:text-white transition-all"><X size={24} /></button>
            </div>

            <form onSubmit={handleAddNotice} className="p-5 md:p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Notice Title</label>
                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Schedule for Class Test 2" className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all appearance-none">
                    {Object.entries(CATEGORIES).map(([id, cat]) => <option key={id} value={id} className="bg-brand-plum">{cat.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Priority Level</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all appearance-none">
                    {Object.entries(PRIORITIES).map(([id, p]) => <option key={id} value={id} className="bg-brand-plum">{p.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Announcement Content</label>
                <textarea required value={content} onChange={(e) => setContent(e.target.value)} rows={5} placeholder="Provide all necessary details here..." className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Reference Link (Optional)</label>
                <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full bg-brand-magenta text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-magenta/20 hover:bg-brand-pink transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Post Announcement"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
