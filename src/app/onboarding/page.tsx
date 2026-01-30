"use client";
import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Key, 
  ExternalLink 
} from 'lucide-react';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText("az ad sp create-for-rbac --name PHItag-Engine --role 'Tag Contributor'");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 🏁 PROGRESS BAR */}
      <div className="flex items-center gap-4 mb-12">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-100">
            <div className={`h-full transition-all duration-500 ${step >= s ? 'bg-blue-600' : 'bg-transparent'}`} />
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-8">
          <header className="space-y-3">
            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Phase 01</h2>
            <h1 className="text-4xl font-black text-compliance-blue tracking-tight">Authorize PHItag</h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              To manage your tags, we need a "Service Principal" with <span className="text-slate-900 font-bold">Tag Contributor</span> access. This follows the Principle of Least Privilege.
            </p>
          </header>

          <div className="bg-slate-900 rounded-3xl p-6 text-slate-300 font-mono text-sm relative group">
            <p className="mb-2 text-slate-500 text-[10px] uppercase font-bold tracking-widest">Azure CLI Command</p>
            <code className="text-emerald-400">
              az ad sp create-for-rbac --name PHItag-Engine --role 'Tag Contributor'
            </code>
            <button 
              onClick={copyCommand}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex gap-4 items-start">
             <ShieldCheck className="text-blue-600 shrink-0" />
             <p className="text-xs text-blue-800 leading-relaxed font-medium">
               <strong>Security Note:</strong> This role only allows PHItag to edit metadata. We cannot read your database contents, access VMs, or view patient records.
             </p>
          </div>

          <button 
            onClick={() => setStep(2)}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
          >
            I've Created the Principal <ArrowRight size={16} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
          <header className="space-y-3">
            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Phase 02</h2>
            <h1 className="text-4xl font-black text-compliance-blue tracking-tight">Enter Credentials</h1>
            <p className="text-slate-500 font-medium">Connect your Azure Tenant to the Governance Engine.</p>
          </header>

          <div className="grid gap-6">
            {['Tenant ID', 'Client ID', 'Client Secret'].map((label) => (
              <div key={label} className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
                <div className="relative">
                  <input 
                    type={label === 'Client Secret' ? 'password' : 'text'}
                    placeholder={`Enter ${label}...`}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                  />
                  <Key size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => setStep(1)}
              className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Back
            </button>
            <button 
              onClick={() => setStep(3)}
              className="flex-[2] py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100"
            >
              Verify Connection
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center space-y-8 animate-in zoom-in-95">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-50">
            <Check size={48} strokeWidth={3} />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-compliance-blue tracking-tight">Securely Connected</h1>
            <p className="text-slate-500 font-medium">We've successfully handshaked with your Azure Tenant.</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 max-w-sm mx-auto text-left space-y-3">
             <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-tighter">
               <span>Resources Discovered</span>
               <span className="text-slate-900 font-mono">1,240</span>
             </div>
             <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-tighter">
               <span>Compliance Score</span>
               <span className="text-amber-600 font-mono">32% (Needs Sync)</span>
             </div>
          </div>
          <button 
             className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
             onClick={() => window.location.href = '/'}
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}