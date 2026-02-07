"use client";
import React, { useState } from 'react';
import { 
  Download, ShieldAlert, Settings2, Terminal, Zap, X, Key, Globe, 
  Fingerprint, CheckCircle2, AlertCircle, Activity, Upload, Cloud
} from 'lucide-react';
import { complianceSettings } from '@/lib/complianceStore';

export default function SchemaPage() {
  const [dangerZone, setDangerZone] = useState(complianceSettings.forceNonCompliant);
  const [isTyping, setIsTyping] = useState(false);
  const [visibleLines, setVisibleLines] = useState(4);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔄 NEW: Dynamic Policy State (Starts with your defaults, but can be overwritten)
  const [policies, setPolicies] = useState([
    { key: "ContainsPHI", requirement: "Mandatory", desc: "Flag for Protected Health Information", status: "Active" },
    { key: "DataClassification", requirement: "Mandatory", desc: "PHI, PII, or Internal usage", status: "Active" },
    { key: "Environment", requirement: "Mandatory", desc: "Prod, NonProd, or Dev scoping", status: "Active" },
  ]);

  const logLines = [
    { text: "// Initialize healthcare_tags.json version 1.2", color: "text-slate-500" },
    { text: "[INFO] Terraform plan generated successfully.", color: "text-blue-600" },
    { text: "[INFO] Mapping policy keys to Subscription...", color: "text-blue-600" },
    { text: "[SUCCESS] Policy Assignments synchronized.", color: "text-green-700 font-bold" }
  ];

  // 📂 NEW: Handle File Upload (Simulates loading a custom customer policy)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsTyping(true);
      // In a real app, you'd parse JSON/CSV here. 
      // For testing, we'll "simulate" adding a custom customer tag.
      setTimeout(() => {
        setPolicies(prev => [
          ...prev, 
          { key: "Customer_CostCenter", requirement: "Mandatory", desc: "Imported from custom policy", status: "Active" }
        ]);
        setIsTyping(false);
      }, 1500);
    }
  };

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
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-10">
      
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
          {/* UPLOAD BUTTON: This is how customers bring their own policy */}
          <label className="flex items-center gap-2 px-4 py-2 border border-emerald-200 text-emerald-600 rounded-lg text-sm font-bold hover:bg-emerald-50 transition-all shadow-sm cursor-pointer">
            <Upload size={18} /> Import Policy
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition-all shadow-sm"
          >
            <Zap size={18} /> Connect Azure
          </button>
        </div>
      </header>

      {/* 📋 LIVE POLICY AUDIT TABLE (Now renders the dynamic 'policies' state) */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-blue-600" />
            <h3 className="font-bold text-compliance-blue text-sm uppercase tracking-wider">Active Policy Schema</h3>
          </div>
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">HIPAA v2.1 Compliance</span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white text-[10px] font-bold text-clinical-grey uppercase border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-center w-16">Status</th>
              <th className="px-6 py-3">Tag Key</th>
              <th className="px-6 py-3">Requirement</th>
              <th className="px-6 py-3">Logic Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
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
                    policy.requirement === 'Mandatory' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {policy.requirement}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-clinical-grey">
                  {policy.desc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ⚠️ SIMULATION CONTROL */}
      {/* ... (Keep your existing Danger Zone code here) ... */}

      {/* 📄 ANIMATED TERMINAL */}
      {/* ... (Keep your existing Terminal code here) ... */}
      
      {/* 🟦 AZURE MODAL */}
      {/* ... (Keep your existing Modal code here) ... */}
    </div>
  );
}