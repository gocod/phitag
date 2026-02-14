"use client";
import React, { useState } from 'react';
import { 
  BookOpen, ShieldCheck, ChevronRight, Search, Zap, ArrowRight, 
  FileSearch, Rocket, Key, Copy, CheckCircle, Settings, 
  CloudSync, LayoutDashboard, Database, Save, Terminal
} from 'lucide-react';
import Link from 'next/link';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<'getting-started' | 'help'>('getting-started');
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // Data from your Healthcare Tagging Manifesto
  const policyJson = [
    { key: "BusinessUnit", req: "Required", values: "Clinical, Research, Billing, Operations, IT", detail: "Workload owner for chargeback" },
    { key: "ContainsPHI", req: "Required", values: "Yes, No", detail: "Identifies if protected health info is present" },
    { key: "HIPAAZone", req: "Conditional", values: "Secure, General", detail: "Required if ContainsPHI = Yes" },
    { key: "EncryptionRequired", req: "Conditional", values: "Yes", detail: "Enforces encryption at rest/transit" },
    { key: "CostCenter", req: "Required", values: "CC-Clinical, CC-Research, CC-Billing, CC-IT", detail: "Healthcare cost allocation" },
    { key: "DataClassification", req: "Required", values: "PHI, PII, Internal, Public", detail: "Sensitivity of data" },
    { key: "Owner", req: "Required", values: "email@healthco.com", detail: "Responsible technical owner" }
  ].filter(item => item.key.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(policyJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 px-4">
      {/* HEADER & TAB NAVIGATION */}
      <section className="text-center space-y-6 pt-10">
        <h1 className="text-4xl font-black text-slate-900 flex justify-center items-center gap-4">
          <BookOpen className="text-blue-600" size={40} /> Knowledge Hub
        </h1>
        <div className="flex justify-center p-1 bg-slate-100 rounded-2xl w-fit mx-auto border border-slate-200">
          <button onClick={() => setActiveTab('getting-started')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'getting-started' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
            <Rocket size={14} className="inline mr-2" /> Workflow Guide
          </button>
          <button onClick={() => setActiveTab('help')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'help' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
            <Search size={14} className="inline mr-2" /> Tag Reference
          </button>
        </div>
      </section>

      {activeTab === 'getting-started' ? (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
          {/* STEP 1: SERVICE PRINCIPAL */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm grid lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-sm">1</div>
                <h2 className="text-xl font-black text-slate-900">Sign-In & Azure Setup</h2>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">Login via SSO and navigate to <b>Settings</b>. You must input your Azure Service Principal IDs to enable cloud communication.</p>
              <div className="flex gap-2 flex-wrap">
                {['Tenant ID', 'Client ID', 'Secret', 'Sub ID'].map(id => (
                  <span key={id} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold border border-blue-100">{id}</span>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 rounded-2xl p-5 font-mono text-[11px] text-emerald-400">
              <p className="text-slate-500 mb-2"># Terminal: Create Access</p>
              <p>az ad sp create-for-rbac \</p>
              <p className="pl-4">--role "Tag Contributor" \</p>
              <p className="pl-4">--scopes /subscriptions/{"{ID}"}</p>
            </div>
          </div>

          {/* STEP 2: THE BUTTON WORKFLOW */}
          <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-200">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3"><Database className="text-emerald-500" /> Policy Engine Workflow</h2>
            
            <div className="grid gap-4">
              {[
                { icon: <CloudSync />, label: "Sync to Cloud", color: "bg-blue-600", desc: "Triggers a live scan of Azure Resource Groups and current tag states." },
                { icon: <Save />, label: "Save Policy", color: "bg-slate-900", desc: "Uploads your local requirement logic to the engine's memory." },
                { icon: <Rocket />, label: "Deploy Config", color: "bg-emerald-500", desc: "Activates enforcement. All data in Audit Vault will now reflect this policy." }
              ].map((step, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-6 items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className={`${step.color} text-white w-full md:w-44 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2`}>
                    {step.icon} {step.label}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search Manifesto Keys..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <button onClick={handleCopy} className="bg-white px-6 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
              {copied ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />} {copied ? "Copied" : "Copy JSON"}
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {policyJson.map((tag, i) => (
              <div key={i} className="p-5 bg-white rounded-2xl border border-slate-200 hover:shadow-md transition-all">
                <div className="flex justify-between mb-2">
                  <h4 className="font-bold text-slate-900 text-sm">{tag.key}</h4>
                  <span className="text-[9px] font-black uppercase text-blue-600">{tag.req}</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-3">{tag.detail}</p>
                <div className="bg-slate-50 p-2 rounded-lg text-[9px] font-mono text-slate-400 border border-slate-100 truncate">{tag.values}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}