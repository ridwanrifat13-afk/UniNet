import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, File, Image as ImageIcon, MoreVertical, Paperclip, Hash, Loader2, AlertCircle, Trash2, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb, auth } from '../lib/firebase';
import { ref, push, onValue, query, limitToLast, serverTimestamp, remove } from 'firebase/database';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Virtuoso } from 'react-virtuoso';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  timestamp: number;
}

interface Room {
  id: string;
  name: string;
  description: string;
}

const ROOMS: Room[] = [
  { id: 'general', name: 'general', description: 'Department-wide discussions' },
  { id: 'clubs', name: 'clubs', description: 'Coding clubs & activities' },
  { id: 'projects', name: 'projects', description: 'Study groups & collaborations' },
];

export default function Chat() {
  const [user, authLoading] = useAuthState(auth);
  const [activeRoom, setActiveRoom] = useState<Room>(ROOMS[0]);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setDbError("Authentication required.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setDbError(null);
    
    try {
      const messagesRef = ref(rtdb, `messages/${activeRoom.id}`);
      const q = query(messagesRef, limitToLast(50));

      const unsubscribe = onValue(q, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const messageList = Object.entries(data).map(([id, val]: [string, any]) => ({
            id,
            ...val,
          }));
          setMessages(messageList.sort((a, b) => a.timestamp - b.timestamp));
        } else {
          setMessages([]);
        }
        setLoading(false);
      }, (error) => {
        setDbError(`Database Error: ${error.message}`);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err: any) {
      setDbError(`Connection Error: ${err.message}`);
      setLoading(false);
    }
  }, [activeRoom, user, authLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !user) return;

    const messagesRef = ref(rtdb, `messages/${activeRoom.id}`);
    const newMessage = {
      text: messageText.trim(),
      senderId: user.uid,
      senderName: user.displayName || user.email?.split('@')[0] || 'Anonymous Student',
      senderPhoto: user.photoURL || null,
      timestamp: serverTimestamp(),
    };

    try {
      await push(messagesRef, newMessage);
      setMessageText('');
    } catch (err: any) {
      alert(`Failed to send: ${err.message}`);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!window.confirm("Delete this message?")) return;
    const msgRef = ref(rtdb, `messages/${activeRoom.id}/${msgId}`);
    try {
      await remove(msgRef);
    } catch (err: any) {
      console.error(err);
    }
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-[calc(100dvh-6rem)] lg:h-[calc(100dvh-4rem)] bg-brand-plum/10 backdrop-blur-3xl border border-brand-magenta/30 rounded-[2rem] overflow-hidden shadow-2xl relative">
      
      {/* Sidebar - Rooms List */}
      <div className={cn(
        "absolute inset-y-0 left-0 z-50 w-72 bg-brand-black/95 md:bg-brand-black/40 backdrop-blur-3xl border-r border-brand-magenta/30 transform transition-transform duration-300 md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-brand-magenta/30 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Channels</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {ROOMS.map((room) => (
            <div 
              key={room.id} 
              onClick={() => {
                setActiveRoom(room);
                setIsSidebarOpen(false);
              }}
              className={cn(
                "flex items-center gap-4 px-6 py-4 cursor-pointer transition-all border-b border-brand-magenta/5",
                activeRoom.id === room.id ? "bg-brand-magenta/20 border-l-4 border-l-brand-pink" : "hover:bg-brand-magenta/5 border-l-4 border-l-transparent"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
                activeRoom.id === room.id ? "bg-brand-magenta text-white" : "bg-brand-plum/40 text-brand-pink"
              )}>
                <Hash size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xs text-white uppercase tracking-widest">{room.name}</h3>
                <p className="text-[10px] text-white/40 truncate">{room.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-brand-black/10 relative">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-brand-magenta/30 flex items-center justify-between bg-brand-black/40">
           <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="md:hidden p-2 bg-brand-magenta/10 text-brand-pink rounded-xl"
             >
               <Menu size={20} />
             </button>
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-brand-magenta text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                 {activeRoom.name.charAt(0).toUpperCase()}
               </div>
               <div>
                 <h2 className="font-bold text-white tracking-tight uppercase text-sm md:text-base">#{activeRoom.name}</h2>
                 <p className="text-[10px] font-black text-brand-highlight/60 uppercase tracking-widest">Live Feed</p>
               </div>
             </div>
           </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 bg-transparent relative">
           {loading ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 z-10 bg-brand-black/40 backdrop-blur-sm">
               <Loader2 className="w-8 h-8 text-brand-magenta animate-spin" />
               <p className="text-[10px] font-black text-brand-highlight/40 uppercase tracking-widest">Syncing Messages...</p>
             </div>
           ) : messages.length === 0 ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-20">
               <Hash size={48} className="text-brand-magenta mb-4" />
               <p className="font-bold italic">Start the conversation in #{activeRoom.name}</p>
             </div>
           ) : null}
           
           <Virtuoso
             className="h-full w-full px-4 md:px-8 py-4 scrollbar-hide"
             data={messages}
             initialTopMostItemIndex={messages.length - 1}
             followOutput="smooth"
             alignToBottom
             itemContent={(index, msg) => {
               const isMe = msg.senderId === user?.uid;
               return (
                 <div 
                   className={cn(
                     "flex gap-3 md:gap-4 max-w-[90%] md:max-w-[85%] animate-in duration-500 mb-6 md:mb-8",
                     isMe ? "self-end ml-auto flex-row-reverse text-right slide-in-from-right-4" : "slide-in-from-left-4"
                   )}
                 >
                   {/* Avatar */}
                   <div className={cn(
                     "w-8 h-8 md:w-10 md:h-10 rounded-xl font-bold flex items-center justify-center text-[10px] md:text-xs shrink-0 self-end mb-1 border shadow-lg",
                     isMe ? "bg-brand-magenta/30 border-brand-pink/60 text-white" : "bg-brand-plum/60 border-brand-magenta/40 text-brand-pink"
                   )}>
                     {msg.senderPhoto ? (
                       <img src={msg.senderPhoto} alt={msg.senderName} className="w-full h-full object-cover rounded-xl" />
                     ) : (
                       msg.senderName.substring(0, 2).toUpperCase()
                     )}
                   </div>

                   <div className="space-y-1">
                     <div className={cn(
                       "flex items-center gap-3 px-1",
                       isMe ? "flex-row-reverse" : ""
                     )}>
                       <span className="text-[9px] md:text-[10px] font-black text-white/80 uppercase tracking-widest">{isMe ? 'You' : msg.senderName}</span>
                       <span className="text-[9px] md:text-[10px] font-black text-brand-pink/80 bg-brand-magenta/10 px-2 py-0.5 rounded-full">{formatTime(msg.timestamp)}</span>
                       {isMe && (
                         <button 
                           onClick={() => handleDeleteMessage(msg.id)}
                           className="p-1 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                         >
                           <Trash2 size={12} />
                         </button>
                       )}
                     </div>
                     <div className={cn(
                       "backdrop-blur-xl border p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-xl",
                       isMe 
                        ? "bg-brand-magenta text-white border-brand-pink/50 rounded-br-none" 
                        : "bg-brand-plum/30 border-brand-magenta/30 text-white/90 rounded-bl-none"
                     )}>
                       <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                     </div>
                   </div>
                 </div>
               );
             }}
           />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 md:p-6 bg-brand-black/40 border-t border-brand-magenta/30 shrink-0">
          <div className="flex items-end gap-3 max-w-5xl mx-auto">
            <div className="flex-1 bg-brand-plum/20 border border-brand-magenta/30 rounded-2xl focus-within:ring-2 focus-within:ring-brand-pink/40 transition-all flex items-end backdrop-blur-xl shadow-inner">
              <textarea 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder={`Message #${activeRoom.name}...`}
                className="w-full bg-transparent border-none p-4 max-h-32 min-h-[48px] resize-none focus:outline-none text-sm text-white placeholder:text-brand-highlight/20"
                rows={1}
              />
            </div>
            <button 
              type="submit"
              disabled={!messageText.trim()}
              className="p-4 bg-brand-magenta text-white rounded-2xl hover:bg-brand-pink transition-all shadow-lg shadow-brand-magenta/40 shrink-0 disabled:opacity-50 disabled:grayscale"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
