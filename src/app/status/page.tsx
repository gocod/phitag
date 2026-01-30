"use client";
import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, Clock, Zap, 
  ShieldCheck, HardDrive, BarChart3, AlertTriangle 
} from 'lucide-react';

export default function StatusPage() {
  const systems = [
    { name: "Policy Enforcement Engine", status: "Operational", uptime: "99.99%" },
    { name: "Tag Registry API", status: "Operational", uptime: "100%" },
    { name: "Infrastructure Traceback Service", status: "Operational", uptime: "99.95%" },
    { name: "Audit Vault & PDF Generator", status: "Operational", uptime: "100%" },
    { name: "Azure Service Principal Connector", status: "Operational", uptime: "99.98%" },
  ];

  const bars = Array.from({ length: 30 }, (_, i) => i);

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10 animate-in fade-in duration-700">
      <header className="bg-white border border-slate-200 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white animate-ping" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-compliance-blue">All Systems Operational</h1>
            <p className="text-slate-500 text-sm italic">Verified as of Jan 2026</p>
          </div>
        </div>
        
        {/* FIX: Link is now the button itself */}
        <Link 
          href="/support" 
          className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all text-center"
        >
          Subscribe to Updates
        </Link>
      </header>

      <section className="space-y-6">
        <h2 className="text-lg font-bold text-slate-800 px-4">System Performance</h2>
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          {systems.map((sys, idx) => (
            <div key={idx} className={`p-8 ${idx !== systems.length - 1 ? 'border-b border-slate-100' : ''}`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700">{sys.name}</span>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                    {sys.status}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">{sys.uptime} uptime</span>
              </div>
              <div className="flex gap-1 h-8">
                {bars.map((bar) => (
                  <div 
                    key={bar} 
                    className={`flex-1 rounded-sm transition-all opacity-80 ${
                      bar === 14 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 px-4">Incident History</h2>
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10">
          <div className="flex gap-6 items-start">
            <div className="bg-slate-50 p-3 rounded-xl">
              <Clock size={20} className="text-slate-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 italic text-sm">January 10, 2026</h3>
              <p className="text-xs text-slate-500 mt-2">
                <span className="font-black text-amber-600 uppercase mr-2">Resolved:</span> 
                Azure API latency resolved.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}