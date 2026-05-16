import React from 'react';
import { motion } from 'motion/react';
import { Facebook, Instagram, Linkedin, Youtube, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24 animate-in fade-in duration-1000">
      
      {/* Top Navigation / Socials inspired by reference */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-2">
          <Star className="text-brand-pink fill-brand-pink w-4 h-4" />
          <span className="text-[10px] font-black text-brand-highlight uppercase tracking-[0.4em]">Department Mission</span>
        </div>
        <div className="flex gap-4">
          {[Facebook, Instagram, Linkedin, Youtube].map((Icon, i) => (
            <motion.a
              key={i}
              href="#"
              whileHover={{ y: -4, scale: 1.1 }}
              className="w-10 h-10 rounded-full bg-brand-plum/20 border border-brand-magenta/10 flex items-center justify-center text-brand-pink hover:text-brand-highlight hover:border-brand-pink/40 transition-all"
            >
              <Icon size={18} />
            </motion.a>
          ))}
        </div>
      </div>

      {/* Header Image Section - Unique Shape inspired by reference */}
      <div className="relative group">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative aspect-[21/9] w-full overflow-hidden rounded-tr-[8rem] rounded-bl-[8rem] rounded-tl-2xl rounded-br-2xl border border-brand-magenta/10 shadow-2xl"
        >
          <img 
            src="/Airbrush-IMAGE-ENHANCER-1778946647097-1778946647097.webp" 
            alt="Department Vision" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 via-transparent to-transparent" />
          
          {/* Stats Overlay */}
          <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 text-right">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-brand-black/40 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-white/10"
            >
              <h3 className="text-4xl md:text-6xl font-bold text-white mb-1">130+</h3>
              <p className="text-brand-highlight font-black uppercase tracking-widest text-[10px]">Future Tech Leaders</p>
              <div className="h-px w-12 bg-brand-pink mt-4 ml-auto" />
              <p className="text-white/40 text-[10px] mt-2 uppercase tracking-tighter">Batch 2025</p>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Decorative background glow */}
        <div className="absolute -z-10 inset-0 bg-brand-magenta/5 blur-3xl rounded-full" />
      </div>

      {/* Main Content inspired by reference */}
      <div className="space-y-12">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-8xl font-bold text-white leading-[0.9] tracking-tighter max-w-3xl"
          >
            Shaping the Future <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-highlight to-brand-pink">of Computing.</span>
          </motion.h1>
          
          <div className="lg:text-right space-y-4 pt-4">
            <h4 className="text-2xl font-bold text-brand-pink uppercase tracking-tighter">Department of CSE</h4>
            <p className="text-white/40 text-sm font-medium">CUET | Chittagong, Bangladesh</p>
            <p className="text-brand-highlight font-bold max-w-xs lg:ml-auto">
              Building a generation driven to innovate and create impact.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-lg md:text-xl text-white/70 leading-relaxed font-medium">
              The vision of the Department of Computer Science and Engineering is to build skilled, innovative, and research-oriented computer professionals who can contribute to technology and society through knowledge, creativity, and continuous learning.
            </p>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed font-medium">
              With quality education, modern labs, strong faculty support, and an active culture of research, programming, and co-curricular activities, the department inspires students to grow as future tech leaders.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 relative"
          >
            <p className="text-lg md:text-xl text-brand-highlight leading-relaxed font-bold italic border-l-2 border-brand-pink pl-8">
              "For CSE-25, this vision represents more than academics — it reflects a generation driven to innovate, collaborate, compete, and create impact through technology."
            </p>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed font-medium">
              As the next wave of engineers, CSE-25 carries the spirit of learning, coding, research, and leadership while shaping the future of technology together.
            </p>
            
            <Link to="/projects">
              <motion.div
                whileHover={{ x: 10 }}
                className="group flex items-center gap-4 bg-brand-black/50 border border-brand-magenta/20 px-8 py-4 rounded-full text-white font-bold transition-all hover:border-brand-pink cursor-pointer w-fit"
              >
                EXPLORE OUR PROJECTS
                <div className="w-10 h-10 bg-brand-magenta rounded-full flex items-center justify-center group-hover:bg-brand-pink transition-colors">
                  <ArrowRight size={18} />
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Decorative floating shapes */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-brand-magenta/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-brand-pink/5 rounded-full blur-[120px] -z-10" />
    </div>
  );
}
