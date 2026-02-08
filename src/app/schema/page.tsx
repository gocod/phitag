"use client";
import React, { useState, useEffect } from 'react';
import { 
  Settings2, Zap, Activity, Upload, 
  Trash2, RotateCcw, Loader2, Cloud, 
  FileCode, FileText, ShieldAlert
} from 'lucide-react';

const MANIFESTO_DEFAULTS = [
  { key: "BusinessUnit", requirement: "Mandatory", desc: "Clinical, Research, Billing, Ops, or IT" },
  { key: "ApplicationName", requirement: "Mandatory", desc: "EpicEMR, Patient Portal, etc." },
  { key: "Environment", requirement: "Mandatory", desc: "Prod, NonProd, Dev, Test, DR" },
  { key: "Owner", requirement: "Mandatory", desc: "Technical/Business email accountability" },
  { key: "CostCenter", requirement: "Mandatory", desc: "Approved healthcare cost centers" },
  { key: "DataClassification", requirement: "Mandatory", desc: "PHI, PII, Internal, or Public" },
  { key: "Criticality", requirement: "Mandatory", desc: "Tier1 (Life Critical) to Tier3" },
  { key: "ContainsPHI", requirement: "Mandatory", desc: "Identifies protected health info (Yes/No)" },
  { key: "HIPAAZone", requirement: "Conditional", desc: "Required if ContainsPHI = Yes" },
  { key: "EncryptionRequired", requirement: "Conditional", desc: "Required if ContainsPHI = Yes" },
  { key: "BackupPolicy", requirement: "Mandatory", desc: "Hourly, Daily, Weekly, or None" },
  { key: "DRClass", requirement: "Mandatory", desc: "Recovery Tier: Hot, Warm, or Cold" },
  { key: "SecurityZone", requirement: "Mandatory", desc: "Internet, Internal, or Restricted" },
  { key: "ComplianceScope", requirement: "Mandatory", desc: "HIPAA, SOX, HITRUST, etc." },
  { key: "ProjectCode", requirement: "Recommended", desc: "Internal project/funding code" },
  { key: "BudgetOwner", requirement: "Recommended", desc: "Executive responsible for costs" }
];

export default function SchemaPage() {
  const [policies, setPolicies] = useState(MANIFESTO_DEFAULTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("phiTag_active_policy");
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setPolicies(parsed);
      } catch (e) { console.error(e); }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("phiTag_active_policy", JSON.stringify(policies));
  }, [policies, isLoaded]);

  // --- HANDLERS ---

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (Array.isArray(json)) {
            setPolicies(json);
          }
        } catch (err) {
          alert("Invalid JSON file.");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const exportTerraform = () => {
    const mandatoryTags = policies
      .filter(p => p.requirement === "Mandatory")
      .map(p => `    "${p.key}" = "string" # ${p.desc}`)
      .join("\n");

    const tfContent = `/* Generated Azure Tagging Policy */\nvariable "mandatory_tags" {\n  type = map(string)\n  default = {\n${mandatoryTags}\n  }\n}`;
    downloadFile(tfContent, "azure_policy.tf");
  };

  const exportAuditReport = () => {
    const reportHeader = `PHITag Audit Report\nGenerated: ${new Date().toLocaleString()}\nTotal Rules: ${policies.length}\n` + "=".repeat(30) + "\n\n";
    // Ensures all keys currently in state (defaulting to 16) are exported
    const reportBody = policies.map(p => `[${p.requirement}] ${p.key}: ${p.desc}`).join("\n");
    downloadFile(reportHeader + reportBody, "audit_manifesto.txt");
  };

  const downloadFile = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetToManifesto = () => {
    if (confirm("Restore the default 16 HIPAA Manifesto keys?")) {
      setPolicies(MANIFESTO_DEFAULTS);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-8">
      
      {/* HEADER: Policy Controls */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
            <Settings2 size={36} className="text-blue-600" />
            Policy Engine
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Standard: {policies.length} HIPAA Tag Requirements
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={resetToManifesto}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-all"
          >
            <RotateCcw size={16} /> Reset
          </button>

          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-emerald-200 text-emerald-700 bg-emerald-50 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all">
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Overwrite Policy
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".json" />
          </label>

          <button 
            onClick={exportTerraform}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black shadow-lg transition-all"
          >
            <FileCode size={16} /> Export Terraform
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg transition-all"
          >
            <Zap size={16} /> Connect Azure
          </button>
        </div>
      </header>

      {/* MAIN DATA TABLE */}
      <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Active Manifesto</h3>
          </div>
          <button 
            onClick={exportAuditReport} 
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <FileText size={14} className="text-blue-500" /> Generate Audit Report
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">
              <tr>
                <th className="px-8 py-4">Tag Key</th>
                <th className="px-8 py-4">Requirement</th>
                <th className="px-8 py-4">Governance Logic</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {policies.map((p) => (
                <tr key={p.key} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-5 text-sm font-bold text-blue-700">
                    <code className="bg-blue-50 px-2.5 py-1 rounded-lg">{p.key}</code>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                      p.requirement === 'Mandatory' ? 'bg-red-50 text-red-600 border-red-100' : 
                      p.requirement === 'Conditional' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      {p.requirement.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-500 font-medium leading-relaxed">
                    {p.desc}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => setPolicies(policies.filter(item => item.key !== p.key))}
                      className="cursor-pointer text-slate-300 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {policies.length === 0 && (
            <div className="p-20 text-center">
              <ShieldAlert size={48} className="mx-auto mb-4 text-slate-200" />
              <p className="text-slate-400 font-medium">No policies defined.</p>
            </div>
          )}
        </div>
      </section>

      {/* SYNC MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] max-w-md w-full p-10 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Cloud className="text-blue-600" size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Connect Azure</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Scan for these <strong>{policies.length} tag rules</strong> across your Azure subscriptions.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all"
              >
                Begin Compliance Scan
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}