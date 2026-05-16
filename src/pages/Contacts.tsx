import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Linkedin, Search, Facebook, Instagram, Youtube, User, Github, MessageSquare, GraduationCap, Globe } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface StudentProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  batch?: string;
  department?: string;
  github?: string;
  website?: string;
  links?: { label: string, url: string }[];
}

export default function Contacts() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'profiles'), orderBy('displayName', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StudentProfile));
      setStudents(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredStudents = students.filter(s => 
    s.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLinkedIn = (student: StudentProfile) => {
    const link = student.links?.find(l => l.label.toLowerCase().includes('linkedin'));
    return link?.url;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 animate-in fade-in duration-700">
      
      {/* Header & Department Socials */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-brand-pink rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-brand-highlight uppercase tracking-[0.4em]">Official Channels</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">Connect with CSE</h1>
          <p className="text-white/40 font-medium max-w-md">
            Reach out to our department or browse the directory of 130 future engineers.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {[
            { icon: Facebook, label: 'Facebook', color: 'hover:text-blue-500' },
            { icon: Instagram, label: 'Instagram', color: 'hover:text-pink-500' },
            { icon: Youtube, label: 'YouTube', color: 'hover:text-red-500' },
            { icon: Globe, label: 'Website', color: 'hover:text-brand-highlight' }
          ].map((social, i) => (
            <motion.a
              key={i}
              href="#"
              whileHover={{ y: -4, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "flex items-center gap-3 px-6 py-3 bg-brand-plum/20 border border-brand-magenta/10 rounded-2xl text-white/60 transition-all font-bold text-xs uppercase tracking-widest",
                social.color,
                "hover:border-brand-magenta/40 hover:bg-brand-plum/30"
              )}
            >
              <social.icon size={16} />
              {social.label}
            </motion.a>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-brand-pink/40 group-focus-within:text-brand-pink transition-colors">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Search students by name or email..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-16 pr-8 py-6 bg-brand-black/40 border border-brand-magenta/10 rounded-[2rem] text-white placeholder:text-white/10 outline-none focus:ring-2 focus:ring-brand-pink/20 transition-all text-lg font-medium shadow-inner"
        />
      </div>

      {/* Student List */}
      <div className="space-y-4 relative">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-32 bg-brand-plum/10 rounded-3xl animate-pulse border border-brand-magenta/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredStudents.map((student) => {
                const linkedInUrl = getLinkedIn(student);
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={student.id}
                    className="group relative bg-brand-plum/10 backdrop-blur-sm border border-brand-magenta/10 rounded-[2rem] p-6 hover:bg-brand-plum/20 hover:border-brand-magenta/30 transition-all duration-300 shadow-xl overflow-hidden"
                  >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <GraduationCap size={80} className="text-brand-pink" />
                    </div>

                    <div className="flex items-center gap-5 relative z-10">
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-brand-black/40 border border-brand-magenta/20 overflow-hidden shadow-2xl transition-transform group-hover:scale-110 duration-500">
                          {student.photoURL ? (
                            <img src={student.photoURL} alt={student.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand-pink font-bold text-xl bg-brand-magenta/5">
                              <User size={24} />
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-brand-black rounded-full shadow-sm" />
                      </div>
                      
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-white truncate group-hover:text-brand-highlight transition-colors">
                          {student.displayName}
                        </h3>
                        <p className="text-[10px] font-black text-brand-pink/50 uppercase tracking-widest truncate">
                          {student.batch ? `Batch ${student.batch}` : 'CSE Student'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-brand-magenta/5 pt-6">
                      <div className="flex gap-3">
                        <a 
                          href={`mailto:${student.email}`} 
                          className="w-10 h-10 rounded-xl bg-brand-black/40 flex items-center justify-center text-white/40 hover:text-white hover:bg-brand-magenta transition-all"
                          title="Send Email"
                        >
                          <Mail size={18} />
                        </a>
                        {linkedInUrl && (
                          <a 
                            href={linkedInUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-brand-black/40 flex items-center justify-center text-white/40 hover:text-[#0077B5] hover:bg-white transition-all"
                            title="LinkedIn Profile"
                          >
                            <Linkedin size={18} />
                          </a>
                        )}
                        {student.github && (
                          <a 
                            href={`https://github.com/${student.github}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-brand-black/40 flex items-center justify-center text-white/40 hover:text-white hover:bg-black transition-all"
                            title="GitHub Profile"
                          >
                            <Github size={18} />
                          </a>
                        )}
                      </div>
                      
                      <Link 
                        to={`/profile/${student.id}`}
                        className="text-[10px] font-black text-brand-highlight uppercase tracking-[0.2em] hover:text-brand-pink transition-colors flex items-center gap-2 group/btn"
                      >
                        Profile <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredStudents.length === 0 && (
          <div className="text-center py-20 bg-brand-plum/5 rounded-[3rem] border border-dashed border-brand-magenta/10">
            <Search className="mx-auto w-12 h-12 text-brand-magenta/20 mb-4" />
            <p className="text-white/20 font-medium italic">No students found matching your search.</p>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// Re-using ArrowRight as it was missing from imports
import { ArrowRight as ArrowIcon } from 'lucide-react';
const ArrowRight = ArrowIcon;
