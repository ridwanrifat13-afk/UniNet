import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Calendar() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);

  const events = [
    { date: 15, title: 'Database CT 3', type: 'exam', time: '10:00 AM' },
    { date: 18, title: 'OS Lab Final', type: 'lab', time: '2:00 PM' },
    { date: 22, title: 'Project Presentation', type: 'presentation', time: '11:30 AM' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-display">Academic Calendar</h1>
          <p className="text-brand-pink/60">Schedule and departmental milestones</p>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-magenta text-white rounded-2xl font-bold text-sm hover:bg-brand-pink transition-all shadow-lg shadow-brand-magenta/20">
          <CalIcon size={18} /> Add Entry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Calendar View - Transparent Glass */}
          <div className="bg-brand-plum/10 backdrop-blur-2xl border border-brand-magenta/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-8 py-6 flex items-center justify-between border-b border-brand-magenta/5 bg-brand-black/20">
              <h2 className="font-bold text-xl text-white tracking-wide">May 2026</h2>
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-brand-magenta/20 rounded-xl text-brand-pink/60 transition-all"><ChevronLeft size={24}/></button>
                <button className="p-2 hover:bg-brand-magenta/20 rounded-xl text-brand-pink/60 transition-all"><ChevronRight size={24}/></button>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-7 gap-px mb-4 text-center text-xs font-bold text-brand-pink/40 uppercase tracking-[0.2em]">
                {days.map(day => <div key={day} className="py-2">{day}</div>)}
              </div>
              
              <div className="grid grid-cols-7 gap-3">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="aspect-square"></div>)}

                {dates.map(date => {
                  const dayEvents = events.filter(e => e.date === date);
                  const isToday = date === 7;
                  
                  return (
                    <div 
                      key={date} 
                      className={cn(
                        "aspect-square p-1 rounded-2xl border transition-all relative group cursor-pointer flex flex-col items-center justify-center",
                        isToday ? "border-brand-pink bg-brand-pink/20 shadow-[0_0_20px_rgba(166,77,121,0.2)]" : "border-brand-magenta/5 hover:border-brand-pink/40 hover:bg-brand-magenta/5",
                        dayEvents.length > 0 ? "bg-brand-plum/20" : ""
                      )}
                    >
                      <span className={cn(
                        "text-sm font-bold w-8 h-8 flex items-center justify-center rounded-xl transition-all",
                        isToday ? "bg-brand-pink text-white" : "text-white/60 group-hover:text-white"
                      )}>
                        {date}
                      </span>
                      
                      <div className="absolute bottom-2 flex gap-1">
                        {dayEvents.map((e, i) => (
                           <div key={i} className={cn(
                             "w-1.5 h-1.5 rounded-full shadow-sm",
                             e.type === 'exam' ? 'bg-red-500' :
                             e.type === 'lab' ? 'bg-amber-400' : 'bg-brand-pink'
                           )} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Upcoming Section */}
          <div className="bg-brand-plum/10 backdrop-blur-2xl border border-brand-magenta/10 rounded-3xl p-8">
            <h3 className="font-bold text-white text-lg mb-6 flex items-center justify-between">
              Upcoming
              <span className="text-[10px] font-black px-2.5 py-1 bg-brand-magenta/30 text-brand-pink rounded-lg uppercase tracking-tighter">Priority</span>
            </h3>

            <div className="space-y-6">
              {events.map((e, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="flex flex-col items-center mt-1">
                    <div className={cn(
                      "w-3 h-3 rounded-full mt-1.5 ring-4",
                      e.type === 'exam' ? 'bg-red-500 ring-red-500/10' :
                      e.type === 'lab' ? 'bg-amber-400 ring-amber-400/10' : 'bg-brand-pink ring-brand-pink/10'
                    )} />
                    {i !== events.length - 1 && <div className="w-[1px] h-full bg-gradient-to-b from-brand-magenta/20 to-transparent mt-3" />}
                  </div>
                  <div className="pb-6">
                    <p className="text-sm font-bold text-white group-hover:text-brand-highlight transition-colors">{e.title}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs font-bold text-brand-pink/60">
                      <Clock size={12} /> {e.time}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-white/30 font-medium">
                      <MapPin size={12} /> May {e.date} • Room 302
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
