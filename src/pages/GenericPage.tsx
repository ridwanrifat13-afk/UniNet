import { LayoutTemplate } from 'lucide-react';

export default function GenericPage({ title }: { title: string }) {
  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-1000">
      <div className="relative group">
        <div className="absolute inset-0 bg-brand-magenta/20 rounded-full blur-[100px] animate-pulse" />
        <div className="relative w-28 h-28 bg-brand-plum/20 backdrop-blur-2xl border border-brand-magenta/20 text-brand-highlight rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl group-hover:scale-110 transition-transform duration-500">
          <LayoutTemplate size={48} className="drop-shadow-[0_0_15px_rgba(223,161,196,0.5)]" />
        </div>
      </div>
      
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter font-display text-center">
        {title}
      </h1>
      
      <p className="text-brand-pink/60 text-center max-w-lg font-bold text-lg leading-relaxed uppercase tracking-[0.2em] px-6">
        Module Under Construction
      </p>
      
      <div className="mt-12 flex gap-4">
        <div className="w-2 h-2 bg-brand-magenta rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-brand-pink rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-brand-highlight rounded-full animate-bounce" />
      </div>
    </div>
  );
}
