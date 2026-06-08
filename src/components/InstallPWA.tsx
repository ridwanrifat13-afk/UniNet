import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (!isStandalone) {
      // Listen for Android/Chrome install prompt
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      });

      // Show manual prompt after a very short delay
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowPrompt(false);
      setDeferredPrompt(null);
    } else {
      // Fallback for iOS or if prompt isn't ready
      if (isIOS) {
        alert("To install on iOS: Tap 'Share' and then 'Add to Home Screen'.");
      } else {
        alert("To install: Open your browser menu and select 'Install App' or 'Add to Home Screen'.");
      }
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-80 z-[200]"
        >
          <div className="bg-brand-plum/40 backdrop-blur-3xl border border-brand-magenta/30 rounded-[2rem] p-6 shadow-2xl shadow-brand-magenta/20">
            <button 
              onClick={() => setShowPrompt(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-brand-magenta/20 rounded-2xl text-brand-magenta">
                {isIOS ? <Share size={24} /> : <Download size={24} />}
              </div>
              <div>
                <h4 className="text-white font-bold tracking-tight">Install UniNet</h4>
                <p className="text-brand-highlight/60 text-[10px] font-black uppercase tracking-widest">Web App Ready</p>
              </div>
            </div>

            <p className="text-sm text-white/60 font-medium mb-6 leading-relaxed">
              Add UniNet to your home screen for instant access, offline support, and a better experience.
            </p>

            <button
              onClick={handleInstall}
              className="w-full bg-brand-magenta hover:bg-brand-pink text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-brand-magenta/20 uppercase tracking-widest text-xs"
            >
              Install Now
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
