"use client";
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Shield, FileText, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import Link from 'next/link';

const ARTICLE_CONTENT: Record<string, { title: string, cat: string, body: React.ReactNode }> = {
  // --- Category: The 16-Key Standard ---
  "understanding-phi-tags": {
    title: "Understanding PHI Tags",
    cat: "The 16-Key Standard",
    body: (
      <div className="space-y-6">
        <p className="leading-relaxed text-lg">Protected Health Information (PHI) tags are the cornerstone of our HIPAA compliance strategy. They dictate the automated security controls applied to every cloud resource.</p>
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
          <div className="flex gap-3">
            <AlertTriangle className="text-amber-600 shrink-0" size={20} />
            <p className="text-sm text-amber-900 font-medium">Any resource tagged with PHI:True is prohibited from having a Public IP address. Violation triggers an automatic firewall block within 60 seconds.</p>
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-900">Governance Tiers</h3>
        <table className="w-full border-collapse border border-slate-200">
          <thead className="bg-slate-50">
            <tr><th className="border p-3 text-left">Level</th><th className="border p-3 text-left">Security Protocol</th></tr>
          </thead>
          <tbody>
            <tr><td className="border p-3 font-mono">PHI</td><td className="border p-3">BAA required, AES-256 encryption, 7-year log retention.</td></tr>
            <tr><td className="border p-3 font-mono">PII</td><td className="border p-3">Identity masking, MFA mandatory for all access.</td></tr>
            <tr><td className="border p-3 font-mono">Public</td><td className="border p-3">Standard encryption, no medical data permitted.</td></tr>
          </tbody>
        </table>
        
      </div>
    )
  },
  "costcenter-validation-rules": {
    title: "CostCenter Validation Rules",
    cat: "The 16-Key Standard",
    body: (
      <div className="space-y-6">
        <p>Financial accountability ensures that cloud spend is correctly attributed to clinical departments. Every resource must map back to an active SAP general ledger.</p>
        <h3 className="text-xl font-bold">Validation Logic</h3>
        <ul className="list-disc pl-6 space-y-3">
          <li><strong>Format:</strong> Must be a 6-digit numeric string synchronized with the ERP master list.</li>
          <li><strong>Inheritance:</strong> Resources inherit from Resource Groups; exceptions require a "Tag Override" ticket.</li>
          <li><strong>Reporting:</strong> Month-end "Showback" reports are generated automatically for Department Heads.</li>
        </ul>
        <div className="p-4 bg-blue-50 text-blue-800 rounded-xl flex gap-3">
          <Info size={20} className="shrink-0" />
          <p className="text-sm">Resources with invalid CostCenters are flagged in the weekly "Zombies & Orphans" report.</p>
        </div>
      </div>
    )
  },
  "owner-attribution-logic": {
    title: "Owner Attribution Logic",
    cat: "The 16-Key Standard",
    body: (
      <div className="space-y-6">
        <p>Every asset must have a clearly defined Business Owner and Technical Contact for incident response and billing approvals.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 border rounded-2xl bg-slate-50">
            <h4 className="font-bold text-blue-700">Business Owner</h4>
            <p className="text-sm text-slate-600 mt-2">Responsible for the budget and compliance of the data stored within the workload.</p>
          </div>
          <div className="p-5 border rounded-2xl bg-slate-50">
            <h4 className="font-bold text-emerald-700">Technical Contact</h4>
            <p className="text-sm text-slate-600 mt-2">The Lead Engineer responsible for maintenance and patch management.</p>
          </div>
        </div>
        <p>Our automation cross-references Entra ID (Azure AD). If an owner's status becomes "Inactive," a reassignment workflow is triggered immediately to the department VP.</p>
      </div>
    )
  },
  "monthly-certification-guide": {
    title: "Monthly Certification Guide",
    cat: "Compliance Workflows",
    body: (
      <div className="space-y-6">
        <p>Attestation is a legal requirement under our internal Governance Framework. This ensures that the "Source of Truth" in the Audit Vault reflects current cloud usage.</p>
        <div className="relative pl-8 border-l-2 border-blue-200 space-y-8">
          <div className="relative"><span className="absolute -left-[41px] bg-blue-600 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold">1</span><p className="font-bold">Review Drift Report</p><p className="text-sm text-slate-500">Check the dashboard for any resources flagged as "Non-Compliant."</p></div>
          <div className="relative"><span className="absolute -left-[41px] bg-blue-600 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold">2</span><p className="font-bold">Remediate Tags</p><p className="text-sm text-slate-500">Update metadata in the Azure portal for any incorrect CostCenters or PHI flags.</p></div>
          <div className="relative"><span className="absolute -left-[41px] bg-blue-600 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold">3</span><p className="font-bold">Digital Signature</p><p className="text-sm text-slate-500">Submit your attestation in the Audit Vault portal before the 15th of each month.</p></div>
        </div>
      </div>
    )
  },
  "generating-hipaa-evidence": {
    title: "Generating HIPAA Evidence",
    cat: "Compliance Workflows",
    body: (
      <div className="space-y-6">
        <p>Preparing for an OCR audit or internal review requires point-in-time evidence of security controls.</p>
        <div className="p-6 bg-slate-900 rounded-2xl text-slate-300 font-mono text-xs">
          <p className="text-emerald-500"># Fetch all PHI-tagged storage accounts and encryption status</p>
          <p>$ cloud-audit-cli --scope global --data PHI --format pdf --sign</p>
        </div>
        <h3 className="text-xl font-bold">Evidence Includes:</h3>
        <ul className="grid grid-cols-2 gap-3 text-sm font-medium">
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> Encryption Keys (CMK)</li>
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> NSG Flow Logs</li>
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> IAM Access Logs</li>
          <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> BAA Registry</li>
        </ul>
      </div>
    )
  },
  "handling-policy-drift": {
    title: "Handling Policy Drift",
    cat: "Compliance Workflows",
    body: (
      <div className="space-y-6">
        <p>Policy drift occurs when a resource's state changes from compliant to non-compliant after deployment. This is often caused by manual overrides in the portal.</p>
        <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
          <h4 className="font-bold text-red-700 flex items-center gap-2"><AlertTriangle size={18} /> Automatic Remediation</h4>
          <p className="text-sm text-red-600 mt-1">Resources found in critical drift (e.g., PHI data on a public endpoint) will be automatically isolated into a Restricted Security Group.</p>
        </div>
        
      </div>
    )
  },
  "role-based-access-control": {
    title: "Role Based Access Control",
    cat: "Platform Governance",
    body: (
      <div className="space-y-6">
        <p>Access is managed via PIM (Privileged Identity Management) and based on clinical and technical job functions.</p>
        <div className="space-y-4">
          <div className="p-4 bg-white border rounded-xl">
            <p className="font-black text-xs uppercase tracking-widest text-slate-400">Tier 1: Read-Only</p>
            <p className="font-bold">Compliance Auditor</p>
            <p className="text-sm text-slate-500">Can view all tags and logs but cannot modify resource state.</p>
          </div>
          <div className="p-4 bg-white border rounded-xl">
            <p className="font-black text-xs uppercase tracking-widest text-slate-400">Tier 2: Contributor</p>
            <p className="font-bold">Cloud Operator</p>
            <p className="text-sm text-slate-500">Can modify tags and configurations for assigned CostCenters.</p>
          </div>
        </div>
      </div>
    )
  },
  "setting-up-azure-connectivity": {
    title: "Setting up Azure Connectivity",
    cat: "Platform Governance",
    body: (
      <div className="space-y-6">
        <p>Standard internet connectivity is strictly controlled. All medical applications must use the Secure Transit Hub architecture.</p>
        <h3 className="text-xl font-bold">Standard Hub-Spoke Model</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Spoke VNet:</strong> Where the application lives. No Public IPs allowed.</li>
          <li><strong>Hub VNet:</strong> Contains the Palo Alto Firewalls and VPN Gateways.</li>
          <li><strong>Peering:</strong> Managed by Global NetOps only.</li>
        </ul>
        
      </div>
    )
  },
  "policy-enforcement-modes": {
    title: "Policy Enforcement Modes",
    cat: "Platform Governance",
    body: (
      <div className="space-y-6">
        <p>The Governance Engine operates in two primary modes depending on the environment lifecycle.</p>
        <div className="grid grid-cols-1 gap-6">
          <div className="flex gap-4 items-start">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600 font-bold italic">Audit</div>
            <div>
              <h4 className="font-bold">Audit Mode (Development)</h4>
              <p className="text-sm text-slate-500">Violations are logged and owners are emailed, but the resource creation is not blocked. Use this to test new templates.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="p-2 bg-red-100 rounded-lg text-red-600 font-bold italic">Deny</div>
            <div>
              <h4 className="font-bold">Deny Mode (Production)</h4>
              <p className="text-sm text-slate-500">Infrastructure-as-Code (Terraform) will fail if any of the 16 mandatory tags are missing. Standard for all PHI-enabled zones.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
};

export default function ArticlePage() {
  const { slug } = useParams();
  const router = useRouter();
  const article = ARTICLE_CONTENT[slug as string];

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <div className="mb-6 flex justify-center text-slate-200"><Shield size={80} /></div>
        <h1 className="text-2xl font-black text-slate-900">Article Not Found</h1>
        <p className="text-slate-500 mb-8 mt-2">The documentation ID "{slug}" does not exist in our registry.</p>
        <Link href="/docs" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm">Return to Help Center</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-10 group font-bold text-sm uppercase tracking-widest">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      <header className="mb-12 pb-12 border-b border-slate-100">
        <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4">
          <Shield size={14} /> {article.cat}
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-6 leading-tight">{article.title}</h1>
        <div className="flex items-center gap-6 text-slate-400 text-sm font-medium">
          <div className="flex items-center gap-2"><Clock size={16} /> 1 min read</div>
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100"><FileText size={14} /> HIPAA Verified v2.4</div>
        </div>
      </header>

      <article className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed font-medium">
        {article.body}
      </article>

      <footer className="mt-20 pt-10 border-t border-slate-100">
        <div className="bg-slate-50 rounded-[2.5rem] p-10 text-center border border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Need a technical walkthrough?</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Schedule a 15-minute review with the Cloud Governance team for personalized assistance.</p>
          <button 
  onClick={() => alert("Redirecting to Compliance Calendar...")}
  className="bg-white border-2 border-slate-200 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm active:scale-95"
>
  Schedule Session
</button>
        </div>
      </footer>
    </div>
  );
}