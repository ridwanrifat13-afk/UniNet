import React, { useState, useEffect } from 'react';
import { Plus, X, Loader2, Image as ImageIcon, Camera } from 'lucide-react';
import InteractiveImageBentoGallery, { ImageItem } from "../components/ui/bento-gallery";
import { db, auth } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { useStore } from '../lib/store';
import { useAuthState } from 'react-firebase-hooks/auth';
import { uploadFileToR2 } from '../lib/storage';

const SPANS = [
  "md:col-span-2 md:row-span-2",
  "md:row-span-1",
  "md:row-span-1",
  "md:row-span-2",
  "md:row-span-1",
  "md:col-span-2 md:row-span-1"
];

export default function Gallery() {
  const [user] = useAuthState(auth);
  const { gallery: images, galleryLoaded, fetchGallery } = useStore();
  const loading = !galleryLoaded;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    console.log("Gallery useEffect running! Calling fetchGallery()");
    fetchGallery();
  }, [fetchGallery]);

  const mappedImages = images.map((img, index) => ({
    ...img,
    span: SPANS[index % SPANS.length]
  }));

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) return;
    setUploading(true);

    try {
      const url = await uploadFileToR2(file);

      await addDoc(collection(db, 'gallery'), {
        title,
        desc,
        url,
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
    setDesc('');
    setFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this memory?")) return;
    try {
      await deleteDoc(doc(db, 'gallery', id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-brand-magenta/10 rounded-[2rem] text-brand-magenta">
            <Camera size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight font-display">Campus Gallery</h1>
            <p className="text-brand-highlight/60 mt-1 font-medium italic">Capturing memorable moments together</p>
          </div>
        </div>

        {user && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-8 py-3 bg-brand-magenta hover:bg-brand-pink text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-brand-magenta/20 uppercase tracking-widest"
          >
            <Plus size={18} /> Add Memory
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-12 h-12 text-brand-magenta animate-spin" />
          <p className="text-[10px] font-black text-brand-highlight/40 uppercase tracking-widest">Opening Vault...</p>
        </div>
      ) : (
        <InteractiveImageBentoGallery
          imageItems={mappedImages}
          title="Curated Memories"
          description="A collection of stunning campus moments shared by our community. Drag horizontally to explore."
          onDelete={handleDelete}
          currentUserId={user?.uid}
        />
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-md" onClick={() => !uploading && setIsModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-brand-plum/40 backdrop-blur-3xl border border-brand-magenta/20 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 max-h-[85dvh] overflow-y-auto">
            <div className="p-5 md:p-8 border-b border-brand-magenta/10 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white tracking-tight">Upload New Memory</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-brand-magenta/10 rounded-full text-brand-highlight/40 hover:text-white transition-all"><X size={24} /></button>
            </div>

            <form onSubmit={handleUpload} className="p-5 md:p-8 space-y-6">
              <div className="relative h-64 rounded-3xl overflow-hidden bg-brand-black/40 border border-brand-magenta/20 flex flex-col items-center justify-center group/upload cursor-pointer">
                {file ? (
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <>
                    <ImageIcon size={48} className="text-brand-magenta/20 mb-2 group-hover/upload:scale-110 transition-transform" />
                    <p className="text-[10px] font-black text-brand-highlight/40 uppercase tracking-widest">Select Memorable Photo</p>
                  </>
                )}
                <input required type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Photo Title</label>
                  <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Freshers' Night 2024" className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Short Description</label>
                  <input required type="text" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="A quick story about this moment..." className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
                </div>
              </div>

              <button disabled={uploading || !file} type="submit" className="w-full bg-brand-magenta text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-magenta/20 hover:bg-brand-pink transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2">
                {uploading ? <Loader2 className="animate-spin" /> : "Save to Gallery"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
