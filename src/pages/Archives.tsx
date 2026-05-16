import { Search, FolderOpen, FileText, Download, Filter, Plus, X, Globe, Loader2, Link as LinkIcon, Trash2, Hash, Menu } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { collection, addDoc, query, orderBy, Timestamp, deleteDoc, doc, limit } from 'firebase/firestore';
import { useStore } from '../lib/store';
import { db, auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface ArchiveDoc {
  id: string;
  title: string;
  url: string;
  batch: string;
  createdAt: any;
  addedBy: string;
}

const BATCH_GROUPS = [
  { id: 'all', name: 'All Resources', description: 'Everything in the archive' },
  { id: 'batch2021', name: 'Batch 2021', description: 'Docs for 2021 session' },
  { id: 'batch2022', name: 'Batch 2022', description: 'Docs for 2022 session' },
  { id: 'batch2023', name: 'Batch 2023', description: 'Docs for 2023 session' },
  { id: 'batch2024', name: 'Batch 2024', description: 'Docs for 2024 session' },
  { id: 'faculty', name: 'Faculty', description: 'Official departmental docs' },
  { id: 'general', name: 'General', description: 'Miscellaneous resources' },
];

export default function Archives() {
  const [user] = useAuthState(auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState(BATCH_GROUPS[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newBatch, setNewBatch] = useState('Batch 2022');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Firestore Data
  const { archives, archivesLoaded, fetchArchives } = useStore();
  const loading = !archivesLoaded;

  React.useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  // Filtering Logic
  const filteredArchives = archives.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = activeGroup.id === 'all' || doc.batch === activeGroup.name;
    return matchesSearch && matchesGroup;
  });

  const handleAddArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'archives'), {
        title: newTitle.trim(),
        url: newUrl.trim(),
        batch: newBatch.trim(),
        createdAt: Timestamp.now(),
        addedBy: user.uid
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewUrl('');
    } catch (err) {
      console.error(err);
      alert("Error adding document.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this resource?")) {
      try {
        await deleteDoc(doc(db, 'archives', id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex h-[calc(100dvh-6rem)] lg:h-[calc(100dvh-4rem)] bg-brand-plum/10 backdrop-blur-3xl border border-brand-magenta/30 rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-in fade-in duration-700">
      
      {/* Sidebar - Batch Groups */}
      <div className={cn(
        "absolute inset-y-0 left-0 z-50 w-64 bg-brand-black/95 md:bg-brand-black/40 backdrop-blur-3xl border-r border-brand-magenta/30 transform transition-transform duration-300 md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-brand-magenta/30 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Archives</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <div className="px-6 mb-2 text-[10px] font-black text-brand-highlight/40 uppercase tracking-[0.2em]">Categories</div>
          {BATCH_GROUPS.map((group) => (
            <div 
              key={group.id} 
              onClick={() => {
                setActiveGroup(group);
                setIsSidebarOpen(false);
              }}
              className={cn(
                "flex items-center gap-4 px-6 py-4 cursor-pointer transition-all border-b border-brand-magenta/5",
                activeGroup.id === group.id ? "bg-brand-magenta/20 border-l-4 border-l-brand-pink" : "hover:bg-brand-magenta/5 border-l-4 border-l-transparent"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
                activeGroup.id === group.id ? "bg-brand-magenta text-white shadow-lg shadow-brand-magenta/40" : "bg-brand-plum/40 text-brand-pink"
              )}>
                <Hash size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xs text-white uppercase tracking-widest">{group.name}</h3>
                <p className="text-[9px] font-medium text-white/30 truncate">{group.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-brand-black/10 relative">
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-brand-magenta/30 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-black/40">
           <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="md:hidden p-2.5 bg-brand-magenta/10 text-brand-pink rounded-xl active:scale-95 transition-all"
             >
               <Menu size={20} />
             </button>
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-brand-magenta text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                 {activeGroup.name.charAt(0).toUpperCase()}
               </div>
               <div>
                 <h2 className="font-bold text-white tracking-tight uppercase text-sm md:text-base">#{activeGroup.name}</h2>
                 <p className="text-[10px] font-black text-brand-highlight/60 uppercase tracking-widest">{filteredArchives.length} Resources</p>
               </div>
             </div>
           </div>

           <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative group flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-highlight/40 group-focus-within:text-brand-highlight" size={16} />
                <input 
                  type="text" 
                  placeholder="Filter Docs..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-brand-plum/30 border border-brand-magenta/20 rounded-xl text-xs text-white placeholder:text-brand-highlight/20 focus:outline-none focus:ring-2 focus:ring-brand-pink/40 transition-all w-full md:w-48"
                />
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="p-2.5 bg-brand-magenta text-white rounded-xl shadow-lg hover:bg-brand-pink transition-all active:scale-95 shrink-0"
              >
                <Plus size={20} />
              </button>
           </div>
        </div>

        {/* Archives Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
           {loading ? (
             <div className="flex flex-col items-center justify-center h-full space-y-4">
               <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
               <p className="text-[10px] font-black text-brand-highlight/40 uppercase tracking-widest">Accessing Vault...</p>
             </div>
           ) : filteredArchives.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-center opacity-20">
               <FolderOpen size={64} className="text-brand-magenta mb-4" />
               <p className="text-xl font-bold italic">No documents found here</p>
               <p className="text-xs uppercase tracking-widest mt-2">Try switching categories or searching</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArchives.map((item) => (
                  <div key={item.id} className="group relative">
                    <div className="absolute inset-0 bg-brand-magenta/5 rounded-3xl blur-xl group-hover:bg-brand-magenta/10 transition-all duration-500" />
                    
                    <div className="relative bg-brand-plum/20 backdrop-blur-xl border border-brand-magenta/10 rounded-3xl p-6 hover:border-brand-pink/30 transition-all duration-300 group-hover:-translate-y-1 h-full flex flex-col shadow-xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-brand-magenta/10 text-brand-pink rounded-2xl group-hover:scale-110 transition-transform">
                          <FileText size={24} />
                        </div>
                        <div className="flex items-center gap-2">
                           <a 
                             href={item.url} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="p-2 text-brand-highlight/40 hover:text-brand-highlight hover:bg-brand-magenta/20 rounded-xl transition-all"
                           >
                             <Globe size={18} />
                           </a>
                           {user?.uid === item.addedBy && (
                             <button 
                               onClick={() => handleDelete(item.id)}
                               className="p-2 text-red-400/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                             >
                               <Trash2 size={18} />
                             </button>
                           )}
                        </div>
                      </div>

                      <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-brand-highlight transition-colors flex-1">{item.title}</h3>
                      <div className="mt-2 mb-4">
                        <span className="px-3 py-1 bg-brand-magenta/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-brand-pink">
                          {item.batch}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-brand-magenta/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-pink/40">Reference Doc</span>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-highlight group-hover:text-white transition-colors active:scale-95"
                        >
                          View <Download size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-md" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-brand-plum/40 backdrop-blur-3xl border border-brand-magenta/20 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 max-h-[85dvh] overflow-y-auto">
            <div className="p-5 md:p-8 border-b border-brand-magenta/10 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white tracking-tight">Upload Doc</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-brand-magenta/10 rounded-full text-brand-highlight/40 hover:text-white transition-all"><X size={24} /></button>
            </div>

            <form onSubmit={handleAddArchive} className="p-5 md:p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Title</label>
                <input required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. OS Lecture 1" className="w-full px-5 py-4 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white outline-none focus:ring-2 focus:ring-brand-pink/40 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Link</label>
                <input required type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://..." className="w-full px-5 py-4 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white outline-none focus:ring-2 focus:ring-brand-pink/40 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Assign to Batch</label>
                <select value={newBatch} onChange={(e) => setNewBatch(e.target.value)} className="w-full px-5 py-4 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white outline-none focus:ring-2 focus:ring-brand-pink/40 transition-all appearance-none">
                  {BATCH_GROUPS.filter(g => g.id !== 'all').map(g => (
                    <option key={g.id} value={g.name} className="bg-brand-plum text-white">{g.name}</option>
                  ))}
                </select>
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full bg-brand-magenta text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-magenta/20 hover:bg-brand-pink transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2 active:scale-95">
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Publish to Vault"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
