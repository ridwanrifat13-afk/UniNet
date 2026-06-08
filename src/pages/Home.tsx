import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNetwork } from '../lib/network-context';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import MeetUs from '../components/MeetUs';
import { Network, Users, BookOpen, Star, Loader2 } from 'lucide-react';

interface NetworkData {
  name: string;
  plan: string;
  logoUrl?: string;
}

export default function Home() {
  const { networkId } = useNetwork();
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!networkId) {
      setLoading(false);
      return;
    }
    const fetchNetwork = async () => {
      try {
        const snap = await getDoc(doc(db, 'networks', networkId));
        if (snap.exists()) {
          setNetworkData(snap.data() as NetworkData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNetwork();
  }, [networkId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-black"><Loader2 className="animate-spin text-brand-magenta w-10 h-10" /></div>;
  }

  const networkName = networkData?.name || "Student Network";

  return (
    <div className="bg-brand-black min-h-screen text-white overflow-hidden selection:bg-brand-magenta/30 pb-20">
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 px-4 text-center">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-magenta/15 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-10000" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-plum/20 rounded-full blur-[100px] mix-blend-screen" />
          
          <img 
            src="/eadb4a6d-c9e1-4278-979d-bcc7d8980362-removebg-preview.webp" 
            alt="Hardware Diagram" 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-contain opacity-[0.15] mix-blend-screen scale-150 pointer-events-none"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 max-w-5xl mx-auto flex flex-col items-center"
        >
          {networkData?.logoUrl ? (
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] overflow-hidden rotate-3 mb-10 shadow-2xl shadow-brand-magenta/40 border border-white/20 bg-brand-black flex items-center justify-center">
              <img src={networkData.logoUrl} alt={networkName} className="w-full h-full object-contain p-4" />
            </div>
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-brand-magenta to-brand-plum rounded-[2rem] flex items-center justify-center font-black text-5xl md:text-6xl shadow-2xl shadow-brand-magenta/40 rotate-3 mb-10 border border-white/20">
              {networkName.charAt(0).toUpperCase()}
            </div>
          )}
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[1.1]">
            Welcome to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-highlight to-brand-pink">
              {networkName}
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-brand-highlight max-w-3xl font-medium leading-relaxed mb-12">
            The exclusive digital platform connecting students, faculty, and alumni. Explore projects, share resources, and build your professional profile.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a href="/projects" className="px-8 py-4 bg-brand-magenta hover:bg-brand-pink text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand-magenta/20 uppercase tracking-widest text-sm">
              View Projects
            </a>
            <a href="/notices" className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-2xl transition-all uppercase tracking-widest text-sm backdrop-blur-md">
              Latest Notices
            </a>
          </div>
        </motion.div>
      </section>

      {/* Meet Us Section (Interactive Sphere) */}
      <section className="relative z-20 py-24 -mt-20 border-t border-brand-magenta/10 bg-brand-black">
        <MeetUs />
      </section>

      {/* Info Section */}
      <section className="relative z-20 py-24 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-black leading-tight">
              A Unified Hub for <br/> <span className="text-brand-pink">Our Community</span>
            </h2>
            <p className="text-brand-highlight text-lg leading-relaxed">
              This platform serves as the central hub for our academic network. It streamlines communication, showcases our best work, and preserves our shared resources for future generations.
            </p>
            <ul className="space-y-4">
              {[
                { icon: <Users size={24} className="text-brand-magenta" />, title: "Student Directory", desc: "Find peers and alumni" },
                { icon: <BookOpen size={24} className="text-brand-pink" />, title: "Academic Archives", desc: "Access study materials" },
                { icon: <Star size={24} className="text-purple-400" />, title: "Project Showcase", desc: "Discover innovations" },
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
                  <div className="p-3 bg-white/10 rounded-xl">{item.icon}</div>
                  <div>
                    <h4 className="text-white font-bold">{item.title}</h4>
                    <p className="text-brand-highlight text-sm mt-1">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-brand-magenta/20 blur-[80px] rounded-full z-0" />
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden border border-brand-pink/20 shadow-2xl">
              <img 
                src="/89980f01-0592-4678-a345-f00c7e0c6a98%203.webp" 
                alt="Community" 
                className="w-full h-auto object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-3xl font-black text-white">{networkName}</h3>
                <p className="text-brand-highlight font-medium mt-2">Empowering the next generation.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer Navigation */}
      <section className="relative z-20 py-20 px-4 text-center">
        <h3 className="text-2xl font-black mb-10 text-white">Explore More</h3>
        <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
          {[
            { label: "Our Projects", to: "projects" },
            { label: "Gallery", to: "gallery" },
            { label: "Academic Archives", to: "archives" },
            { label: "Clubs & Groups", to: "clubs" }
          ].map((btn) => (
            <a
              key={btn.label}
              href={`/n/${networkId}/${btn.to}`}
              className="relative group px-10 py-5 rounded-[2rem] overflow-hidden bg-brand-plum/20 border border-brand-magenta/20 hover:border-brand-pink/40 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/10 via-transparent to-brand-magenta/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 text-brand-highlight font-bold tracking-widest uppercase text-sm group-hover:text-white transition-colors">
                {btn.label}
              </span>
            </a>
          ))}
        </div>
      </section>

    </div>
  );
}
