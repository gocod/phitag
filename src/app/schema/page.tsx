"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings2, Zap, Activity, Upload, 
  Trash2, RotateCcw, Loader2, Cloud, 
  FileCode, FileText 
} from 'lucide-react';

// FULL 16-KEY MANIFESTO FROM PDF
const MANIFESTO_DEFAULTS = [
  { key: "BusinessUnit", values: "Clinical, Research, Billing, Operations, IT", requirement: "Mandatory" },
  { key: "ApplicationName", values: "EpicEMR, Patient Portal, Billing System, LabSystem", requirement: "Mandatory" },
  { key: "Environment", values: "Prod, NonProd, Dev, Test, DR", requirement: "Mandatory" },
  { key: "Owner", values: "firstname.lastname@healthco.com", requirement: "Mandatory" },
  { key: "CostCenter", values: "CC-Clinical, CC-Research, CC-Billing, CC-IT", requirement: "Mandatory" },
  { key: "DataClassification", values: "PHI, PII, Internal, Public", requirement: "Mandatory" },
  { key: "Criticality", values: "Tier1, Tier2, Tier3", requirement: "Mandatory" },
  { key: "ContainsPHI", values: "Yes, No", requirement: "Mandatory" },
  { key: "HIPAAZone", values: "Secure, General", requirement: "Required if PHI=Yes" },
  { key: "EncryptionRequired", values: "Yes", requirement: "Required if PHI=Yes" },
  { key: "BackupPolicy", values: "Hourly, Daily, Weekly, None", requirement: "Mandatory" },
  { key: "DRClass", values: "Hot, Warm, Cold", requirement: "Mandatory" },
  { key: "SecurityZone", values: "Internet, Internal, Restricted", requirement: "Mandatory" },
  { key: "ComplianceScope", values: "HIPAA, SOX, HITRUST, None", requirement: "Mandatory" },
  { key: "ProjectCode", values: "EHR-Modernization, PatientApp, Billing2026", requirement: "Recommended" },
  { key: "BudgetOwner", values: "finance@healthco.com", requirement: "Recommended" }
];

export default function SchemaPage() {
  const [policies, setPolicies] = useState(MANIFESTO_DEFAULTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("phiTag_active_policy");
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        const migrated = parsed.map((p: any) => ({
          ...p,
          values: p.values || p.desc || p.details || "N/A"
        }));
        setPolicies(migrated);
      } catch (e) { console.error(e); }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("phiTag_active_policy", JSON.stringify(policies));
  }, [policies, isLoaded]);

  // EXPORT 1: TERRAFORM
  const exportTerraform = () => {
    const header = `# Healthcare Tagging Manifesto\n# Total Keys: ${policies.length}\n\n`;
    const tags = policies.map(p => `    "${p.key}" = "string" # Values: ${p.values} (${p.requirement})`).join("\n");
    const content = `${header}variable "resource_tags" {\n  type = map(string)\n  description = "Standardized tags for healthcare compliance"\n  default = {\n${tags}\n  }\n}`;
    downloadFile(content, "healthcare_policy.tf", "text/plain");
  };

  // EXPORT 2: AZURE POLICY JSON (New!)
  const exportAzurePolicy = () => {
    const policyDefinition = {
      properties: {
        displayName: `Enforce Healthcare Tags (${policies.length} Keys)`,
        policyType: "Custom",
        mode: "Indexed",
        description: "Denies resource creation if mandatory healthcare tags are missing.",
        metadata: { category: "Tags" },
        policyRule: {
          if: {
            anyOf: policies
              .filter(p => p.requirement.toLowerCase().includes('mandatory'))
              .map(p => ({
                field: `tags['${p.key}']`,
                exists: "false"
              }))
          },
          then: { effect: "deny" }
        }
      }
    };
    downloadFile(JSON.stringify(policyDefinition, null, 2), "azure_enforcement.json", "application/json");
  };

  const downloadFile = (content: string, fileName: string, type: string) => {
    const blob = new Blob([content], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          setPolicies(json.map(item => ({
            key: item.key || item.TagKey || "Unknown",
            values: item.values || item.value || item.desc || item.details || "N/A", 
            requirement: item.requirement || "Mandatory"
          })));
        }
      } catch (err) { alert("Invalid JSON"); }
      finally { 
        setIsProcessing(false); 
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  if (!isLoaded) return null;

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-8">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
            <Settings2 size={36} className="text-blue-600" />
            Policy Engine
          </h1>
          <p className="text-slate-500 font-medium mt-1">Healthcare Manifesto: {policies.length} Active Rules</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setPolicies(MANIFESTO_DEFAULTS)} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50">
            <RotateCcw size={16} /> Reset
          </button>
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-emerald-200 text-emerald-700 bg-emerald-50 rounded-xl text-sm font-bold hover:bg-emerald-100">
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Overwrite
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept=".json" />
          </label>
          {/* New Azure Policy Download Button */}
          <button onClick={exportAzurePolicy} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-sm font-bold hover:bg-blue-100 shadow-sm transition-all">
            <FileText size={16} /> Azure Policy JSON
          </button>
          <button onClick={exportTerraform} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black shadow-lg">
            <FileCode size={16} /> Export Terraform
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg">
            <Zap size={16} /> Connect Azure
          </button>
        </div>
      </header>

      <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <Activity size={20} className="text-blue-600" />
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Active Manifesto</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Key</th>
                <th className="px-8 py-5">Values</th>
                <th className="px-8 py-5">Requirement</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {policies.map((p, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-5 font-bold text-blue-700">
                    <code className="bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">{p.key}</code>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-600 font-medium">{p.values}</td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                      p.requirement?.toLowerCase().includes('recommended') ? 'bg-slate-50 text-slate-500 border-slate-100' : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {p.requirement.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => setPolicies(policies.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 p-2">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] max-w-md w-full p-10 shadow-2xl text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              {isScanning ? <Loader2 size={32} className="text-blue-600 animate-spin" /> : <Cloud className="text-blue-600" size={32} />}
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">{isScanning ? "Scanning Azure..." : "Connect Azure"}</h3>
            <p className="text-slate-500 text-sm mb-8">Scan cloud for tag compliance drifts.</p>
            <div className="space-y-3">
               <button onClick={() => { setIsScanning(true); setTimeout(() => { setIsScanning(false); setIsModalOpen(false); alert("Complete"); }, 2000); }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">Begin Compliance Scan</button>
               <button onClick={() => setIsModalOpen(false)} className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}