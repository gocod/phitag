"use client";
import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, Download, Loader2, 
  CheckCircle2, Search, Filter, Lock, Unlock, Zap 
} from 'lucide-react';
import { useSession } from "next-auth/react";

export default function AuditVault() {
  const { data: session } = useSession();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [isCertified, setIsCertified] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const startAudit = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setReportReady(true);
    }, 2500);
  };

  const tagRegistry = [
    { key: "BusinessUnit", values: ["Clinical", "Research", "Billing", "Operations", "IT"], required: true },
    { key: "ApplicationName", values: ["EpicEMR", "PatientPortal", "BillingSystem", "LabSystem", "Analytics"], required: true },
    { key: "Environment", values: ["Prod", "NonProd", "Dev", "Test", "DR"], required: true },
    { key: "Owner", pattern: "firstname.lastname@healthco.com", required: true },
    { key: "CostCenter", values: ["CC-Clinical", "CC-Research", "CC-Billing", "CC-IT"], required: true },
    { key: "DataClassification", values: ["PHI", "PII", "Internal", "Public"], required: true },
    { key: "Criticality", values: ["Tier1", "Tier2", "Tier3"], required: true },
    { key: "ContainsPHI", values: ["Yes", "No"], required: true },
    { key: "HIPAAZone", values: ["Secure", "General"], dependency: "ContainsPHI == Yes" },
    { key: "EncryptionRequired", values: ["Yes"], dependency: "ContainsPHI == Yes" },
    { key: "BackupPolicy", values: ["Hourly", "Daily", "Weekly", "None"], required: true },
    { key: "DRClass", values: ["Hot", "Warm", "Cold"], required: true },
    { key: "SecurityZone", values: ["Internet", "Internal", "Restricted"], required: true },
    { key: "ComplianceScope", values: ["HIPAA", "SOX", "HITRUST", "None"], required: true },
    { key: "ProjectCode", values: ["EHR-Modernization", "PatientApp", "Billing2026"], required: false },
    { key: "BudgetOwner", values: ["finance@healthco.com"], required: false }
  ];

  const resources = [
    { id: '1', name: 'sql-patient-db', type: 'Azure SQL', status: 'Compliant', phi: 'Yes' },
    { id: '2', name: 'web-portal-vm', type: 'Virtual Machine', status: 'Non-Compliant', phi: 'Yes' },
    { id: '3', name: 'storage-logs-gen2', type: 'Storage Account', status: 'Compliant', phi: 'No' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* 🏛️ HEADER */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-blue-600" size={32} />
            Audit Vault
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Generate HIPAA evidence and certify resource inventory.</p>
        </div>
        
        {!reportReady ? (
          <button 
            onClick={startAudit}
            disabled={isGenerating}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
            {isGenerating ? "Scanning..." : "Generate HIPAA Report"}
          </button>
        ) : (
          <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 p-2 rounded-xl">
             <div className="flex items-center gap-2 px-3 py-1 text-emerald-700 text-xs font-bold">
               <CheckCircle2 size={16} /> Report Ready
             </div>
             <button className="bg-white text-emerald-600 border border-emerald-200 px-4 py-1.5 rounded-lg text-xs font-black uppercase hover:bg-emerald-600 hover:text-white transition-all">
               Download PDF
             </button>
          </div>
        )}
      </header>

      {/* 📊 INVENTORY SECTION */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-bold text-slate-900">Inventory Certification</h2>
          {!isCertified ? (
            <button onClick={() => setIsCertified(true)} className="text-xs font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 px-3 py-2 rounded-lg transition-all flex items-center gap-2">
              <CheckCircle2 size={14} /> Certify Current State
            </button>
          ) : (
            <button onClick={() => setIsCertified(false)} className="text-xs font-bold text-slate-400 flex items-center gap-2 hover:text-slate-600 transition-colors">
              <Lock size={14} /> Inventory Locked (Signed by {session?.user?.name || 'Authorized User'})
            </button>
          )}
        </div>

        {/* SEARCH & FILTERS */}
        <div className={`bg-white p-4 rounded-2xl border border-slate-200 flex gap-4 transition-all ${isCertified ? 'opacity-50 grayscale' : ''}`}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              disabled={isCertified}
              placeholder="Filter by resource or owner..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button disabled={isCertified} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">PHI Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {resources.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="text-sm font-bold text-slate-700">{res.name}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-medium">{res.type}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${res.phi === 'Yes' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                      {res.phi === 'Yes' ? 'PHI' : 'PUBLIC'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`text-sm font-black ${res.status === 'Compliant' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {res.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 📜 DETAILED TAG REGISTRY & MANIFESTO */}
      <section className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
        <div className="relative z-10 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-2">
              <span className="bg-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                Governance Schema
              </span>
              <h2 className="text-3xl font-black italic tracking-tight italic">The Healthcare Tagging Manifesto</h2>
              <p className="text-slate-400 text-sm max-w-xl leading-relaxed font-medium">
                Download our technical guide on enforcing 100% financial traceability using the 16 mandatory keys for a HIPAA-compliant Azure environment.
              </p>
            </div>
            <a 
              href="/healthcare-tagging-manifesto.pdf" 
              target="_blank"
              className="bg-white/10 border border-white/20 hover:bg-white/20 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0"
            >
              <Download size={18} /> Download Manifesto (PDF)
            </a>
          </div>

          {/* DYNAMIC REGISTRY GRID */}
          <div className="grid md:grid-cols-2 gap-4">
            {tagRegistry.map((tag, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex flex-col gap-3 group hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-center">
                  <code className="text-blue-400 font-black text-xs">{tag.key}</code>
                  {tag.required && (
                    <span className="text-[8px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                      Required
                    </span>
                  )}
                </div>
                
                <div className="text-[11px] font-medium leading-relaxed">
                  {tag.values ? (
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-slate-500 mr-1">Values:</span>
                      {tag.values.map(v => (
                        <span key={v} className="text-slate-300 bg-white/5 px-1.5 py-0.5 rounded">"{v}"</span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-500">
                      Pattern: <span className="text-blue-200 italic font-mono">{tag.pattern}</span>
                    </div>
                  )}
                </div>

                {tag.dependency && (
                  <div className="text-[10px] text-emerald-400 font-bold italic flex items-center gap-1.5 mt-1 border-t border-white/5 pt-2">
                    <Zap size={12} fill="currentColor" /> Logic: {tag.dependency}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <Zap size={240} />
        </div>
      </section>
    </div>
  );
}