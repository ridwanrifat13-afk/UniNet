import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import InstallPWA from './InstallPWA';
import {
  Home,
  User,
  FolderOpen,
  CalendarDays,
  MessageSquare,
  Calendar as EventsIcon,
  Briefcase,
  Users,
  ImageIcon,
  Phone,
  Info,
  Menu,
  X,
  Loader2,
  Bell,
  ShieldAlert
} from 'lucide-react';
import { useState, useEffect } from 'react';

const allNavItems = [
  { to: '/', icon: Home, label: 'Home', isPublic: true },
  { to: '/archives', icon: FolderOpen, label: 'Archives', isPublic: false },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar', isPublic: false },
  { to: '/chat', icon: MessageSquare, label: 'Chat', isPublic: false },
  { to: '/events', icon: EventsIcon, label: 'Events', isPublic: true },
  { to: '/notices', icon: Bell, label: 'Notices', isPublic: false },
  { to: '/projects', icon: Briefcase, label: 'Projects', isPublic: true },
  { to: '/clubs', icon: Users, label: 'Clubs', isPublic: true },
  { to: '/gallery', icon: ImageIcon, label: 'Gallery', isPublic: true },
  { to: '/profile', icon: User, label: 'Profile', isPublic: false },
];

const secondaryNavItems = [
  { to: '/contacts', icon: Phone, label: 'Contacts', isPublic: true },
  { to: '/about', icon: Info, label: 'About', isPublic: true },
];

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  
  const [user, loading] = useAuthState(auth);
  const [timedOut, setTimedOut] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setTimedOut(true);
    }, 8000); // 8 second safety buffer
    return () => clearTimeout(timer);
  }, [loading]);

  const navItems = allNavItems.filter(item => item.isPublic || user);
  const publicPaths = [...allNavItems, ...secondaryNavItems].filter(i => i.isPublic).map(i => i.to);

  useEffect(() => {
    const isPublicPath = publicPaths.includes(location.pathname);
    if (!loading && !user && !isPublicPath) {
      navigate('/login');
    }
  }, [user, loading, navigate, location.pathname, publicPaths]);

  const isRouteActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const { scrollYProgress } = useScroll();
  const logoOpacity = useTransform(scrollYProgress, [0, 0.80, 0.82, 1], [0, 0, 1, 1]);
  const logoY = useTransform(scrollYProgress, [0, 0.80, 0.82, 1], [15, 15, 0, 0]);

  if (loading && !timedOut) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
          <p className="text-[10px] font-black text-brand-highlight/40 uppercase tracking-widest animate-pulse">Syncing Neural Grid...</p>
        </div>
      </div>
    );
  }

  const isPublicPath = publicPaths.includes(location.pathname);

  if (!user && !isPublicPath) {
     if (timedOut) {
       return (
         <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center p-6 text-center">
           <ShieldAlert className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
           <h2 className="text-2xl font-bold text-white mb-2">Connection Timeout</h2>
           <p className="text-brand-highlight/60 max-w-sm mb-8 font-medium">We couldn't connect to the Neural Network. Please check your internet or environment variables.</p>
           <button onClick={() => window.location.reload()} className="px-8 py-3 bg-brand-magenta text-white rounded-xl font-black uppercase tracking-widest text-xs">Retry Connection</button>
         </div>
       );
     }
     return null;
  }

  return (
    <div className={cn("flex min-h-screen w-full font-sans transition-colors duration-300 bg-brand-black text-white")}>
      
      {/* Background Layer (Meet Us Style) - Only for Internal Pages */}
      {!isHome && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Ambient background glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-magenta/10 rounded-full blur-[128px] mix-blend-screen" />
          <div className="absolute top-1/2 right-1/4 w-[30rem] h-[30rem] bg-brand-plum/20 rounded-full blur-[128px] mix-blend-screen" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-brand-pink/10 rounded-full blur-[128px] mix-blend-screen" />
          
          {/* Background Hardware Diagram */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            <img 
              src="/eadb4a6d-c9e1-4278-979d-bcc7d8980362-removebg-preview.webp" 
              alt="Hardware Diagram" 
              className="w-full h-full object-contain opacity-[0.15] mix-blend-screen scale-110 md:scale-125"
            />
          </div>
        </div>
      )}

      {/* Mobile Header Background (Animated) */}
      <motion.div 
        style={{ opacity: isHome ? logoOpacity : 1 }}
        className={cn("lg:hidden fixed top-0 left-0 right-0 h-16 z-50 backdrop-blur-2xl transition-colors duration-300 pointer-events-none",
          isHome ? "bg-brand-plum/30 border-b border-brand-magenta/20 saturate-150" : "bg-brand-black/40 border-b border-brand-magenta/10 saturate-150")}
      />

      {/* Mobile Header Content */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 z-50 flex items-center px-4 pointer-events-none">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {isHome ? (
            <motion.img 
              src="/89980f01-0592-4678-a345-f00c7e0c6a98 3.webp" 
              alt="Logo" 
              className="h-14 w-auto object-contain pointer-events-auto"
              initial={{ opacity: 0 }}
              style={{ opacity: logoOpacity, y: logoY }}
            />
          ) : (
            <img 
              src="/89980f01-0592-4678-a345-f00c7e0c6a98 3.webp" 
              alt="Logo" 
              className="h-14 w-auto object-contain pointer-events-auto"
            />
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={cn("p-2 -mr-2 rounded-lg transition-colors ml-auto relative z-10 pointer-events-auto text-brand-pink/80 hover:text-white hover:bg-brand-magenta/20")}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 shadow-2xl flex flex-col transition-all duration-300 ease-in-out transform backdrop-blur-2xl border-r border-brand-magenta/10",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "bg-brand-black/40 text-white saturate-150"
        )}
      >
        <div className="flex h-16 items-center justify-center px-6 border-b border-brand-magenta/10 shrink-0">
          <img 
            src="/89980f01-0592-4678-a345-f00c7e0c6a98 3.webp" 
            alt="Uninet Logo" 
            className="h-10 w-auto object-contain"
          />
        </div>

        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
          <div className={cn("text-xs font-black uppercase tracking-widest mb-2 px-3", isHome ? "text-brand-highlight" : "text-white/40")}>Main Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-display font-bold transition-all duration-200",
                  active
                    ? "bg-brand-magenta/30 text-white shadow-sm ring-1 ring-brand-highlight/30"
                    : "text-white/60 hover:bg-brand-magenta/15 hover:text-white"
                )}
              >
                <Icon size={18} className={cn(active ? "text-brand-highlight" : "text-brand-highlight/40")} />
                {item.label}
              </NavLink>
            );
          })}

          <div className="mt-8 mb-2 px-3">
            <div className={cn("text-xs font-black uppercase font-display tracking-widest", isHome ? "text-brand-highlight" : "text-white/40")}>Department</div>
          </div>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-display font-bold transition-all duration-200 active:scale-95",
                  active
                    ? "bg-brand-magenta/30 text-white shadow-sm ring-1 ring-brand-highlight/30"
                    : "text-white/60 hover:bg-brand-magenta/15 hover:text-white"
                )}
              >
                <Icon size={18} className={cn(active ? "text-brand-highlight" : "text-brand-highlight/40")} />
                {item.label}
              </NavLink>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-brand-magenta/10">
           {user ? (
             <button 
               onClick={() => auth.signOut()}
               className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors text-white/60 hover:bg-brand-magenta/15 hover:text-brand-highlight active:scale-95"
             >
                Log out
             </button>
           ) : (
             <NavLink 
               to="/login"
               className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors text-white/60 hover:bg-brand-magenta/15 hover:text-brand-highlight active:scale-95"
             >
                Log in
             </NavLink>
           )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen lg:pl-64 pt-16 lg:pt-0 relative z-10">
        <div className="flex-1 p-4 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-brand-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <InstallPWA />
    </div>
  );
}
