"use client";
import React from 'react';
import Link from 'next/link';
import { complianceSettings } from '@/lib/complianceStore';
import { ArrowUpRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Home() {
  // Logic: If Danger Zone is ON, compliance is low. If OFF, it's high.
  const isFail = complianceSettings.forceNonCompliant;
  const complianceScore = isFail ? "32%" : "98%";
  const statusColor = isFail ? "text-red-600" : "text-green-600";
  const borderColor = isFail ? "border-red-200 bg-red-50/30" : "border-green-200 bg-green-50/30";

  return (
    <div className="max-w-5xl space-y-10 animate-in fade-in duration-700">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-compliance-blue rounded-2xl p-10 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome to PHItag</h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            Azure HIPAA governance is {isFail ? "currently compromised." : "running optimally."} 
            Review your resources and maintain clinical compliance standards.
          </p>
          <div className="flex gap-4">
            <Link href="/schema" className="bg-white text-compliance-blue px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-all shadow-md">
              Review Schema
            </Link>
          </div>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </section>

      {/* DYNAMIC STATS SECTION */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-clinical-grey mb-6 opacity-60 font-mono">
          Environment Snapshot
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold uppercase text-clinical-grey opacity-70">Total Resources</p>
            <p className="text-4xl font-bold text-compliance-blue mt-2">128</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold uppercase text-clinical-grey opacity-70">PHI Workloads</p>
            <p className="text-4xl font-bold text-compliance-blue mt-2">42</p>
          </div>

          <div className={`p-6 rounded-xl border shadow-sm transition-all duration-500 ${borderColor}`}>
            <div className="flex justify-between items-start">
              <p className={`text-xs font-bold uppercase opacity-70 ${statusColor}`}>Compliance Score</p>
              {isFail ? <AlertCircle className="text-red-500" size={18} /> : <CheckCircle2 className="text-green-500" size={18} />}
            </div>
            <p className={`text-4xl font-bold mt-2 ${statusColor}`}>{complianceScore}</p>
            <p className="text-[10px] mt-2 font-medium opacity-60 flex items-center gap-1">
              <ArrowUpRight size={12} /> vs Last Audit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
