"use client";
import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, Download, Loader2, 
  CheckCircle2, Search, Filter, Lock, Unlock 
} from 'lucide-react';

export default function AuditVault() {
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

  const resources = [
    { id: '1', name: 'sql-patient-db', type: 'Azure SQL', status: 'Compliant', phi: 'Yes' },
    { id: '2', name: 'web-portal-vm', type: 'Virtual Machine', status: 'Non-Compliant', phi: 'Yes' },
    { id: '3', name: 'storage-logs-gen2', type: 'Storage Account', status: 'Compliant', phi: 'No' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* 🏛️ HEADER */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-compliance-blue tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-blue-600" size={32} />
            Audit Vault
          </h1>
          <p className="text-slate-500 mt-2">Generate HIPAA evidence and certify resource inventory.</p>
        </div>
        
        {/* REPORT GENERATION TRIGGER */}
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
          <h2 className="text-xl font-bold text-compliance-blue">Inventory Certification</h2>
          {!isCertified ? (
            <button onClick={() => setIsCertified(true)} className="text-xs font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 px-3 py-2 rounded-lg transition-all flex items-center gap-2">
              <CheckCircle2 size={14} /> Certify Current State
            </button>
          ) : (
            <button onClick={() => setIsCertified(false)} className="text-xs font-bold text-slate-400 flex items-center gap-2">
              <Unlock size={14} /> Inventory Locked (Signed by Jenny)
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
          <button disabled={isCertified} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50">
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

      {/* 📜 HISTORICAL ARCHIVE */}
      <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex items-center justify-between">
        <div className="flex gap-6 items-center">
          <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
            <FileText className="text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold">Historical Archive</h3>
            <p className="text-xs text-slate-400">Access previous certified inventories for annual audits.</p>
          </div>
        </div>
        <button className="text-xs font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors">
          Browse Archive
        </button>
      </section>
    </div>
  );
}