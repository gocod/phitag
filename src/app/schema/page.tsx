"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings2, Zap, Activity, Upload, 
  Trash2, RotateCcw, Loader2, Cloud, 
  FileCode, FileText, Plus, Globe, FileDown 
} from 'lucide-react';

// 🏥 FULL 16-KEY MANIFESTO FROM PDF
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
  { key: "EncryptionRequired", values: "Yes, No", requirement: "Required if PHI=Yes" },
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- AZURE CREDENTIALS HELPER ---
  const getAzureCreds = () => {
    return {
      tenantId: localStorage.getItem("azure_tenant_id"),
      clientId: localStorage.getItem("azure_client_id"),
      clientSecret: localStorage.getItem("azure_client_secret"),
      subscriptionId: localStorage.getItem("azure_subscription_id"),
    };
  };

  // --- STORAGE LOGIC ---
  useEffect(() => {
    const saved = localStorage.getItem("phiTag_active_policy");
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        setPolicies(parsed.map((p: any) => ({
          ...p,
          values: p.values || p.desc || "N/A"
        })));
      } catch (e) { console.error(e); }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("phiTag_active_policy", JSON.stringify(policies));
  }, [policies, isLoaded]);

  // --- ACTIONS ---
  const addNewTag = () => {
    if (!newKey) return;
    setPolicies([...policies, { key: newKey, values: newVal || "N/A", requirement: "Mandatory" }]);
    setNewKey(""); setNewVal("");
  };

  const pushToAzure = async () => {
    setIsSyncing(true);
    const creds = getAzureCreds();

    if (!creds.clientSecret || !creds.subscriptionId || !creds.tenantId) {
        alert("❌ Azure Credentials missing! Please update System Settings.");
        setIsSyncing(false);
        return;
    }

    try {
      const res = await fetch('/api/azure/push-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          schema: policies,
          tenantId: creds.tenantId,
          clientId: creds.clientId,
          clientSecret: creds.clientSecret,
          subscriptionId: creds.subscriptionId
        })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem("phiTag_last_stats");
        alert("✅ Azure Policy Updated! Now run a scan to update your score.");
      }
      else alert(`❌ Error: ${data.error || "Failed to update Azure Policy"}`);
    } catch (e) { alert("Error connecting to API"); }
    finally { setIsSyncing(false); }
  };

  const handleScan = async () => {
    setIsScanning(true);
    const creds = getAzureCreds();

    if (!creds.clientSecret || !creds.tenantId) {
        alert("❌ Azure Credentials missing! Please update System Settings.");
        setIsScanning(false);
        return;
    }

    try {
      const res = await fetch('/api/azure/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          schema: policies,
          tenantId: creds.tenantId,
          clientId: creds.clientId,
          clientSecret: creds.clientSecret,
          subscriptionId: creds.subscriptionId
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const total = data.totalResources || 0;
        const compliant = data.compliantResources || 0;
        const score = total > 0 ? Math.round((compliant / total) * 100) : 0;
        const phiCount = data.phiCount || 0;

        const syncStats = { total, compliant, score, phiCount };
        localStorage.setItem("phiTag_last_stats", JSON.stringify(syncStats));

        alert(`✅ Scan Complete!\nCompliance Score: ${score}%\nResources Scanned: ${total}`);
        setIsModalOpen(false);
      } else {
        alert(`❌ Scan failed: ${data.error}`);
      }
    } catch (e) { 
      alert("Scan failed: Network Error"); 
    } finally { 
      setIsScanning(false); 
    }
  };

  // --- EXPORTS & UPLOADS ---
  const exportTerraform = () => {
    const tags = policies.map(p => `    "${p.key}" = "string" # ${p.requirement}`).join("\n");
    const content = `variable "resource_tags" {\n  type = map(string)\n  default = {\n${tags}\n  }\n}`;
    downloadFile(content, "healthcare_policy.tf", "text/plain");
  };

  const exportAzurePolicy = () => {
    const definition = { properties: { displayName: "Healthcare Tags", policyRule: { if: { anyOf: policies.map(p => ({ field: `tags['${p.key}']`, exists: "false" })) }, then: { effect: "deny" } } } };
    downloadFile(JSON.stringify(definition, null, 2), "azure_policy.json", "application/json");
  };

  const downloadFile = (content: string, fileName: string, type: string) => {
    const blob = new Blob([content], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  const downloadBYOPTemplate = () => {
    const template = [
      {
    "key": "BusinessUnit",
    "values": "Clinical, Research, Billing, Operations, IT",
    "requirement": "Mandatory"
  },
  {
    "key": "ApplicationName",
    "values": "EpicEMR, Patient Portal, Billing System, LabSystem",
    "requirement": "Mandatory"
  },
  {
    "key": "Environment",
    "values": "Prod, NonProd, Dev, Test, DR",
    "requirement": "Mandatory"
  },
  {
    "key": "Owner",
    "values": "firstname.lastname@healthco.com",
    "requirement": "Mandatory"
  },
  {
    "key": "CostCenter",
    "values": "CC-Clinical, CC-Research, CC-Billing, CC-IT",
    "requirement": "Mandatory"
  },
  {
    "key": "DataClassification",
    "values": "PHI, PII, Internal, Public",
    "requirement": "Mandatory"
  },
  {
    "key": "Criticality",
    "values": "Tier1, Tier2, Tier3",
    "requirement": "Mandatory"
  },
  {
    "key": "ContainsPHI",
    "values": "Yes, No",
    "requirement": "Mandatory"
  },
  {
    "key": "HIPAAZone",
    "values": "Secure, General",
    "requirement": "Required if PHI=Yes"
  },
  {
    "key": "EncryptionRequired",
    "values": "Yes, No",
    "requirement": "Required if PHI=Yes"
  },
  {
    "key": "BackupPolicy",
    "values": "Hourly, Daily, Weekly, None",
    "requirement": "Mandatory"
  },
  {
    "key": "DRClass",
    "values": "Hot, Warm, Cold",
    "requirement": "Mandatory"
  },
  {
    "key": "SecurityZone",
    "values": "Internet, Internal, Restricted",
    "requirement": "Mandatory"
  },
  {
    "key": "ComplianceScope",
    "values": "HIPAA, SOX, HITRUST, None",
    "requirement": "Mandatory"
  },
  {
    "key": "ProjectCode",
    "values": "EHR-Modernization, PatientApp, Billing2026",
    "requirement": "Recommended"
  },
  {
    "key": "BudgetOwner",
    "values": "finance@healthco.com",
    "requirement": "Recommended"
  }
    ];
    downloadFile(JSON.stringify(template, null, 2), "phiTag_Custom_Schema_Template.json", "application/json");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setPolicies(json.map((item: any) => ({
          key: item.key || "Unknown",
          values: Array.isArray(item.values) ? item.values.join(", ") : (item.values || "N/A"), 
          requirement: item.requirement || "Mandatory"
        })));
      } catch (err) { alert("Invalid JSON"); }
      finally { setIsProcessing(false); }
    };
    reader.readAsText(file);
  };

  if (!isLoaded) return null;

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-8">
      {/* 🚀 REORGANIZED HEADER */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
            <Settings2 size={36} className="text-blue-600" />
            Policy Engine
          </h1>
          <p className="text-slate-500 font-medium mt-1">Active Rules: {policies.length}</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          {/* GROUP 1: SCHEMA MANAGEMENT (BYOP) */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 items-center">
            <button 
              onClick={() => setPolicies(MANIFESTO_DEFAULTS)} 
              className="flex items-center gap-2 px-3 py-2 text-slate-500 rounded-xl text-xs font-bold hover:bg-white hover:text-red-600 transition-all"
              title="Reset to HIPAA Defaults"
            >
              <RotateCcw size={14} />
            </button>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <button 
              onClick={downloadBYOPTemplate} 
              className="flex items-center gap-1.5 px-3 py-2 text-blue-600 rounded-xl text-xs font-bold hover:bg-white transition-all"
            >
              <FileDown size={14} /> Template
            </button>
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 shadow-sm rounded-xl text-xs font-bold hover:bg-emerald-50 transition-all border border-emerald-100">
              {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} 
              Overwrite (BYOP)
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept=".json" />
            </label>
          </div>

          {/* GROUP 2: CLOUD SYNC & ACTIONS */}
          <div className="flex gap-2">
            <button onClick={pushToAzure} disabled={isSyncing} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg disabled:opacity-50 transition-all">
              {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />} Sync to Cloud
            </button>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all">
              <Zap size={14} /> Scan Azure
            </button>
          </div>

          {/* GROUP 3: EXPORTS */}
          <div className="flex gap-1 border-l border-slate-200 pl-4">
            <button onClick={exportAzurePolicy} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Azure JSON">
              <FileText size={20} />
            </button>
            <button onClick={exportTerraform} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all" title="Terraform">
              <FileCode size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* 📊 ACTIVE MANIFESTO TABLE */}
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
                    <button onClick={() => setPolicies(policies.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 p-2 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {/* ➕ ADD NEW ROW */}
              <tr className="bg-slate-50/50 border-t-2 border-blue-100">
                <td className="px-8 py-4"><input placeholder="New Key..." value={newKey} onChange={e => setNewKey(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></td>
                <td className="px-8 py-4"><input placeholder="Allowed Values..." value={newVal} onChange={e => setNewVal(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></td>
                <td className="px-8 py-4"><span className="text-[10px] font-black px-3 py-1 rounded-full border bg-red-50 text-red-600 border-red-100">MANDATORY</span></td>
                <td className="px-8 py-4 text-right"><button onClick={addNewTag} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 shadow-md transition-all"><Plus size={18} /></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ☁️ AZURE CONNECTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] max-w-md w-full p-10 shadow-2xl text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              {isScanning ? <Loader2 size={32} className="text-blue-600 animate-spin" /> : <Cloud className="text-blue-600" size={32} />}
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">{isScanning ? "Scanning Azure..." : "Connect Azure"}</h3>
            <p className="text-slate-500 text-sm mb-8">Synchronize and scan subscription for tagging drift based on your active manifesto.</p>
            <div className="space-y-3">
               <button 
                 onClick={handleScan} 
                 disabled={isScanning}
                 className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2 hover:bg-black transition-all disabled:opacity-50"
               >
                 {isScanning && <Loader2 size={20} className="animate-spin" />} 
                 {isScanning ? "Scan in Progress..." : "Begin Compliance Scan"}
               </button>
               <button 
                 onClick={() => setIsModalOpen(false)} 
                 className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
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