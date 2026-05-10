import { Mail, Phone, MapPin, Edit3, Link as LinkIcon, FileText, Lock, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Profile() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="relative group">
        {/* Decorative Glow */}
        <div className="absolute inset-0 bg-brand-magenta/5 rounded-[2.5rem] blur-3xl group-hover:bg-brand-magenta/10 transition-all duration-700" />
        
        <div className="relative bg-brand-plum/10 backdrop-blur-3xl rounded-[2.5rem] border border-brand-magenta/10 overflow-hidden shadow-2xl">
          {/* Cover image - Minimalist Gradient */}
          <div className="h-40 bg-gradient-to-br from-brand-magenta/40 via-brand-pink/20 to-transparent relative">
            <div className="absolute inset-0 bg-brand-black/20" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-brand-plum/40 to-transparent" />
          </div>
          
          <div className="px-8 sm:px-12 pb-12 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-10">
              <div className="flex items-end gap-6">
                <div className="w-32 h-32 sm:w-40 sm:h-40 bg-brand-black/40 rounded-3xl p-1.5 shadow-2xl border border-brand-magenta/20 backdrop-blur-xl">
                  <div className="w-full h-full bg-brand-magenta/10 rounded-2xl flex items-center justify-center font-bold text-5xl text-brand-highlight tracking-tighter">
                    AR
                  </div>
                </div>
                <div className="pb-4">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-display">Alex Rider</h1>
                  <div className="flex items-center gap-2 mt-2 text-brand-highlight font-black uppercase tracking-widest text-[10px]">
                    <span className="px-2 py-0.5 bg-brand-magenta/30 rounded-md">Batch 2022</span>
                    <span className="w-1 h-1 bg-brand-pink/50 rounded-full" />
                    <span>Computer Science</span>
                  </div>
                </div>
              </div>
              
              <button className="flex items-center gap-2 px-6 py-3 bg-brand-magenta hover:bg-brand-pink text-white rounded-2xl font-bold transition-all text-sm shadow-xl shadow-brand-magenta/20 self-start sm:self-auto mb-2">
                <Edit3 size={18} />
                Edit Account
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="md:col-span-1 space-y-8">
                <div>
                  <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-brand-pink rounded-full" />
                    Bio
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed font-medium">
                    Passionate about software engineering and machine learning. Architecting the future of campus networks, one commit at a time.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: Mail, value: 'alex.1234@uni.edu' },
                    { icon: Phone, value: '+1 (234) 567-8901' },
                    { icon: LinkIcon, value: 'github.com/alexr', isLink: true }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-sm font-medium group/link">
                      <div className="w-8 h-8 rounded-lg bg-brand-magenta/10 flex items-center justify-center text-brand-pink/60 group-hover/link:text-brand-pink transition-colors">
                        <item.icon size={16} />
                      </div>
                      {item.isLink ? (
                        <a href="#" className="text-brand-pink hover:text-brand-highlight transition-colors underline decoration-brand-pink/30 underline-offset-4">{item.value}</a>
                      ) : (
                        <span className="text-white/50">{item.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 space-y-8">
                <div className="bg-brand-black/20 border border-brand-magenta/10 rounded-3xl overflow-hidden shadow-inner">
                  <div className="px-6 py-4 flex items-center justify-between border-b border-brand-magenta/5 bg-brand-black/20">
                    <h3 className="font-bold text-white tracking-wide">Academic Repository</h3>
                    <button className="text-[10px] font-black text-brand-pink hover:text-brand-highlight uppercase tracking-widest px-3 py-1 bg-brand-magenta/10 rounded-lg transition-all">Upload New</button>
                  </div>
                  
                  <div className="divide-y divide-brand-magenta/5">
                    {[
                      { name: 'Final_Research_Paper.pdf', type: 'Public', date: 'Mar 10' },
                      { name: 'Semester_Transcript.pdf', type: 'Private', date: 'Jan 15' },
                      { name: 'Design_Portfolio_V2.docx', type: 'Public', date: 'Feb 20' }
                    ].map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-5 hover:bg-brand-magenta/5 transition-all group/doc cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-brand-magenta/10 text-brand-pink rounded-xl group-hover/doc:scale-110 transition-transform">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white group-hover/doc:text-brand-highlight transition-colors">{doc.name}</p>
                            <p className="text-[10px] font-bold text-brand-pink/30 uppercase mt-1">Modified {doc.date}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                            doc.type === 'Private' ? 'bg-brand-plum/40 text-white/20' : 'bg-brand-magenta/20 text-brand-highlight shadow-sm'
                          )}>
                            {doc.type === 'Private' && <Lock size={10} />}
                            {doc.type}
                          </span>
                          <ChevronRight size={18} className="text-brand-pink/0 group-hover/doc:text-brand-pink group-hover/doc:translate-x-1 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
