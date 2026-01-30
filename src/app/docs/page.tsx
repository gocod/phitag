"use client";
import React from 'react';
import { 
  BookOpen, ShieldCheck, Landmark, 
  ChevronRight, Search, FileText, Zap 
} from 'lucide-react';

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
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      {/* 🔍 SEARCH HEADER */}
      <section className="text-center space-y-6 py-10">
        <h1 className="text-4xl font-black text-compliance-blue tracking-tight">User Manual & Help Center</h1>
        <p className="text-slate-500 max-w-xl mx-auto">Everything you need to master healthcare cloud governance and financial accountability.</p>
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search for articles (e.g. 'How to certify inventory')..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </section>

      {/* 📚 CATEGORY GRID */}
      <div className="grid md:grid-cols-3 gap-8">
        {categories.map((cat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-6">{cat.icon}</div>
            <h3 className="font-bold text-lg text-slate-900 mb-4">{cat.title}</h3>
            <ul className="space-y-3">
              {cat.articles.map((art, j) => (
                <li key={j}>
                  <button className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-2 group text-left">
                    <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                    {art}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 📄 FEATURED GUIDE */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Essential Reading
          </div>
          <h2 className="text-3xl font-bold italic">The Healthcare Tagging Manifesto</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Download our comprehensive guide on implementing 100% financial traceability within a HIPAA-compliant Azure environment.
          </p>
          <button className="flex items-center gap-2 text-blue-400 font-bold hover:text-white transition-colors pt-4">
            <FileText size={18} /> Download Manifesto (PDF)
          </button>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-600/20 to-transparent" />
      </div>
    </div>
  );
}