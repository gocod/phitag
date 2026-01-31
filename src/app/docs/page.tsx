"use client";
import React from 'react';
import { 
  BookOpen, ShieldCheck, Landmark, 
  ChevronRight, Search, FileText, Zap,
  ArrowRight, FileSearch
} from 'lucide-react';
import Link from 'next/link';

export default function DocsPage() {
  const categories = [
    {
      title: "The 16-Key Standard",
      icon: <ShieldCheck className="text-blue-600" size={24} />,
      articles: ["Understanding PHI Tags", "CostCenter Validation Rules", "Owner Attribution Logic"]
    },
    {
      title: "Compliance Workflows",
      icon: <Landmark className="text-emerald-600" size={24} />,
      articles: ["Monthly Certification Guide", "Generating HIPAA Evidence", "Handling Policy Drift"]
    },
    {
      title: "Platform Governance",
      icon: <Zap className="text-amber-600" size={24} />,
      articles: ["Role Based Access Control", "Setting up Azure Connectivity", "Policy Enforcement Modes"]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* 🔍 SEARCH HEADER */}
      <section className="text-center space-y-6 py-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex justify-center items-center gap-4">
          <BookOpen className="text-blue-600" size={40} />
          User Manual & Help Center
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto font-medium text-lg">
          Everything you need to master healthcare cloud governance and financial accountability.
        </p>
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search for articles (e.g. 'How to certify inventory')..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </section>

      {/* 🚀 NEW REDIRECT BLOCK (Replaces old static manifesto block) */}
      <section className="bg-blue-600 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-100 border border-blue-500">
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2 bg-white/20 w-fit px-3 py-1 rounded-full border border-white/10">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Live Governance Registry</span>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic tracking-tight">Looking for the Tagging Manifesto?</h2>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed font-medium">
              The 16 mandatory keys[cite: 1], the official Tagging Manifesto PDF, and your inventory certification tools have moved to the Audit Vault.
            </p>
          </div>

          <Link 
            href="/audit" 
            className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all group shadow-xl"
          >
            Access Audit Vault 
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Decorative Graphic */}
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <FileSearch size={220} />
        </div>
      </section>

      {/* 📚 CATEGORY GRID */}
      <div className="grid md:grid-cols-3 gap-8">
        {categories.map((cat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <div className="mb-6">{cat.icon}</div>
            <h3 className="font-bold text-lg text-slate-900 mb-4">{cat.title}</h3>
            <ul className="space-y-3">
              {cat.articles.map((art, j) => (
                <li key={j}>
                  <button className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-2 group text-left transition-colors">
                    <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                    {art}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 📄 FOOTER HELP */}
      <div className="text-center pt-8 border-t border-slate-100">
        <p className="text-slate-400 text-sm">
          Can't find what you're looking for? <Link href="/support" className="text-blue-600 font-bold hover:underline">Contact Compliance Support</Link>
        </p>
      </div>
    </div>
  );
}