import { Search, FolderOpen, FileText, Download, Filter } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

export default function Archives() {
  const [activeTab, setActiveTab] = useState('current');

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-display">Academic Archives</h1>
          <p className="text-brand-pink/60 mt-1">Access departmental notes and resources</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-highlight/40 group-focus-within:text-brand-highlight transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search subjects..." 
              className="pl-10 pr-4 py-2.5 bg-brand-plum/30 border border-brand-magenta/30 rounded-2xl text-sm text-white placeholder:text-brand-highlight/20 focus:outline-none focus:ring-2 focus:ring-brand-pink/40 focus:border-brand-pink/50 transition-all w-full sm:w-64 backdrop-blur-xl"
            />
          </div>
          <button className="p-2.5 bg-brand-plum/30 border border-brand-magenta/30 text-brand-highlight/60 rounded-2xl hover:bg-brand-magenta/30 hover:text-white transition-all backdrop-blur-xl">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-brand-magenta/10">
        {['current', 'previous'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-3 border-b-2 font-bold text-sm transition-all duration-300 uppercase tracking-wider",
              activeTab === tab ? "border-brand-pink text-brand-pink" : "border-transparent text-white/40 hover:text-white/70"
            )}
          >
            {tab === 'current' ? 'My Classes' : 'Archive Registry'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { color: 'text-brand-pink', name: 'Database Systems', code: 'CSE 301', files: 42 },
          { color: 'text-brand-highlight', name: 'Machine Learning', code: 'CSE 305', files: 28 },
          { color: 'text-brand-pink', name: 'Computer Networks', code: 'CSE 303', files: 56 },
          { color: 'text-brand-highlight', name: 'Operating Systems', code: 'CSE 307', files: 31 },
          { color: 'text-brand-pink', name: 'Web Engineering', code: 'CSE 309', files: 19 },
        ].map((course, i) => (
          <div key={i} className="group relative">
             {/* Dynamic Glow Background */}
             <div className="absolute inset-0 bg-brand-magenta/5 rounded-3xl blur-xl group-hover:bg-brand-magenta/10 transition-all duration-500" />
             
             <div className="relative bg-brand-plum/20 backdrop-blur-xl border border-brand-magenta/10 rounded-3xl overflow-hidden hover:border-brand-pink/30 transition-all duration-500 cursor-pointer group-hover:-translate-y-1">
                <div className="h-24 flex flex-col items-center justify-center border-b border-brand-magenta/5 bg-brand-black/20 group-hover:bg-brand-magenta/10 transition-colors">
                   <FolderOpen size={32} className={cn("mb-2", course.color)} />
                   <span className={cn("font-bold tracking-widest text-xs", course.color)}>{course.code}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-white text-lg mb-1 leading-tight group-hover:text-brand-highlight transition-colors">{course.name}</h3>
                  <p className="text-sm text-brand-pink/40">{course.files} resources linked</p>
                  
                  <div className="mt-6 pt-6 border-t border-brand-magenta/5 space-y-3">
                    {['Lec_01_Intro.pdf', 'CT_2_Syllabus.pdf'].map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm group/file p-2 -mx-2 rounded-xl hover:bg-brand-magenta/10 transition-all">
                        <div className="flex items-center gap-3 text-white/60 group-hover/file:text-white">
                          <FileText size={16} className="text-brand-pink/50 group-hover/file:text-brand-pink" />
                          <span className="truncate max-w-[160px] font-medium">{file}</span>
                        </div>
                        <Download size={16} className="text-brand-pink/0 group-hover/file:text-brand-pink group-hover/file:opacity-100 opacity-0 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
