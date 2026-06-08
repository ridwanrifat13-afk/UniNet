import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, MapPin, Plus, X, Loader2, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { collection, addDoc, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { useStore } from '../lib/store';
import { db, auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNetwork } from '../lib/network-context';

interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  date: any; // Firestore Timestamp
  time: string;
  location: string;
  addedBy: string;
}

export default function Calendar() {
  const [user] = useAuthState(auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Firestore Data
  const { calendar: events, calendarLoaded, fetchCalendar } = useStore();
  const loading = !calendarLoaded;
  const { networkId } = useNetwork();

  useEffect(() => {
    if (networkId) fetchCalendar(networkId);
  }, [fetchCalendar, networkId]);

  // Calendar Logic
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const totalDays = endOfMonth.getDate();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, `networks/${networkId}/calendar`), {
        title: newTitle.trim(),
        type: newType.trim(),
        date: Timestamp.fromDate(new Date(newDate)),
        time: newTime.trim(),
        location: newLocation.trim(),
        addedBy: user.uid,
        createdAt: Timestamp.now()
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewType('');
      setNewDate('');
      setNewTime('');
      setNewLocation('');
    } catch (err) {
      console.error(err);
      alert("Error adding entry. Check Firestore rules.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Remove this entry from the academic calendar?")) {
      try {
        await deleteDoc(doc(db, `networks/${networkId}/calendar`, id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight font-display">Academic Calendar</h1>
          <p className="text-brand-highlight/60 mt-1 font-medium">Departmental milestones & student schedule</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-magenta hover:bg-brand-pink text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-brand-magenta/20 uppercase tracking-widest"
        >
          <Plus size={18} /> Add Entry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Calendar View */}
          <div className="bg-brand-plum/10 backdrop-blur-2xl border border-brand-magenta/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="px-8 py-6 flex items-center justify-between border-b border-brand-magenta/5 bg-brand-black/20">
              <h2 className="font-bold text-xl text-white tracking-tight">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center gap-3">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-brand-magenta/20 rounded-xl text-brand-highlight/60 transition-all"><ChevronLeft size={24}/></button>
                <button onClick={handleNextMonth} className="p-2 hover:bg-brand-magenta/20 rounded-xl text-brand-highlight/60 transition-all"><ChevronRight size={24}/></button>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-7 gap-px mb-6 text-center text-[10px] font-black text-brand-highlight/40 uppercase tracking-[0.2em]">
                {days.map(day => <div key={day} className="py-2">{day}</div>)}
              </div>
              
              <div className="grid grid-cols-7 gap-4">
                {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} className="aspect-square"></div>)}

                {Array.from({ length: totalDays }).map((_, i) => {
                  const date = i + 1;
                  const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
                  const dayEvents = events.filter(e => {
                    const eDate = e.date.toDate();
                    return eDate.getDate() === date && eDate.getMonth() === currentDate.getMonth() && eDate.getFullYear() === currentDate.getFullYear();
                  });
                  
                  const isToday = new Date().toDateString() === dayDate.toDateString();
                  
                  return (
                    <div 
                      key={date} 
                      className={cn(
                        "aspect-square p-1 rounded-2xl border transition-all relative group flex flex-col items-center justify-center",
                        isToday ? "border-brand-pink bg-brand-pink/20 shadow-[0_0_20px_rgba(166,77,121,0.2)]" : "border-brand-magenta/5 hover:border-brand-pink/40 hover:bg-brand-magenta/5",
                        dayEvents.length > 0 ? "bg-brand-plum/20" : ""
                      )}
                    >
                      <span className={cn(
                        "text-sm font-bold w-9 h-9 flex items-center justify-center rounded-xl transition-all",
                        isToday ? "bg-brand-pink text-white" : "text-white/60 group-hover:text-white"
                      )}>
                        {date}
                      </span>
                      
                      <div className="absolute bottom-2 flex gap-1">
                        {dayEvents.map((e, i) => (
                           <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-highlight shadow-[0_0_8px_rgba(223,161,196,0.6)]" />
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
          <div className="bg-brand-plum/10 backdrop-blur-2xl border border-brand-magenta/10 rounded-[2.5rem] p-8 h-full">
            <h3 className="font-bold text-white text-lg mb-8 flex items-center justify-between">
              Agenda
              <span className="text-[10px] font-black px-2.5 py-1 bg-brand-magenta/30 text-brand-highlight rounded-lg uppercase tracking-widest">Upcoming</span>
            </h3>

            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-magenta" /></div>
            ) : events.length === 0 ? (
              <p className="text-brand-highlight/20 text-sm font-bold italic text-center py-10">No upcoming events</p>
            ) : (
              <div className="space-y-8">
                {events.slice(0, 5).map((e, i) => (
                  <div key={i} className="flex gap-5 group relative">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-3 h-3 rounded-full mt-1.5 bg-brand-highlight shadow-[0_0_10px_rgba(223,161,196,0.4)]" />
                      {i !== events.length - 1 && <div className="w-[1px] h-full bg-brand-magenta/10 mt-3" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-bold text-white group-hover:text-brand-highlight transition-colors leading-tight">{e.title}</p>
                        {user?.uid === e.addedBy && (
                          <button onClick={() => handleDelete(e.id)} className="text-red-400/30 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] font-black text-brand-pink uppercase tracking-widest mt-1">{e.type}</p>
                      <div className="flex flex-wrap gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/40">
                          <Clock size={12} /> {e.time}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/40">
                          <MapPin size={12} /> {e.location || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-md" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-brand-plum/40 backdrop-blur-3xl border border-brand-magenta/20 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 max-h-[85dvh] overflow-y-auto">
            <div className="p-5 md:p-8 border-b border-brand-magenta/10 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white tracking-tight">Schedule Event</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-brand-magenta/10 rounded-full text-brand-highlight/40 hover:text-white transition-all"><X size={24} /></button>
            </div>

            <form onSubmit={handleAddEntry} className="p-5 md:p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Event Title</label>
                <input required type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g., Database Systems CT" className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white placeholder:text-brand-highlight/10 focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Type</label>
                  <input required type="text" value={newType} onChange={(e) => setNewType(e.target.value)} placeholder="e.g., Exam" className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Location</label>
                  <input type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="Room 302" className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Date</label>
                  <input required type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-highlight uppercase tracking-widest ml-1">Time</label>
                  <input required type="text" value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="10:30 AM" className="w-full px-5 py-3.5 bg-brand-black/40 border border-brand-magenta/30 rounded-2xl text-white focus:ring-2 focus:ring-brand-pink/40 outline-none transition-all" />
                </div>
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full bg-brand-magenta text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-magenta/20 hover:bg-brand-pink transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirm Entry"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
