"use client";
import React, { useState } from 'react';
import { 
  Download, 
  ShieldAlert, 
  Settings2, 
  Terminal, 
  Zap, // Changed from CloudZap
  X, 
  Key, 
  Globe, 
  Fingerprint 
} from 'lucide-react';
import { complianceSettings } from '@/lib/complianceStore';

export default function SchemaPage() {
  // State Management
  const [dangerZone, setDangerZone] = useState(complianceSettings.forceNonCompliant);
  const [isTyping, setIsTyping] = useState(false);
  const [visibleLines, setVisibleLines] = useState(4);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Terminal Log Definitions
  const logLines = [
    { text: "// Initialize healthcare_tags.json version 1.2", color: "text-slate-500" },
    { text: "[INFO] Terraform plan generated successfully.", color: "text-blue-600" },
    { text: "[INFO] Mapping 16 healthcare keys to Subscription: Production-US-East...", color: "text-blue-600" },
    { text: "[SUCCESS] Policy Assignments synchronized.", color: "text-green-700 font-bold" }
  ];

  const toggleDangerZone = () => {
    const newVal = !dangerZone;
    setDangerZone(newVal);
    complianceSettings.forceNonCompliant = newVal;
  };

  const handleExport = () => {
    setIsTyping(true);
    setVisibleLines(0);
    
    logLines.forEach((_, index) => {
      setTimeout(() => {
        setVisibleLines(prev => prev + 1);
        if (index === logLines.length - 1) setIsTyping(false);
      }, (index + 1) * 400);
    });

    const fullPolicyExport = {
      metadata: {
        version: "2026-01",
        author: "Jenny (Compliance Lead)",
        environment: "Production-US-East",
        timestamp: new Date().toISOString()
      },
      policy_definition: [
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
      ]
    };

    const blob = new Blob([JSON.stringify(fullPolicyExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `healthcare_azure_policy_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* 🟦 AZURE CONNECTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-compliance-blue/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-compliance-blue p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Zap size={24} className="text-blue-400" />
                <h2 className="font-bold text-lg">Azure Connection</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs text-clinical-grey mb-4">
                Enter Service Principal credentials to authorize <strong>Jenny</strong> for automated cloud tagging.
              </p>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-clinical-grey uppercase flex items-center gap-2">
                    <Globe size={12} /> Tenant ID
                  </label>
                  <input type="text" placeholder="00000000-0000-0000-0000-000000000000" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-clinical-grey uppercase flex items-center gap-2">
                    <Fingerprint size={12} /> Client (App) ID
                  </label>
                  <input type="text" placeholder="00000000-0000-0000-0000-000000000000" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-clinical-grey uppercase flex items-center gap-2">
                    <Key size={12} /> Client Secret
                  </label>
                  <input type="password" placeholder="••••••••••••••••" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-clinical-grey hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-md">
                  Save & Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🏁 HEADER & ACTIONS */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-compliance-blue flex items-center gap-3">
            <Settings2 size={32} className="text-blue-500" />
            Policy Engine
          </h1>
          <p className="text-clinical-grey mt-2">Configure enforcement levels and sync with Azure Environment.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition-all shadow-sm"
          >
            <Zap size={18} /> Connect Azure
          </button>
          <button 
            onClick={handleExport}
            disabled={isTyping}
            className="flex items-center gap-2 px-6 py-2 bg-compliance-blue text-white rounded-lg text-sm font-bold hover:bg-blue-800 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Download size={18} className={isTyping ? "animate-bounce" : ""} /> 
            {isTyping ? "Generating..." : "Export .TFVARS"}
          </button>
        </div>
      </header>

      {/* 📊 STATS CARDS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold text-clinical-grey uppercase tracking-widest">Active Constraints</p>
          <p className="text-2xl font-bold text-compliance-blue mt-1">14 Deny / 2 Audit</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold text-clinical-grey uppercase tracking-widest">Sync Frequency</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">On-Push (CI/CD)</p>
        </div>
      </div>

      {/* ⚠️ SIMULATION CONTROL */}
      <section className={`p-8 rounded-xl border-2 transition-all duration-300 ${
        dangerZone ? 'bg-red-50 border-red-500 shadow-inner' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full transition-colors ${dangerZone ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className={`font-bold transition-colors ${dangerZone ? 'text-red-700' : 'text-compliance-blue'}`}>
                {dangerZone ? 'POLICY DRIFT ACTIVE' : 'Simulate Policy Drift'}
              </h3>
              <p className={`text-xs transition-colors ${dangerZone ? 'text-red-600 font-medium' : 'text-clinical-grey'}`}>
                {dangerZone ? 'Environment is now reporting as non-compliant.' : 'Force the environment to report failure for testing.'}
              </p>
            </div>
          </div>
          <button 
            onClick={toggleDangerZone}
            className={`h-7 w-14 rounded-full transition-colors outline-none ${dangerZone ? 'bg-red-600' : 'bg-gray-300'} relative shadow-inner`}
          >
            <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-md ${dangerZone ? 'left-8' : 'left-1'}`} />
          </button>
        </div>
      </section>

      {/* 📄 ANIMATED TERMINAL */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 shadow-md min-h-[180px]">
        <div className="flex items-center gap-2 mb-4 text-slate-400">
           <Terminal size={14} />
           <p className="text-[10px] font-bold uppercase tracking-widest">Azure Deployment Pipeline Logs</p>
        </div>
        <div className="font-mono text-sm space-y-1">
          {logLines.slice(0, visibleLines).map((line, i) => (
            <p key={i} className={`${line.color} animate-in slide-in-from-left-2 duration-300`}>
              {line.text}
            </p>
          ))}
          <p className="text-slate-400 animate-pulse">|</p>
        </div>
      </div>
    </div>
  );
}