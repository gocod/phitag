"use client";
import React from 'react';
import { 
  BarChart3, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  Wallet, 
  FileSearch, 
  Zap,
  Repeat
} from 'lucide-react';

export default function SolutionsPage() {
  const solutions = [
    {
      title: "FinOps Accountability",
      icon: <Wallet className="text-blue-600" size={24} />,
      description: "Solve the 'Unallocated Spend' crisis. Map 100% of Azure costs to specific Cost Centers, Applications, and Owners.",
      points: [
        "Eliminate 'Shared Bucket' ambiguity",
        "Automated Chargeback CSV exports",
        "Budget-to-Owner mapping"
      ]
    },
    {
      title: "Clinical Audit Readiness",
      icon: <ShieldCheck className="text-emerald-600" size={24} />,
      description: "Automate HIPAA/HITRUST tagging evidence. Ensure every PHI-bearing resource is tagged with encryption and data class.",
      points: [
        "Real-time drift detection",
        "Auditor-ready registry exports",
        "BAA-compliant metadata storage"
      ]
    },
    {
      title: "DevOps Velocity",
      icon: <Cpu className="text-purple-600" size={24} />,
      description: "Don't slow down deployment. Integrate tagging directly into Terraform/OpenTofu pipelines with zero friction.",
      points: [
        "CI/CD native enforcement",
        "Standardized .tfvars generation",
        "Developer self-service guardrails"
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 📣 HERO SECTION */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full text-blue-700 text-xs font-bold uppercase tracking-widest">
          <Zap size={14} /> Built for Healthcare FinOps
        </div>
        <h1 className="text-5xl font-black text-compliance-blue leading-tight">
          One Registry. <span className="text-blue-600">Total Accountability.</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-3xl mx-auto leading-relaxed">
          PHItag replaces spreadsheet-based tagging policies with a proactive enforcement engine that ensures your cloud spend is always traceable and compliant.
        </p>
      </section>

      {/* 🧩 SOLUTION GRID */}
      <section className="grid md:grid-cols-3 gap-8">
        {solutions.map((item, i) => (
          <div key={i} className="group bg-white p-8 rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300">
            <div className="mb-6 p-3 bg-slate-50 w-fit rounded-2xl group-hover:bg-blue-50 transition-colors">
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-compliance-blue mb-4">{item.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">{item.description}</p>
            <ul className="space-y-3 border-t border-slate-50 pt-6">
              {item.points.map((point, pIdx) => (
                <li key={pIdx} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* 🔄 THE WORKFLOW VISUALIZER (The "Secret Sauce") */}
      <section className="bg-white rounded-[3rem] border border-slate-200 p-12 overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-extrabold text-compliance-blue leading-tight">
              The "Source of Truth" <br /> Workflow
            </h2>
            <p className="text-slate-500 leading-relaxed text-sm">
              Generic tools scan resources *after* they are created. PHItag defines the schema *before* deployment, injecting compliance directly into the IaC pipeline.
            </p>
            <button className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:gap-4 transition-all">
              Explore the technical specs <ArrowRight size={18} />
            </button>
          </div>
          
          <div className="flex-1 grid grid-cols-2 gap-4">
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center space-y-2">
                <Repeat className="mx-auto text-blue-500" />
                <p className="font-bold text-xs">Policy Sync</p>
                <p className="text-[10px] text-slate-400 uppercase">Registry to Azure</p>
             </div>
             <div className="bg-blue-600 p-6 rounded-2xl text-white text-center space-y-2">
                <BarChart3 className="mx-auto" />
                <p className="font-bold text-xs">Cost Trace</p>
                <p className="text-[10px] text-blue-200 uppercase">100% Attribution</p>
             </div>
             <div className="bg-slate-900 p-6 rounded-2xl text-white text-center space-y-2 col-span-2">
                <FileSearch className="mx-auto text-emerald-400" />
                <p className="font-bold text-xs">Audit Defense</p>
                <p className="text-[10px] text-slate-500 uppercase">Automated HIPAA Evidence</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}