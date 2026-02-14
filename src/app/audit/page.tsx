"use client";
import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, Download, Loader2, 
  CheckCircle2, Search, Filter, Lock, Unlock, Zap, Wrench 
} from 'lucide-react';
import { useSession } from "next-auth/react";

export default function AuditVault() {
  const { data: session } = useSession();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFixing, setIsFixing] = useState<string | null>(null); // NEW: Track which resource is being auto-tagged
  const [reportReady, setReportReady] = useState(false);
  const [isCertified, setIsCertified] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [realResources, setRealResources] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, compliant: 0, score: 0 });

  // Original Registry for the Footer Display
  const tagRegistry = [
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
  ];

  const getAzureCreds = () => ({
    tenantId: localStorage.getItem("azure_tenant_id"),
    clientId: localStorage.getItem("azure_client_id"),
    clientSecret: localStorage.getItem("azure_client_secret"),
    subscriptionId: localStorage.getItem("azure_subscription_id"),
  });

  const startAudit = async () => {
    setIsGenerating(true);
    const creds = getAzureCreds();
    
    // 🔗 BRIDGE: Get the 2-line overwrite from the Policy Engine
    const savedPolicy = localStorage.getItem("phiTag_active_policy");
    const activeSchema = savedPolicy ? JSON.parse(savedPolicy) : null;

    try {
      const res = await fetch('/api/azure/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...creds, 
          schema: activeSchema // 👈 This tells the API to only check for your overwritten tags
        })
      });
      const data = await res.json();
      if (res.ok) {
        setRealResources(data.details || []);
        setStats({ total: data.totalResources, compliant: data.compliantResources, score: data.complianceScore });
        setReportReady(true);
      }
    } catch (e) { alert("Scan failed"); } finally { setIsGenerating(false); }
  };

  // --- NEW: AUTO-TAG FUNCTION ---
  const handleAutoFix = async (resourceId: string, missingTags: string[]) => {
    setIsFixing(resourceId);
    const creds = getAzureCreds();
    try {
      const res = await fetch('/api/azure/remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId, missingTags, ...creds })
      });
      if (res.ok) {
        await startAudit(); // Re-scan to show the green "Compliant" status
      }
    } catch (e) { alert("Fix failed"); } finally { setIsFixing(null); }
  };

  const filteredResources = realResources.filter(res => 
    res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* 🏛️ HEADER (RESTORED ORIGINAL DESIGN + AUTO-FIX BUTTON) */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-blue-600" size={32} />
            Audit Vault
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Compliance Score: <span className="text-blue-600 font-bold">{stats.score}%</span></p>
        </div>
        
        <div className="flex gap-3">
           {/* If scan is done and score < 100, show a "Bulk Fix" option */}
           {reportReady && stats.score < 100 && (
            <button 
              onClick={() => {
                const firstFail = realResources.find(r => !r.isCompliant);
                if(firstFail) handleAutoFix(firstFail.id, firstFail.missingRequirements);
              }}
              className="bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all flex items-center gap-2"
            >
              <Wrench size={18} /> Auto-Fix Next
            </button>
          )}

          {!reportReady ? (
            <button 
              onClick={startAudit}
              disabled={isGenerating}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
              {isGenerating ? "Scanning..." : "Run HIPAA Audit"}
            </button>
          ) : (
            <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 p-2 rounded-xl">
               <div className="flex items-center gap-2 px-3 py-1 text-emerald-700 text-xs font-bold">
                 <CheckCircle2 size={16} /> Audit Complete
               </div>
               <button onClick={() => setReportReady(false)} className="bg-white text-slate-600 border border-slate-200 px-4 py-1.5 rounded-lg text-xs font-black uppercase hover:bg-slate-50">
                 Re-Scan
               </button>
            </div>
          )}
        </div>
      </header>

      {/* 📊 INVENTORY SECTION (RESTORED FILTERS) */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-bold text-slate-900">Live Infrastructure State</h2>
          {!isCertified ? (
            <button onClick={() => setIsCertified(true)} className="text-xs font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 px-3 py-2 rounded-lg transition-all flex items-center gap-2">
              <CheckCircle2 size={14} /> Certify Current State
            </button>
          ) : (
            <button onClick={() => setIsCertified(false)} className="text-xs font-bold text-slate-400 flex items-center gap-2">
              <Lock size={14} /> Inventory Locked (Signed by {session?.user?.name || 'Authorized User'})
            </button>
          )}
        </div>

        <div className={`bg-white p-4 rounded-2xl border border-slate-200 flex gap-4 transition-all ${isCertified ? 'opacity-50 grayscale' : ''}`}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              disabled={isCertified}
              placeholder="Filter by resource or owner..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button disabled={isCertified} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* TABLE (RESTORED ORIGINAL STYLE + NEW ACTION COLUMN) */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Missing Tags</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {realResources.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-slate-400 italic">No live data. Click "Run HIPAA Audit".</td>
                </tr>
              ) : (
                filteredResources.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="text-sm font-bold text-slate-700">{res.name}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-medium">{res.type}</div>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <div className="flex flex-wrap justify-center gap-1">
                        {res.missingRequirements?.map((tag: string) => (
                          <span key={tag} className="bg-red-50 text-red-500 text-[8px] font-bold px-1.5 py-0.5 rounded border border-red-100">{tag}</span>
                        ))}
                       </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {res.isCompliant ? (
                        <span className="text-emerald-500 text-sm font-black uppercase">Compliant</span>
                      ) : (
                        <button 
                          onClick={() => handleAutoFix(res.id, res.missingRequirements)}
                          disabled={isFixing === res.id}
                          className="text-[10px] font-black bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 ml-auto"
                        >
                          {isFixing === res.id ? <Loader2 size={12} className="animate-spin" /> : <Wrench size={12} />}
                          AUTO-TAG
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 📜 RESTORED MANIFESTO FOOTER SECTION */}
      <section className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
        <div className="relative z-10 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-2">
              <span className="bg-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Governance Schema</span>
              <h2 className="text-3xl font-black italic tracking-tight">The Healthcare Tagging Manifesto</h2>
              <p className="text-slate-400 text-sm max-w-xl leading-relaxed font-medium">Download our technical guide on enforcing 100% financial traceability using the 16 mandatory keys.</p>
            </div>
            <a href="/healthcare-tagging-manifesto.pdf" target="_blank" className="bg-white/10 border border-white/20 hover:bg-white/20 px-6 py-4 rounded-2xl text-xs font-black uppercase flex items-center gap-2 shrink-0">
              <Download size={18} /> Download Manifesto (PDF)
            </a>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {tagRegistry.map((tag, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex flex-col gap-3 group hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-center">
                  <code className="text-blue-400 font-black text-xs">{tag.key}</code>
                  {tag.required && <span className="text-[8px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Required</span>}
                </div>
                <div className="text-[11px] font-medium leading-relaxed">
                  {tag.values ? (
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-slate-500 mr-1">Values:</span>
                      {tag.values.map(v => <span key={v} className="text-slate-300 bg-white/5 px-1.5 py-0.5 rounded">"{v}"</span>)}
                    </div>
                  ) : <div className="text-slate-500">Pattern: <span className="text-blue-200 italic font-mono">{tag.pattern}</span></div>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={240} /></div>
      </section>
    </div>
  );
}