import { Search, Send, File, Image as ImageIcon, MoreVertical, Paperclip } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

export default function Chat() {
  const [message, setMessage] = useState('');

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] bg-brand-plum/10 backdrop-blur-3xl border border-brand-magenta/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-700">
      {/* Sidebar - Chat List */}
      <div className="w-full md:w-80 border-r border-brand-magenta/10 flex flex-col bg-brand-black/20 shrink-0">
        <div className="p-6 border-b border-brand-magenta/5">
          <h2 className="text-xl font-bold text-white mb-4 tracking-tight font-display">Messaging</h2>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-highlight/30 group-focus-within:text-brand-highlight transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-4 py-2 bg-brand-black/40 border border-brand-magenta/30 rounded-xl text-sm text-white placeholder:text-brand-highlight/10 focus:outline-none focus:ring-2 focus:ring-brand-pink/40 transition-all backdrop-blur-xl"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto w-full py-2">
          {[
            { name: 'Batch 2022 Official', snippet: 'Dr. Smith: Class cancelled...', time: '10:45 AM', active: true, unread: 3 },
            { name: 'Project Group C', snippet: 'Alex: Pushed the latest UI...', time: 'Yesterday', active: false, unread: 0 },
            { name: 'Coding Club', snippet: 'Hackathon starts soon!', time: 'Tue', active: false, unread: 0 },
          ].map((chat, i) => (
            <div 
              key={i} 
              className={cn(
                "flex items-center gap-4 px-6 py-4 cursor-pointer transition-all border-b border-brand-magenta/5",
                chat.active ? "bg-brand-magenta/15" : "hover:bg-brand-magenta/5"
              )}
            >
              <div className="relative">
                 <div className="w-11 h-11 bg-brand-plum/40 border border-brand-magenta/20 rounded-2xl flex items-center justify-center font-bold text-brand-pink text-sm">
                   {chat.name.substring(0, 2).toUpperCase()}
                 </div>
                 {chat.active && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-brand-highlight rounded-full border-2 border-brand-plum animate-pulse"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-sm text-white truncate">{chat.name}</h3>
                  <span className="text-[10px] font-bold text-brand-pink/40">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                 <p className={cn("text-xs truncate", chat.unread > 0 ? "text-brand-highlight font-medium" : "text-white/40")}>{chat.snippet}</p>
                 {chat.unread > 0 && (
                   <span className="px-1.5 py-0.5 bg-brand-pink text-white rounded-md text-[9px] font-black shrink-0 shadow-lg shadow-brand-pink/20">{chat.unread}</span>
                 )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-brand-black/10">
        <div className="p-5 border-b border-brand-magenta/10 flex items-center justify-between bg-brand-black/20 shrink-0">
           <div className="flex items-center gap-4">
             <div className="w-11 h-11 bg-brand-magenta text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg shadow-brand-magenta/20">
               B
             </div>
             <div>
               <h2 className="font-bold text-white tracking-tight">Batch 2022 Official</h2>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                 <p className="text-[10px] font-black text-brand-highlight uppercase tracking-widest">15 Online</p>
               </div>
             </div>
           </div>
           <button className="p-2.5 text-brand-pink/40 hover:text-brand-pink hover:bg-brand-magenta/10 rounded-xl transition-all">
             <MoreVertical size={22} />
           </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-transparent">
           <div className="flex justify-center">
             <span className="text-[10px] font-black px-4 py-1.5 bg-brand-plum/30 border border-brand-magenta/10 text-brand-pink/40 rounded-full uppercase tracking-widest">Chat History • Today</span>
           </div>

           {/* Incoming Message */}
           <div className="flex gap-4 max-w-[80%] animate-in slide-in-from-left-4 duration-500">
             <div className="w-9 h-9 rounded-xl bg-brand-plum/40 border border-brand-magenta/10 text-brand-pink font-bold flex items-center justify-center text-xs shrink-0 self-end mb-1">
               DS
             </div>
             <div>
               <div className="flex items-baseline gap-2 mb-2 pl-1">
                 <span className="text-xs font-bold text-white/70">Dr. Smith</span>
                 <span className="text-[9px] font-bold text-brand-pink/30 uppercase">10:45 AM</span>
               </div>
               <div className="bg-brand-plum/20 backdrop-blur-xl border border-brand-magenta/10 p-4 rounded-3xl rounded-bl-sm shadow-xl">
                 <p className="text-sm text-white/80 leading-relaxed">Class cancelled for tomorrow due to maintenance. Please check your emails for the updated schedule.</p>
               </div>
             </div>
           </div>

           {/* Outgoing Message */}
           <div className="flex gap-4 max-w-[80%] self-end ml-auto animate-in slide-in-from-right-4 duration-500">
             <div className="text-right">
               <div className="flex items-baseline gap-2 mb-2 justify-end pr-1">
                 <span className="text-[9px] font-bold text-brand-pink/30 uppercase">10:47 AM</span>
               </div>
               <div className="bg-brand-magenta text-white p-4 rounded-3xl rounded-br-sm shadow-xl shadow-brand-magenta/10">
                 <p className="text-sm font-medium">Noted, thank you sir!</p>
               </div>
             </div>
           </div>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-brand-black/20 border-t border-brand-magenta/5 shrink-0">
          <div className="flex items-end gap-3">
            <div className="flex gap-1 pb-1 shrink-0">
              <button className="p-2.5 text-brand-pink/40 hover:text-brand-pink hover:bg-brand-magenta/10 rounded-xl transition-all">
                 <Paperclip size={22} />
              </button>
            </div>
            <div className="flex-1 bg-brand-plum/20 border border-brand-magenta/30 rounded-2xl focus-within:ring-2 focus-within:ring-brand-pink/40 transition-all flex items-end backdrop-blur-xl shadow-inner">
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-transparent border-none p-4 max-h-32 min-h-[48px] resize-none focus:outline-none text-sm text-white placeholder:text-brand-highlight/20"
                rows={1}
              />
            </div>
            <button className="p-4 bg-brand-magenta text-white rounded-2xl hover:bg-brand-pink transition-all shadow-lg shadow-brand-magenta/20 shrink-0">
              <Send size={20} className="ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
