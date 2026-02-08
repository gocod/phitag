"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Settings, Key, ShieldAlert, 
  Save, RefreshCcw, ExternalLink,
  ChevronRight, Database // Added Database icon for Subscription
} from 'lucide-react';

export default function SettingsPage() {
  const [mode, setMode] = useState<'audit' | 'enforce'>('audit');
  // Added state for Subscription ID
  const [subscriptionId, setSubscriptionId] = useState('05a44b97-8004-4607-a03b-88ae8a9c98ae');

  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-compliance-blue tracking-tight">System Settings</h1>
          <p className="text-slate-500 mt-2 font-medium">Configure Azure connectivity and security protocols.</p>
        </div>
        <Link 
          href="/onboarding" 
          className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline mb-1"
        >
          Re-run Setup Wizard <ChevronRight size={12} />
        </Link>
      </header>

      {/* 🔐 AZURE CONNECTION */}
      <section className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white text-blue-600 rounded-xl shadow-sm border border-slate-100">
              <RefreshCcw size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Azure Service Principal</h2>
              <p className="text-[10px] text-slate-400 font-medium">Last synced: Just now</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100">
            Connected
          </span>
        </div>
        
        <div className="p-8 space-y-6">
          {/* NEW: Subscription ID Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Database size={10} /> Active Subscription ID
            </label>
            <input 
              type="text" 
              value={subscriptionId} 
              onChange={(e) => setSubscriptionId(e.target.value)}
              placeholder="00000000-0000-0000-0000-000000000000"
              className="w-full p-4 bg-blue-50/30 border border-blue-100 rounded-2xl text-xs font-mono text-blue-900 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
            />
            <p className="text-[9px] text-slate-400 ml-1">The target subscription where PHI resources are deployed.</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Directory (Tenant) ID</label>
              <input type="text" readOnly value="72f988bf-86f1-41af-91ab-2d7cd011db47" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-600 outline-none cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Application (Client) ID</label>
              <input type="text" readOnly value="492088bf-99f1-41af-22ab-2d7cd011db99" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-600 outline-none cursor-not-allowed" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Secret</label>
            <div className="relative">
              <input type="password" readOnly value="••••••••••••••••" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-600 outline-none" />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:text-blue-800 transition-colors">
                Rotate Key
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 🛡️ SECURITY DEFAULTS */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
          <div className="p-2 w-fit bg-amber-50 text-amber-600 rounded-xl">
            <ShieldAlert size={20} />
          </div>
          <h3 className="font-bold text-slate-800">Enforcement Mode</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Toggle between 'Audit Only' and 'Deny Non-Compliant' for your Azure Resource Manager policies.
          </p>
          <div className="flex items-center gap-3 pt-2">
             <button 
              onClick={() => setMode('audit')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === 'audit' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
             >
               Audit Only
             </button>
             <button 
              onClick={() => setMode('enforce')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === 'enforce' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
             >
               Enforce (Deny)
             </button>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Key size={80} />
          </div>
          <h3 className="font-bold">Encryption (BYOK)</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            All audit evidence is encrypted with your Azure Key Vault. PHItag never sees your raw PHI data.
          </p>
          <button className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] pt-4 hover:text-white transition-colors flex items-center gap-2">
            Manage Key Vault Link <ExternalLink size={12} />
          </button>
        </div>
      </section>

      <div className="flex justify-end gap-4 border-t border-slate-100 pt-8">
        <button className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
          Discard Changes
        </button>
        <button className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
          <Save size={16} /> Save Settings
        </button>
      </div>
    </div>
  );
}