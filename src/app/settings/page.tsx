"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Settings, Key, ShieldAlert, 
  Save, RefreshCcw, ExternalLink,
  ChevronRight, Database, Eye, EyeOff, Hand, CheckCircle2, XCircle, LifeBuoy
} from 'lucide-react';

export default function SettingsPage() {
  // State for all Azure fields
  const [subscriptionId, setSubscriptionId] = useState('05a44b97-8004-4607-a03b-88ae8a9c98ae');
  const [tenantId, setTenantId] = useState('72f988bf-86f1-41af-91ab-2d7cd011db47');
  const [clientId, setClientId] = useState('492088bf-99f1-41af-22ab-2d7cd011db99');
  const [clientSecret, setClientSecret] = useState('');
  const [mode, setMode] = useState<'audit' | 'enforce'>('audit');
  
  // UX States
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [lastVerified, setLastVerified] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const secretInputRef = useRef<HTMLInputElement>(null);

  // Load all settings from browser storage on page load
  useEffect(() => {
    const savedSub = localStorage.getItem('azure_subscription_id');
    const savedTenant = localStorage.getItem('azure_tenant_id');
    const savedClient = localStorage.getItem('azure_client_id');
    const savedSecret = localStorage.getItem('azure_client_secret');
    const savedMode = localStorage.getItem('enforcement_mode');
    const savedVerified = localStorage.getItem('last_verified_timestamp');

    if (savedSub) setSubscriptionId(savedSub);
    if (savedTenant) setTenantId(savedTenant);
    if (savedClient) setClientId(savedClient);
    if (savedSecret) setClientSecret(savedSecret);
    if (savedMode) setMode(savedMode as 'audit' | 'enforce');
    if (savedVerified) setLastVerified(savedVerified);
  }, []);

  const handleFieldChange = (setter: Function, value: string) => {
    setter(value);
    setHasChanges(true);
    setTestResult('idle'); 
  };

  const handleRotateSecret = () => {
    setClientSecret('');
    setHasChanges(true);
    secretInputRef.current?.focus();
  };

  // 🧪 TEST CONNECTION LOGIC
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult('idle');
    try {
      const res = await fetch('/api/azure/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, clientId, clientSecret }),
      });
      const data = await res.json();
      if (data.success) {
        const timestamp = new Date().toLocaleString();
        setTestResult('success');
        setLastVerified(timestamp);
        localStorage.setItem('last_verified_timestamp', timestamp);
        
        // Success state stays for 4 seconds then reverts to allow re-testing
        setTimeout(() => setTestResult('idle'), 4000);
      } else {
        setTestResult('error');
        console.error("Validation failed:", data.error);
      }
    } catch (err) {
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    localStorage.setItem('azure_subscription_id', subscriptionId);
    localStorage.setItem('azure_tenant_id', tenantId);
    localStorage.setItem('azure_client_id', clientId);
    localStorage.setItem('azure_client_secret', clientSecret);
    localStorage.setItem('enforcement_mode', mode);
    
    setIsSaving(false);
    setHasChanges(false);
    alert("SaaS Configuration Updated!");
  };

  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-slate-500 mt-2 font-medium">Configure Azure connectivity and security protocols.</p>
        </div>
        <Link 
          href="/onboarding" 
          className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline mb-1 cursor-pointer"
        >
          Re-run Setup Wizard <ChevronRight size={12} />
        </Link>
      </header>

      {/* 🔐 AZURE CONNECTION */}
      <section className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm transition-all duration-300">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white text-blue-600 rounded-xl shadow-sm border border-slate-100">
              <RefreshCcw size={20} className={isSaving || isTesting ? "animate-spin" : ""} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Azure Service Principal</h2>
              <p className="text-[10px] text-slate-400 font-medium">Status: {hasChanges ? 'Unsaved Changes' : 'Production Ready'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* 🧪 DYNAMIC TEST BUTTON / SUCCESS BADGE */}
            {testResult !== 'success' ? (
              <button 
                onClick={handleTestConnection}
                disabled={isTesting || !clientSecret}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                  testResult === 'error' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isTesting ? <RefreshCcw size={10} className="animate-spin" /> : testResult === 'error' ? <XCircle size={10} /> : null}
                {isTesting ? 'Validating...' : testResult === 'error' ? 'Failed' : 'Test Connection'}
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 animate-in zoom-in duration-300">
                <CheckCircle2 size={10} /> Connection Live
              </div>
            )}

            <div className="flex flex-col items-end gap-1">
              <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border transition-colors ${hasChanges ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
                {hasChanges ? 'Draft' : 'Connected'}
              </span>
              {lastVerified && !hasChanges && (
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mr-1">
                  Verified: {lastVerified}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Database size={10} /> Active Subscription ID
            </label>
            <input 
              type="text" 
              value={subscriptionId} 
              onChange={(e) => handleFieldChange(setSubscriptionId, e.target.value)}
              placeholder="eb7010-..."
              className="w-full p-4 bg-blue-50/30 border border-blue-100 rounded-2xl text-xs font-mono text-blue-900 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" 
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Directory (Tenant) ID</label>
              <input 
                type="text" 
                value={tenantId}
                onChange={(e) => handleFieldChange(setTenantId, e.target.value)}
                placeholder="72f988bf-..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Application (Client) ID</label>
              <input 
                type="text" 
                value={clientId}
                onChange={(e) => handleFieldChange(setClientId, e.target.value)}
                placeholder="492088bf-..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Client Secret
              </label>
              
              <div className="group relative">
                <div className="flex items-center gap-1 text-[9px] font-bold text-blue-500 cursor-help bg-blue-50 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors">
                  <LifeBuoy size={10} /> Where do I find this?
                </div>
                <div className="absolute bottom-full right-0 mb-2 w-64 p-4 bg-slate-900 text-white text-[11px] rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                  <div className="space-y-2 font-medium">
                    <p className="text-blue-400 font-bold uppercase text-[9px]">Azure Portal Path:</p>
                    <p>1. Go to <strong className="text-white">Microsoft Entra ID</strong></p>
                    <p>2. Select <strong className="text-white">App Registrations</strong></p>
                    <p>3. Choose your PHItag app</p>
                    <p>4. Click <strong className="text-white">Certificates & Secrets</strong></p>
                    <p className="text-amber-400 italic">Note: Only the 'Value' (not Secret ID) should be pasted here.</p>
                  </div>
                  <div className="absolute top-full right-4 border-8 border-transparent border-t-slate-900"></div>
                </div>
              </div>
            </div>

            <div className="relative group/secret">
              <input 
                ref={secretInputRef}
                type={showSecret ? "text" : "password"}
                value={clientSecret}
                onChange={(e) => handleFieldChange(setClientSecret, e.target.value)}
                placeholder="Enter client secret value"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20" 
              />
              <button 
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-24 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button 
                type="button"
                onClick={handleRotateSecret}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:text-blue-800 transition-all cursor-pointer"
              >           
                Rotate
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
              onClick={() => handleFieldChange(setMode, 'audit')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                mode === 'audit' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
             >
                Audit Only
             </button>
             <button 
              onClick={() => handleFieldChange(setMode, 'enforce')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
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
          <a 
            href={subscriptionId 
              ? `https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.KeyVault%2Fvaults/subscriptionId/${subscriptionId}?tenantId=${tenantId}` 
              : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-[10px] font-black uppercase tracking-[0.2em] pt-4 transition-all flex items-center gap-2 inline-flex ${
              !subscriptionId ? 'text-slate-600 cursor-not-allowed opacity-50' : 'text-blue-400 hover:text-white cursor-pointer'
            }`}
            onClick={(e) => !subscriptionId && e.preventDefault()}
          >
            Manage Key Vault Link <ExternalLink size={12} />
          </a>
        </div>
      </section>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-6 border-t border-slate-100 pt-8 items-center">
        <button 
          onClick={() => window.location.reload()}
          className="group flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
        >       
          Discard Changes
        </button>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`group relative flex items-center gap-3 px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer ${
            hasChanges ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105' : 'bg-slate-800 text-white'
          }`}
        >
          <div className={`absolute -left-12 transition-all duration-300 ${hasChanges ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
            <Hand size={22} className="text-blue-500 fill-blue-500/10 rotate-90" />
          </div>
          {isSaving ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}