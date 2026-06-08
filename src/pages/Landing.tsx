import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Zap, Users, HardDrive, Shield, Globe, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Landing() {
  const plans = [
    {
      name: "Free Trial",
      price: "৳0",
      duration: "30 Days",
      features: [
        "Up to 50 Students",
        "1 GB Cloud Storage (R2)",
        "All Core Features",
        "Community Support"
      ],
      icon: <Star className="text-brand-pink mb-4" size={32} />
    },
    {
      name: "Starter",
      price: "৳499",
      duration: "per month",
      popular: true,
      features: [
        "Up to 150 Students",
        "5 GB Cloud Storage (R2)",
        "All Core Features",
        "Priority Email Support"
      ],
      icon: <Zap className="text-brand-magenta mb-4" size={32} />
    },
    {
      name: "Pro",
      price: "৳999",
      duration: "per month",
      features: [
        "Up to 400 Students",
        "20 GB Cloud Storage (R2)",
        "All Core Features",
        "Custom Domain Support",
        "24/7 Priority Support"
      ],
      icon: <Globe className="text-purple-500 mb-4" size={32} />
    }
  ];

  return (
    <div className="min-h-screen bg-brand-black text-white selection:bg-brand-magenta/30 overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-magenta/20 rounded-full blur-[120px] mix-blend-screen opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-brand-plum/20 rounded-full blur-[150px] mix-blend-screen opacity-50" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/5 bg-brand-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-magenta rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-brand-magenta/20 rotate-3">
              U
            </div>
            <span className="text-xl font-bold tracking-tight">UniNet<span className="text-brand-magenta">.</span></span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-bold text-brand-highlight hover:text-white transition-colors">
              Existing Network?
            </Link>
            <Link to="/create" className="px-5 py-2.5 bg-white text-black font-bold rounded-xl text-sm hover:bg-gray-100 transition-colors shadow-lg shadow-white/10">
              Create Network
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
            The Ultimate Network for <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-magenta via-brand-pink to-purple-500">Your Campus.</span>
          </h1>
          <p className="text-xl text-brand-highlight max-w-2xl mx-auto mb-12 leading-relaxed">
            Unify your university department, batch, or club under one powerful, premium platform. Built for the next generation of students.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/create" className="w-full sm:w-auto px-8 py-4 bg-brand-magenta text-white font-black rounded-2xl shadow-xl shadow-brand-magenta/20 hover:bg-brand-pink transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
              Start Free Trial <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Showcase */}
      <section className="relative z-10 py-24 border-y border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Users className="text-brand-magenta mb-6" size={32} />
              <h3 className="text-xl font-bold mb-3">Student Profiles</h3>
              <p className="text-brand-highlight leading-relaxed">Rich member directories with academic history, skills, links, and portfolios.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <HardDrive className="text-brand-pink mb-6" size={32} />
              <h3 className="text-xl font-bold mb-3">Resource Hub</h3>
              <p className="text-brand-highlight leading-relaxed">Centralized archives for notes, books, and class recordings with Cloudflare R2.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Shield className="text-purple-500 mb-6" size={32} />
              <h3 className="text-xl font-bold mb-3">Secure & Private</h3>
              <p className="text-brand-highlight leading-relaxed">Invite-code protected networks ensure only verified students gain access.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Simple, Transparent Pricing</h2>
          <p className="text-brand-highlight text-lg">Choose the perfect plan for your network's size.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={cn(
                "relative p-8 rounded-[2.5rem] border backdrop-blur-xl flex flex-col",
                plan.popular 
                  ? "bg-brand-magenta/10 border-brand-magenta/30 shadow-2xl shadow-brand-magenta/20 transform md:-translate-y-4" 
                  : "bg-white/5 border-white/10"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-magenta text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}
              {plan.icon}
              <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-brand-highlight font-medium mb-1">/ {plan.duration}</span>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3">
                    <Check className="text-brand-pink shrink-0 mt-0.5" size={18} />
                    <span className="text-gray-300 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                to="/create" 
                className={cn(
                  "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm text-center transition-all",
                  plan.popular 
                    ? "bg-brand-magenta text-white hover:bg-brand-pink" 
                    : "bg-white/10 text-white hover:bg-white/20"
                )}
              >
                Choose {plan.name}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 text-center text-brand-highlight">
        <p className="font-medium">&copy; {new Date().getFullYear()} UniNet Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
