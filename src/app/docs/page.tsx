"use client";
import React, { useState } from 'react';
import { 
  BookOpen, ShieldCheck, Landmark, 
  ChevronRight, Search, Zap,
  ArrowRight, FileSearch, Rocket,
  Key, FileJson, Download, Copy, CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'help' | 'getting-started'>('help');
  const [copied, setCopied] = useState(false);

  const policyJson = [
    { "key": "BusinessUnit", "requirement": "Mandatory", "values": ["Clinical", "Research", "Billing", "Operations", "IT", "n-a"] },
    { "key": "ApplicationName", "requirement": "Mandatory", "values": ["EpicEMR", "Patient Portal", "Billing System", "LabSystem", "Analytics"] },
    { "key": "Environment", "requirement": "Mandatory", "values": ["Prod", "NonProd", "Dev", "Test", "DR"] },
    { "key": "DataClassification", "requirement": "Mandatory", "values": ["PHI", "PII", "Internal", "Public"] },
    { "key": "ContainsPHI", "requirement": "Mandatory", "values": ["Yes", "No"] },
    { "key": "HIPAAZone", "requirement": "Conditional", "values": ["Secure", "General"] },
    { "key": "EncryptionRequired", "requirement": "Conditional", "values": ["Yes"] },
    { "key": "ComplianceScope", "requirement": "Mandatory", "values": ["HIPAA", "SOX", "HITRUST", "None"] },
    { "key": "CostCenter", "requirement": "Mandatory", "values": ["CC-Clinical", "CC-Research", "CC-Billing", "CC-IT"] }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(policyJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = [
    {
      title: "The 16-Key Standard",
      icon: <ShieldCheck className="text-blue-600" size={24} />,
      articles: ["Understanding PHI Tags", "CostCenter Validation Rules", "Owner Attribution Logic"]
    },
    {
      title: "Compliance Workflows",
      icon: <Landmark className="text-emerald-600" size={24} />,
      articles: ["Monthly Certification Guide", "Generating HIPAA Evidence", "Handling Policy Drift"]
    },
    {
      title: "Platform Governance",
      icon: <Zap className="text-amber-600" size={24} />,
      articles: ["Role Based Access Control", "Setting up Azure Connectivity", "Policy Enforcement Modes"]
    }
  ];

  const filteredCategories = categories.map(cat => ({
    ...cat,
    articles: cat.articles.filter(art => art.toLowerCase().includes(searchQuery.toLowerCase()))
  })).filter(cat => cat.articles.length > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* 🔍 HEADER SECTION */}
      <section className="text-center space-y-6 pt-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex justify-center items-center gap-4">
          <BookOpen className="text-blue-600" size={40} />
          Knowledge Hub
        </h1>
        
        {/* TABS SWITCHER */}
        <div className="flex justify-center p-1 bg-slate-100 rounded-2xl w-fit mx-auto border border-slate-200">
          <button 
            onClick={() => setActiveTab('help')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'help' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Search size={14} /> Help Center
          </button>
          <button 
            onClick={() => setActiveTab('getting-started')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'getting-started' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Rocket size={14} /> Getting Started
          </button>
        </div>
      </section>

      {activeTab === 'help' ? (
        <>
          {/* SEARCH BAR */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for articles (e.g. 'PHI')..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-600 font-medium"
            />
          </div>

          {/* AUDIT VAULT REDIRECT */}
          <section className="bg-blue-600 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-100 border border-blue-500">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2 bg-white/20 w-fit px-3 py-1 rounded-full border border-white/10">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Live Governance Registry</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black italic tracking-tight">Looking for the Tagging Manifesto?</h2>
                <p className="text-blue-100 text-sm max-w-md leading-relaxed font-medium">
                  The 16 mandatory keys, official PDF, and inventory tools have moved to the Audit Vault.
                </p>
              </div>
              <Link href="/audit" className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all group shadow-xl">
                Access Audit Vault <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <FileSearch size={220} />
            </div>
          </section>

          {/* 📚 CATEGORY GRID */}
          <div className="grid md:grid-cols-3 gap-8">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all hover:border-blue-200">
                  <div className="mb-6">{cat.icon}</div>
                  <h3 className="font-bold text-lg text-slate-900 mb-4">{cat.title}</h3>
                  <ul className="space-y-3">
                    {cat.articles.map((art, j) => {
                      const isAzureSetup = art === "Setting up Azure Connectivity";
                      const slug = art.toLowerCase().replace(/ /g, '-');
                      
                      return (
                        <li key={j}>
                          {isAzureSetup ? (
                            <button 
                              onClick={() => {
                                setActiveTab('getting-started');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2 group text-left font-bold"
                            >
                              <ChevronRight size={14} className="text-blue-300 group-hover:translate-x-1 transition-transform" />
                              {art}
                              <Rocket size={12} className="ml-1 animate-pulse" />
                            </button>
                          ) : (
                            <Link 
                              href={`/docs/${slug}`} 
                              className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-2 group text-left font-medium"
                            >
                              <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                              {art}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium italic">No articles found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* STEP 1: SERVICE PRINCIPAL */}
          <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-200">
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex-1 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-blue-200">1</div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Azure Service Principal</h2>
                </div>

                <div className="space-y-6">
                  <div className="relative pl-8 border-l-2 border-blue-100">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white"></div>
                    <h4 className="font-bold text-slate-900">App Registration</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Search for <strong>App Registrations</strong> in the Azure portal. Click <strong>+ New Registration</strong>. 
                      Name it <code className="bg-slate-200 px-1 rounded text-blue-700">PHItag-Connector</code>.
                    </p>
                  </div>

                  <div className="relative pl-8 border-l-2 border-blue-100">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-200 border-4 border-white"></div>
                    <h4 className="font-bold text-slate-900">Generate Client Secret</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Inside your new app, go to <strong>Certificates & secrets</strong>. Click <strong>+ New client secret</strong>.
                    </p>
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 items-start">
                      <Zap className="text-amber-600 shrink-0" size={18} />
                      <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                        <strong>CRITICAL:</strong> Copy the <span className="underline">Value</span> immediately. 
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="bg-slate-900 rounded-3xl p-8 text-emerald-400 font-mono text-xs shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Key size={80} className="text-slate-400" />
                  </div>
                  <p className="text-slate-500 mb-6 uppercase tracking-widest font-black text-[10px]">Manual Setup Terminal</p>
                  <div className="space-y-4 relative z-10">
                    <p className="text-slate-400 italic"># 1. Define variables</p>
                    <p>$APP_NAME = "PHItag-Connector"</p>
                    <p className="text-slate-400 italic mt-4"># 2. Create Service Principal & Assign Role</p>
                    <p className="text-blue-400">az ad sp create-for-rbac \</p>
                    <p className="pl-4">--name $APP_NAME \</p>
                    <p className="pl-4">--role "Tag Contributor" \</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: LOAD SCHEMA */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-xl">
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black">2</div>
                  <h2 className="text-2xl font-black text-slate-900">Import Tagging Schema</h2>
                  <p className="text-slate-600 text-sm max-w-xl">Use our <strong>HIPAA Starter Template</strong> derived from your Manifesto.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
                    {copied ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />} 
                    {copied ? "Copied" : "Copy JSON"}
                  </button>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                <div className="relative bg-slate-900 rounded-2xl p-6 overflow-hidden">
                  <pre className="text-blue-300 font-mono text-[11px] leading-relaxed overflow-x-auto h-48">
                    {JSON.stringify(policyJson, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>

{/* STEP 3: POLICY ENGINE WORKFLOW (Light Mode Version) */}
<section className="bg-white rounded-[3rem] p-10 text-slate-900 border-2 border-slate-100 shadow-xl overflow-hidden relative">
  <div className="flex flex-col lg:flex-row gap-12 items-center">
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-lg">3</div>
        <h2 className="text-3xl font-black tracking-tight">Policy Engine Workflow</h2>
      </div>
      
      <p className="text-slate-600 leading-relaxed font-medium">
        The engine operates on a <strong>Scan → Evaluate → Enforce</strong> loop. It ingests cloud metadata and compares it against the 16 mandatory keys.
      </p>

      <div className="space-y-4">
        {[
          { title: "Discovery", desc: "Real-time hooks detect new resource creation in Azure/AWS.", color: "bg-blue-50 text-blue-700" },
          { title: "Logic Check", desc: "Evaluates 'ContainsPHI' status to trigger conditional tags like 'HIPAAZone'.", color: "bg-emerald-50 text-emerald-700" },
          { title: "Remediation", desc: "Automatically alerts owners or applies 'Quarantine' tags to non-compliant assets.", color: "bg-purple-50 text-purple-700" }
        ].map((step, i) => (
          <div key={i} className={`flex gap-4 p-5 rounded-2xl border border-slate-100 shadow-sm ${step.color}`}>
            <CheckCircle className="shrink-0" size={24} />
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wide">{step.title}</h4>
              <p className="text-sm opacity-90 leading-snug">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="flex-1 w-full bg-slate-50 rounded-3xl p-8 border border-slate-200">
      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Execution Logic (High Contrast)</h4>
      <div className="space-y-4 font-mono text-[13px]">
        <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-sm">
          <span className="text-blue-600 font-bold italic">IF</span> <span className="text-slate-700">(resource.tags.ContainsPHI == "Yes")</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-sm ml-6">
          <span className="text-emerald-600 font-bold italic">REQUIRE</span> <span className="text-slate-700">EncryptionRequired == "Yes"</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 font-bold italic">ELSE</span> <span className="text-slate-700">Apply General Governance</span>
        </div>
      </div>
    </div>
  </div>
</section>

          {/* STEP 4: UX RECS */}
          <div className="grid md:grid-cols-2 gap-8">
             <div className="p-8 rounded-[2.5rem] bg-emerald-50 border border-emerald-100">
                <Key className="text-emerald-600 mb-4" size={28} />
                <h4 className="font-bold text-slate-900 mb-2">Connection Heartbeat</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">Verify your Azure credentials instantly.</p>
             </div>
             <div className="p-8 rounded-[2.5rem] bg-amber-50 border border-amber-100">
                <FileJson className="text-amber-600 mb-4" size={28} />
                <h4 className="font-bold text-slate-900 mb-2">Drift Alerts</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">Configure Slack or Email notifications for missing tags.</p>
             </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="text-center pt-8 border-t border-slate-100">
        <p className="text-slate-400 text-sm">
          Need a custom BAA? <Link href="/support" className="text-blue-600 font-bold hover:underline">Contact Compliance Support</Link>
        </p>
      </div>
    </div>
  );
}