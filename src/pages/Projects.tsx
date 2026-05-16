import React, { useState, useEffect } from 'react';
import { Plus, Github, ExternalLink, Users, Image as ImageIcon, X, Loader2, Trash2, Globe, Code } from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { useStore } from '../lib/store';
import { useAuthState } from 'react-firebase-hooks/auth';
import { uploadFileToR2 } from '../lib/storage';

interface Project {
  id: string;
  title: string;
  description: string;
  team: string;
  githubUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
  addedBy: string;
  createdAt: any;
}

export default function Projects() {
  const [user] = useAuthState(auth);
  const { projects, projectsLoaded, fetchProjects } = useStore();
  const loading = !projectsLoaded;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [team, setTeam] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUploading(true);

    try {
      let imageUrl = '';
      if (image) {
        imageUrl = await uploadFileToR2(image);
      }

      await addDoc(collection(db, 'projects'), {
        title,
        description,
        team,
        githubUrl,
        demoUrl,
        imageUrl,
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
    setTeam('');
    setGithubUrl('');
    setDemoUrl('');
    setImage(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this project from the showcase?")) return;
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight font-display">Projects Showcase</h1>
          <p className="text-brand-highlight/60 mt-2 font-medium">Innovation and engineering excellence from CSE-25</p>
        </div>
        
        {user && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-8 py-3 bg-brand-magenta hover:bg-brand-pink text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-brand-magenta/20 uppercase tracking-widest"
          >
            <Plus size={18} /> Submit Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-12 h-12 text-brand-magenta animate-spin" />
          <p className="text-[10px] font-black text-brand-highlight/40 uppercase tracking-widest">Building Gallery...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-brand-magenta/10 rounded-[3rem]">
          <Code size={48} className="mx-auto text-brand-magenta/20 mb-4" />
          <p className="text-brand-highlight/30 font-bold italic">No projects have been showcased yet. Be the first!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div key={project.id} className="group relative bg-brand-plum/10 backdrop-blur-2xl border border-brand-magenta/10 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all hover:translate-y-[-8px] hover:border-brand-pink/30">
              <div className="aspect-video relative overflow-hidden bg-brand-black/40">
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-magenta/20">
                    <ImageIcon size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent opacity-60" />
                
                {user?.uid === project.addedBy && (
                  <button onClick={() => handleDelete(project.id)} className="absolute top-4 right-4 p-2 bg-brand-black/60 text-white/40 hover:text-red-400 rounded-xl backdrop-blur-md transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="p-8 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-highlight transition-colors">{project.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-black text-brand-pink uppercase tracking-widest">
                    <Users size={12} />
                    <span>{project.team}</span>
                  </div>
                </div>

                <p className="text-sm text-white/50 leading-relaxed line-clamp-3 font-medium">
                  {project.description}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-brand-black/40 hover:bg-brand-magenta/20 text-white/60 hover:text-brand-pink rounded-xl text-xs font-bold border border-brand-magenta/10 transition-all">
                      <Github size={14} /> Code
                    </a>
                  )}
                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-brand-magenta/20 hover:bg-brand-magenta text-brand-highlight rounded-xl text-xs font-bold transition-all">
                      <ExternalLink size={14} /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-md" onClick={() => !uploading && setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-brand-plum/40 backdrop-blur-3xl border border-brand-magenta/20 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 max-h-[85dvh] overflow-y-auto">
            <div className="p-5 md:p-8 border-b border-brand-magenta/10 flex items-center justify-between sticky top-0 bg-brand-plum/10 backdrop-blur-3xl z-10">
              <h3 className="text-2xl font-bold text-white tracking-tight">Submit Project</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-brand-magenta/10 rounded-full text-brand-highlight/40 hover:text-white transition-all"><X size={24} /></button>
            </div>

            <form onSubmit={handleAddProject} className="p-5 md:p-8 space-y-6">
              <div className="space-y-4">
                <div className="relative aspect-video rounded-3xl overflow-hidden bg-brand-black/40 border border-brand-magenta/20 flex flex-col items-center justify-center group/upload cursor-pointer">
                  {image ? (
                    <img src={URL.createObjectURL(image)} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <ImageIcon size={48} className="text-brand-magenta/20 mb-2 group-hover/upload:scale-110 transition-transform" />
                      <p className="text-[10px] font-black text-brand-highlight/40 uppercase tracking-widest">Upload Project Photo</p>
                    </>
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Project Title</label>
                  <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Team Members</label>
                  <input required type="text" value={team} onChange={(e) => setTeam(e.target.value)} placeholder="e.g. Alex, Sarah, Mike" className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Description</label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all resize-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Github URL (Optional)</label>
                  <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Live Demo URL (Optional)</label>
                  <input type="url" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
                </div>
              </div>

              <button disabled={uploading} type="submit" className="w-full bg-brand-magenta text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-magenta/20 hover:bg-brand-pink transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2">
                {uploading ? <Loader2 className="animate-spin" /> : "Deploy to Showcase"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
