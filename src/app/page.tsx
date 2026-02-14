"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Lock, Zap, ArrowRight, Activity, 
  FileCheck, CheckCircle2, ArrowUpRight, Loader2
} from 'lucide-react';

export default function HomePage() {
  const [stats, setStats] = useState({ total: 0, score: 0, phidatasets: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getLiveAzureStats() {
      try {
        setIsLoading(true);

        // 1. ⚡️ QUICK LOAD: Check localStorage first for instant results
        const savedStats = localStorage.getItem("phiTag_last_stats");
        if (savedStats) {
          const parsed = JSON.parse(savedStats);
          setStats({
            total: parsed.total || 0,
            score: parsed.score || 0,
            phidatasets: parsed.phiCount || 0
          });
          // We can stop showing the "loading" skeleton since we have cached data
          setIsLoading(false); 
        }

        // 2. 🔍 LIVE REFRESH: Talk to Azure to confirm the latest state
        const savedPolicy = localStorage.getItem("phiTag_active_policy");
        const activeSchema = savedPolicy ? JSON.parse(savedPolicy) : [];

        const response = await fetch('/api/azure/scan', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            schema: activeSchema,
            // Pass credentials from storage so the API doesn't fail
            tenantId: localStorage.getItem("azure_tenant_id"),
            clientId: localStorage.getItem("azure_client_id"),
            clientSecret: localStorage.getItem("azure_client_secret"),
            subscriptionId: localStorage.getItem("azure_subscription_id"),
          }) 
        });
        
        const data = await response.json();

        if (response.ok) {
          const freshStats = {
            total: data.totalResources || 0,
            score: data.complianceScore || 0,
            phidatasets: data.phiCount || 0
          };

          setStats(freshStats);

          // Update cache for the next time we visit the page
          localStorage.setItem("phiTag_last_stats", JSON.stringify({
            ...freshStats,
            compliantResources: data.compliantResources
          }));
        }
      } catch (error) {
        console.error("Azure Scan Failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    getLiveAzureStats();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-20 animate-in fade-in duration-700 px-4">
      
      {/* 🚀 HERO SECTION */}
      <section className="text-center pt-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-4">
          <Activity size={14} /> HIPAA Compliance Engine
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Cloud Governance for <br />
          <span className="text-blue-600">Modern Healthcare</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">
          PHItag automates resource tagging in Azure, ensuring your PHI data 
          is identified and audit-ready based on your custom schema.
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
             {isLoading ? "Analyzing Policy Drift..." : "Live Environment Snapshot"}
           </span>
           <div className="h-px flex-1 bg-slate-100"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Total Resources</p>
            <p className="text-4xl font-bold text-slate-900 mt-2">
              {stats.total}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">PHI Workloads</p>
            <p className="text-4xl font-bold text-slate-900 mt-2">
              {stats.phidatasets}
            </p>
          </div>

          <div className={`p-6 rounded-2xl border transition-all duration-500 shadow-sm relative overflow-hidden ${stats.score === 100 ? 'bg-green-50/30 border-green-100' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-start">
              <p className={`text-xs font-bold uppercase ${stats.score === 100 ? 'text-green-600' : 'text-slate-400'}`}>Compliance Score</p>
              {stats.score === 100 && <CheckCircle2 size={18} className="text-green-500" />}
            </div>
            <p className={`text-4xl font-bold mt-2 ${stats.score === 100 ? 'text-green-600' : 'text-slate-900'}`}>
              {stats.score}%
            </p>
            {stats.score > 0 && (
              <p className="text-[10px] mt-2 font-medium text-blue-600/60 flex items-center gap-1">
                <ArrowUpRight size={12} /> Validated vs Active Policy
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 🏥 FEATURES SECTION (Unchanged) */}
      <section className="grid md:grid-cols-3 gap-8">
        {[
          { icon: <ShieldCheck size={24} />, title: "Eliminate Tag Drift", color: "bg-red-50 text-red-600", desc: "Stop worrying about missing tags. Our engine detects and alerts on violations against your schema." },
          { icon: <Lock size={24} />, title: "PHI Identification", color: "bg-blue-50 text-blue-600", desc: "Automatically verify if resources containing PHI meet your organization's encryption standards." },
          { icon: <FileCheck size={24} />, title: "Audit Readiness", color: "bg-green-50 text-green-600", desc: "Generate compliance reports to satisfy auditors instantly with live Azure data." }
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
              PHItag provides a unified dashboard where Compliance Officers and DevOps Engineers track tagging requirements in real-time.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Policy Health</span>
              <span className="text-green-400 text-xs font-bold flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full bg-green-400 ${!isLoading && 'animate-pulse'}`}></span>
                {isLoading ? "Syncing..." : "Active"}
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
                <span className="text-slate-400">Compliance Score</span>
                <span className="font-bold">{stats.score}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}