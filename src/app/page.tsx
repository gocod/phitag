"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Zap, 
  ArrowRight, 
  Activity, 
  FileCheck,
  CheckCircle2,
  ArrowUpRight,
  Loader2
} from 'lucide-react';

export default function HomePage() {
  // 1. Setup state for live data
  const [stats, setStats] = useState({ total: 0, score: 0, phidatasets: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // 2. Fetch data from your Azure Scan API on mount
  useEffect(() => {
    async function getLiveAzureStats() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/azure/scan', { method: 'POST' });
        const data = await response.json();

        // Adjust these keys based on your exact API response structure
        setStats({
          total: data.totalResources || 0,
          score: data.complianceScore || 0,
          phidatasets: data.phiCount || 0
        });
      } catch (error) {
        console.error("Azure Scan Failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
    getLiveAzureStats();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-20 animate-in fade-in duration-700">
      
      {/* 🚀 HERO SECTION */}
      <section className="text-center pt-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-4">
          <Activity size={14} /> Built for HIPAA Compliance
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Cloud Governance for <br />
          <span className="text-blue-600">Modern Healthcare</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          PHItag automates the tedious process of resource tagging in Azure, 
          ensuring your PHI data is always identified, encrypted, and audit-ready.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/schema" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2 group">
            Launch Policy Engine <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/docs" className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm">
            View Documentation
          </Link>
        </div>
      </section>

      {/* 📊 ENVIRONMENT SNAPSHOT SCORE CARDS */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
        <div className="flex items-center gap-2 mb-6 text-slate-400">
           <div className="h-px flex-1 bg-slate-100"></div>
           <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
             {isLoading && <Loader2 size={12} className="animate-spin" />}
             {isLoading ? "Scanning Azure..." : "Live Environment Snapshot"}
           </span>
           <div className="h-px flex-1 bg-slate-100"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Total Resources</p>
            <p className="text-4xl font-bold text-slate-900 mt-2">
              {isLoading ? "..." : stats.total}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">PHI Workloads</p>
            <p className="text-4xl font-bold text-slate-900 mt-2">
              {isLoading ? "..." : stats.phidatasets}
            </p>
          </div>

          <div className={`p-6 rounded-2xl border transition-all duration-500 shadow-sm relative overflow-hidden ${isLoading ? 'bg-slate-50 border-slate-100' : 'bg-green-50/30 border-green-100'}`}>
            <div className="flex justify-between items-start">
              <p className={`text-xs font-bold uppercase ${isLoading ? 'text-slate-400' : 'text-green-600'}`}>Compliance Score</p>
              {!isLoading && <CheckCircle2 size={18} className="text-green-500" />}
            </div>
            <p className={`text-4xl font-bold mt-2 ${isLoading ? 'text-slate-300' : 'text-green-600'}`}>
              {isLoading ? "0%" : `${stats.score}%`}
            </p>
            {!isLoading && (
              <p className="text-[10px] mt-2 font-medium text-green-600/60 flex items-center gap-1">
                <ArrowUpRight size={12} /> Live Scan Result
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 🏥 THE PROBLEM / SOLUTION GRID */}
      <section className="grid md:grid-cols-3 gap-8">
        {[
          { icon: <ShieldCheck size={24} />, title: "Eliminate Tag Drift", color: "bg-red-50 text-red-600", desc: "Stop worrying about developers forgetting mandatory tags. Our engine detects and alerts on violations." },
          { icon: <Lock size={24} />, title: "PHI Identification", color: "bg-blue-50 text-blue-600", desc: "Automatically verify if resources containing PHI meet your organization's encryption standards." },
          { icon: <FileCheck size={24} />, title: "Audit Readiness", color: "bg-green-50 text-green-600", desc: "Generate Terraform-ready policy exports and compliance reports to satisfy auditors instantly." }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center`}>
              {item.icon}
            </div>
            <h3 className="font-bold text-lg text-slate-900">{item.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* 📊 GLOBAL SCORECARD BLOCK */}
      <section className="bg-slate-900 rounded-3xl p-10 text-white overflow-hidden relative">
        <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold italic tracking-tight">Bridging the gap between <br />IT and Compliance.</h2>
            <p className="text-slate-400 leading-relaxed">
              Healthcare cloud environments are complex. PHItag provides a unified dashboard where Compliance Officers and DevOps Engineers speak the same language.
            </p>
            <ul className="space-y-3 text-sm font-medium">
              <li className="flex items-center gap-2"><Zap size={16} className="text-blue-400" /> Automated Azure Resource Discovery</li>
              <li className="flex items-center gap-2"><Zap size={16} className="text-blue-400" /> Customizable Metadata Schema</li>
              <li className="flex items-center gap-2"><Zap size={16} className="text-blue-400" /> Infrastructure-as-Code Policy Export</li>
            </ul>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Environment Pulse</span>
              <span className="text-green-400 text-xs font-bold flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-slate-500' : 'bg-green-400 animate-pulse'}`}></span>
                {isLoading ? "Scanning..." : "Active"}
              </span>
            </div>
            <div className="space-y-4">
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                   className="h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out" 
                   style={{ width: `${stats.score}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Compliance Health</span>
                <span className="font-bold">{isLoading ? "---" : `${stats.score}%`}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full"></div>
      </section>
    </div>
  );
}