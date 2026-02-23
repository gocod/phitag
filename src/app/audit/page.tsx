"use client";

import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, Download, Loader2, 
  CheckCircle2, Search, Filter, Lock, Zap, Wrench, 
  Database, Info
} from 'lucide-react';
import { useSession } from "next-auth/react";
import { usePermissions } from "@/hooks/usePermissions"; 
import Link from 'next/link';

export default function AuditVault() {
  const { data: session } = useSession();
  const { isUpgradeRequired, tierName } = usePermissions(session);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isFixing, setIsFixing] = useState<string | null>(null); // Track which resource is being auto-tagged
  const [reportReady, setReportReady] = useState(false);
  const [isCertified, setIsCertified] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [realResources, setRealResources] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, compliant: 0, score: 0 });

  // 🛡️ PERMISSION GATES
  const isAutoFixLocked = isUpgradeRequired('pro');
  const isDownloadLocked = isUpgradeRequired('elite');

  // 🏷️ ENRICHED REGISTRY (Preserving your full original 16-key logic)
  const tagRegistry = [
    { key: "BusinessUnit", values: ["Clinical", "Research", "Billing", "Operations", "IT"], required: true, details: "Identifies the healthcare business unit that owns the workload for chargeback." },
    { key: "ApplicationName", values: ["EpicEMR", "PatientPortal", "BillingSystem", "LabSystem", "Analytics"], required: true, details: "Application or service associated with the resource." },
    { key: "Environment", values: ["Prod", "NonProd", "Dev", "Test", "DR"], required: true, details: "Defines operational and compliance controls." },
    { key: "Owner", pattern: "firstname.lastname@healthco.com", required: true, details: "Accountable technical or business owner." },
    { key: "CostCenter", values: ["CC-Clinical", "CC-Research", "CC-Billing", "CC-IT"], required: true, details: "Used for healthcare cost allocation and budgeting." },
    { key: "DataClassification", values: ["PHI", "PII", "Internal", "Public"], required: true, details: "Defines sensitivity of data stored or processed." },
    { key: "Criticality", values: ["Tier1", "Tier2", "Tier3"], required: true, details: "Determines uptime, DR, and recovery requirements." },
    { key: "ContainsPHI", values: ["Yes", "No"], required: true, details: "Identifies if protected health information is present." },
    { key: "HIPAAZone", values: ["Secure", "General"], dependency: "ContainsPHI == Yes", details: "Defines if workload operates inside HIPAA-secured boundary." },
    { key: "EncryptionRequired", values: ["Yes"], dependency: "ContainsPHI == Yes", details: "Enforces encryption at rest and in transit for PHI." },
    { key: "BackupPolicy", values: ["Hourly", "Daily", "Weekly", "None"], required: true, details: "Determines data protection and recovery strategy." },
    { key: "DRClass", values: ["Hot", "Warm", "Cold"], required: true, details: "Disaster recovery tier." },
    { key: "SecurityZone", values: ["Internet", "Internal", "Restricted"], required: true, details: "Network exposure and security posture." },
    { key: "ComplianceScope", values: ["HIPAA", "SOX", "HITRUST", "None"], required: true, details: "Regulatory frameworks applicable to the workload." },
    { key: "ProjectCode", values: ["EHR-Modernization", "PatientApp", "Billing2026"], required: false, details: "Internal project tracking code." },
    { key: "BudgetOwner", values: ["finance@healthco.com"], required: false, details: "Financial stakeholder for the resource." }
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
    
    const savedPolicy = localStorage.getItem("phiTag_active_policy");
    const activeSchema = savedPolicy ? JSON.parse(savedPolicy) : null;

    try {
      const res = await fetch('/api/azure/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...creds, 
          schema: activeSchema 
        })
      });
      const data = await res.json();
      if (res.ok) {
        const resources = data.details || [];
        setRealResources(resources);
        
        const total = data.totalResources || resources.length;
        const compliant = data.compliantResources;
        const localScore = total > 0 ? Math.round((compliant / total) * 100) : 0;
        const phiCount = data.phiCount || 0;

        const updatedStats = { 
          total: total, 
          compliant: compliant, 
          score: localScore 
        };

        setStats(updatedStats);

        localStorage.setItem("phiTag_last_stats", JSON.stringify({
          ...updatedStats,
          phiCount: phiCount
        }));
        
        setReportReady(true);
      }
    } catch (e) { 
      alert("Scan failed"); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  const handleAutoFix = async (resourceId: string, missingTags: string[]) => {
    if (isAutoFixLocked) {
      alert("Upgrade to PRO for Auto-Remediation features.");
      return;
    }

    setIsFixing(resourceId);
    const creds = getAzureCreds();
    
    const savedPolicy = localStorage.getItem("phiTag_active_policy");
    const activeSchema = savedPolicy ? JSON.parse(savedPolicy) : [];

    const tagUpdates: Record<string, string> = {};
    
    missingTags.forEach(tagKey => {
      const policyMatch = activeSchema.find((p: any) => p.key === tagKey);
      
      if (policyMatch && policyMatch.values) {
        const firstValue = policyMatch.values.split(',')[0].trim();
        tagUpdates[tagKey] = firstValue;
      } else {
        tagUpdates[tagKey] = "TRUE"; 
      }
    });

    try {
      const res = await fetch('/api/azure/remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resourceId, 
          tagUpdates, 
          ...creds 
        })
      });

      if (res.ok) {
        await startAudit();
      } else {
        const err = await res.json();
        alert("Fix failed: " + err.error);
      }
    } catch (e) { 
      alert("Error connecting to Remediation API"); 
    } finally { 
      setIsFixing(null); 
    }
  };

  const filteredResources = realResources.filter(res => 
    res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* 🏛️ HEADER SECTION */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-blue-600" size={32} />
            Audit Vault
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Compliance Score: <span className="text-blue-600 font-bold">{stats.score}%</span> 
            <span className="mx-2 text-slate-300">|</span> 
            Plan: <span className="text-blue-600 font-bold uppercase">{tierName}</span>
          </p>
        </div>
        
        <div className="flex gap-3">
           {reportReady && stats.score < 100 && (
            <button 
              onClick={() => {
                const firstFail = realResources.find(r => !r.isCompliant);
                if(firstFail) handleAutoFix(firstFail.id, firstFail.missingRequirements);
              }}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center gap-2 ${
                isAutoFixLocked 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                : 'bg-amber-500 text-white shadow-amber-100 hover:bg-amber-600'
              }`}
            >
              {isAutoFixLocked ? <Lock size={18} /> : <Wrench size={18} />} 
              {isAutoFixLocked ? "Unlock Auto-Fix" : "Auto-Fix Next"}
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
                <div className="flex items-center gap-2 px-3 py-1 text-emerald-700 text-xs font-bold uppercase tracking-tighter">
                  <CheckCircle2 size={16} /> Audit Complete
                </div>
                <button onClick={() => setReportReady(false)} className="bg-white text-slate-600 border border-slate-200 px-4 py-1.5 rounded-lg text-xs font-black uppercase hover:bg-slate-50">
                  Re-Scan
                </button>
            </div>
          )}
        </div>
      </header>

      {/* 🏛️ ARCHITECTURE OVERVIEW */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 space-y-2">
          <ShieldCheck className="text-blue-600" size={24} />
          <h3 className="font-bold text-slate-900 text-sm">16 Mandatory Keys</h3>
          <p className="text-[10px] text-slate-600 leading-relaxed font-medium">Every resource must contain the full base-schema to be considered compliant.</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 space-y-2">
          <Zap className="text-emerald-600" size={24} />
          <h3 className="font-bold text-slate-900 text-sm">Logic Dependencies</h3>
          <p className="text-[10px] text-slate-600 leading-relaxed font-medium">Tags like HIPAAZone are dynamically required based on PHI status.</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] text-white space-y-2">
          <Lock className="text-blue-400" size={24} />
          <h3 className="font-bold text-sm">Zero-PHI Control</h3>
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Registry only manages metadata. Clinical data is never touched.</p>
        </div>
      </div>

      {/* 📊 INVENTORY SECTION */}
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

        <div className={`bg-white p-4 rounded-2xl border border-slate-200 flex gap-4 transition-all ${isCertified ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by resource or owner..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* 📑 TABLE */}
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
                  <td colSpan={3} className="px-8 py-20 text-center text-slate-400 italic font-medium">No live data. Click "Run HIPAA Audit".</td>
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
                          disabled={isFixing === res.id || isAutoFixLocked}
                          className={`text-[10px] font-black px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ml-auto ${
                            isAutoFixLocked 
                            ? 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed' 
                            : 'bg-slate-900 text-white hover:bg-blue-600'
                          }`}
                        >
                          {isFixing === res.id ? <Loader2 size={12} className="animate-spin" /> : isAutoFixLocked ? <Lock size={12} /> : <Wrench size={12} />}
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

      {/* 📜 MANIFESTO FOOTER */}
      <section className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
        <div className="relative z-10 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-2">
              <span className="bg-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Governance Schema</span>
              <h2 className="text-3xl font-black italic tracking-tight">The Healthcare Tagging Manifesto</h2>
              <p className="text-slate-400 text-sm max-w-xl leading-relaxed font-medium">Download the full technical guide on enforcing 100% financial traceability using the 16 mandatory keys.</p>
            </div>
            
            <Link 
              href={isDownloadLocked ? "/pricing" : "/healthcare-tagging-manifesto.pdf"} 
              target={isDownloadLocked ? "_self" : "_blank"}
              className={`px-6 py-4 rounded-2xl text-xs font-black uppercase flex items-center gap-2 shrink-0 border transition-all ${
                isDownloadLocked 
                ? 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10' 
                : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
              }`}
            >
              {isDownloadLocked ? <Lock size={18} className="text-amber-500" /> : <Download size={18} />} 
              {isDownloadLocked ? "Elite: Get Manifesto" : "Download Manifesto (PDF)"}
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {tagRegistry.map((tag, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex flex-col gap-3 group hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <code className="text-blue-400 font-black text-xs">{tag.key}</code>
                    {tag.details && <span className="text-[9px] text-slate-500 leading-tight font-medium italic">{tag.details}</span>}
                  </div>
                  {tag.required && <span className="text-[8px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Required</span>}
                </div>
                <div className="text-[11px] font-medium leading-relaxed">
                  {tag.values ? (
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-slate-500 mr-1 italic">Values:</span>
                      {tag.values.map(v => <span key={v} className="text-slate-300 bg-white/5 px-1.5 py-0.5 rounded">"{v}"</span>)}
                    </div>
                  ) : <div className="text-slate-500">Pattern: <span className="text-blue-200 italic font-mono">{tag.pattern}</span></div>}
                  {tag.dependency && (
                    <div className="mt-2 flex items-center gap-2 text-[9px] text-amber-400/80 font-bold uppercase italic border-t border-white/5 pt-2">
                      <Info size={12} /> Condition: {tag.dependency}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={240} /></div>
      </section>

      {/* 🔗 PAGE FOOTER */}
      <div className="pt-8 text-center border-t border-slate-100">
        <p className="text-slate-400 text-sm font-medium">
          Looking for our legal and data protection policies? 
          <Link href="/privacy" className="text-blue-600 font-bold ml-1 hover:underline">View Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}