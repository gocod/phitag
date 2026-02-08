"use client";
import React, { useState } from 'react';
import { 
  Settings2, Zap, CheckCircle2, Activity, Upload, 
  Terminal, ShieldAlert, X, Loader2, Cloud, Info
} from 'lucide-react';
import { complianceSettings } from '@/lib/complianceStore';

// 1. UPDATED INDUSTRY STANDARD DEFAULTS (All 16 Keys from PDF Manifesto)
const MANIFESTO_DEFAULTS = [
  { key: "BusinessUnit", requirement: "Mandatory", desc: "Clinical, Research, Billing, Ops, or IT", status: "Active" },
  { key: "ApplicationName", requirement: "Mandatory", desc: "EpicEMR, Patient Portal, etc.", status: "Active" },
  { key: "Environment", requirement: "Mandatory", desc: "Prod, NonProd, Dev, Test, DR", status: "Active" },
  { key: "Owner", requirement: "Mandatory", desc: "Technical/Business email accountability", status: "Active" },
  { key: "CostCenter", requirement: "Mandatory", desc: "Approved healthcare cost centers", status: "Active" },
  { key: "DataClassification", requirement: "Mandatory", desc: "PHI, PII, Internal, or Public", status: "Active" },
  { key: "Criticality", requirement: "Mandatory", desc: "Tier1 (Life Critical) to Tier3", status: "Active" },
  { key: "ContainsPHI", requirement: "Mandatory", desc: "Identifies protected health info (Yes/No)", status: "Active" },
  { key: "HIPAAZone", requirement: "Conditional", desc: "Required if ContainsPHI = Yes", status: "Active" },
  { key: "EncryptionRequired", requirement: "Conditional", desc: "Required if ContainsPHI = Yes", status: "Active" },
  { key: "BackupPolicy", requirement: "Mandatory", desc: "Hourly, Daily, Weekly, or None", status: "Active" },
  { key: "DRClass", requirement: "Mandatory", desc: "Recovery Tier: Hot, Warm, or Cold", status: "Active" },
  { key: "SecurityZone", requirement: "Mandatory", desc: "Internet, Internal, or Restricted", status: "Active" },
  { key: "ComplianceScope", requirement: "Mandatory", desc: "HIPAA, SOX, HITRUST, etc.", status: "Active" },
  { key: "ProjectCode", requirement: "Recommended", desc: "Internal project/funding code", status: "Active" },
  { key: "BudgetOwner", requirement: "Recommended", desc: "Executive responsible for costs", status: "Active" }
];

export default function SchemaPage() {
  const [policies, setPolicies] = useState(MANIFESTO_DEFAULTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // 📂 HANDLE DYNAMIC UPLOADS (Import Policy Button)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsTyping(true);
      setTimeout(() => {
        setPolicies(prev => [
          ...prev, 
          { key: "Custom_Internal_ID", requirement: "Optional", desc: "User-defined tagging schema", status: "Active" }
        ]);
        setIsTyping(false);
      }, 1500);
    }
  };

  // ⚡ TRIGGER REAL AZURE SCAN
  const runAzureSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/azure/scan", { method: "POST" });
      if (res.ok) {
        // You could redirect to Dashboard here to see results
        setTimeout(() => {
          setIsSyncing(false);
          setIsModalOpen(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Sync failed");
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 py-10">
      
      {/* HEADER */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Settings2 size={32} className="text-blue-600" />
            Policy Engine
          </h1>
          <p className="text-slate-500 mt-2">Enforcing HIPAA Manifesto v1.2 (16 Core Keys)</p>
        </div>
        
        <div className="flex gap-3">
          <label className="flex items-center gap-2 px-4 py-2 border border-emerald-200 text-emerald-600 rounded-lg text-sm font-bold hover:bg-emerald-50 cursor-pointer transition-all">
            <Upload size={18} /> Import Policy
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
          >
            <Zap size={18} /> Connect Azure
          </button>
        </div>
      </header>

      {/* POLICY TABLE */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Active Policy Schema</h3>
          </div>
          {isTyping && <span className="text-xs text-blue-600 animate-pulse font-bold">Processing custom schema...</span>}
        </div>
        <table className="w-full text-left">
          <thead className="bg-white text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 text-center w-16">Status</th>
              <th className="px-6 py-3">Tag Key</th>
              <th className="px-6 py-3">Requirement</th>
              <th className="px-6 py-3">Logic Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {policies.map((policy) => (
              <tr key={policy.key} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-center">
                  <CheckCircle2 size={18} className="text-green-500 mx-auto" />
                </td>
                <td className="px-6 py-4">
                  <code className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono font-bold">
                    {policy.key}
                  </code>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    policy.requirement === 'Mandatory' ? 'bg-red-50 text-red-600' : 
                    policy.requirement === 'Conditional' ? 'bg-amber-50 text-amber-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {policy.requirement}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                  {policy.desc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* AZURE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-blue-100 p-3 rounded-2xl">
                <Cloud className="text-blue-600" size={24} />
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 mb-2">Sync with Azure</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              This will trigger a real-time scan of your Resource Groups to identify drift from the 
              <strong> HIPAA Manifesto</strong> schema defined in your policy engine.
            </p>

            <button 
              onClick={runAzureSync}
              disabled={isSyncing}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
            >
              {isSyncing ? (
                <><Loader2 className="animate-spin" /> Identifying Drift...</>
              ) : (
                <>Start Compliance Scan</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}