"use client";
import React from 'react';
import { Coffee, AlertCircle, Zap, ShieldAlert, CreditCard, Scale, Key } from 'lucide-react';

export default function TermsOfService() {
  const terms = [
    {
      title: "1. The Agreement",
      icon: <Scale size={18} />,
      content: "By accessing PHItag, you agree to these terms. If you represent a Health System or Business Associate, you confirm you have the legal authority to bind that entity to this agreement."
    },
    {
      title: "2. The 'Control Plane' License",
      icon: <Zap size={18} />,
      content: "We provide a stateless governance engine. You grant PHItag the necessary Service Principal permissions to read/write tags in your Azure Tenant. You retain full ownership and responsibility for the underlying Azure resources and any clinical data contained therein."
    },
    {
      title: "3. HIPAA & BAA",
      icon: <Key size={18} />,
      content: "Use of PHItag for PHI-bearing workloads requires a signed Business Associate Agreement (BAA). PHItag is designed to avoid processing PHI; however, our BAA governs the relationship should any administrative metadata fall under protected status."
    },
    {
      title: "4. Subscription & Payments",
      icon: <CreditCard size={18} />,
      content: "Billing is automated via Stripe. Professional and Enterprise tiers renew automatically. You may cancel at any time, but no prorated refunds are provided for the current billing cycle."
    },
    {
      title: "5. Limitation of Liability",
      icon: <ShieldAlert size={18} />,
      content: "PHItag is a governance tool, not a legal guarantee. We are not liable for HIPAA violations, Azure data loss, or unexpected cloud costs. Our liability is strictly limited to the fees paid by you in the 12 months preceding any claim."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-700">
      <div className="mb-12 border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-black text-compliance-blue tracking-tight leading-tight">Terms of Service</h1>
        <div className="flex items-center gap-2 mt-4 text-blue-600 bg-blue-50 w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
          <AlertCircle size={12} /> Last Updated: January 2026
        </div>
      </div>

      <div className="space-y-12">
        {terms.map((t, i) => (
          <section key={i} className="space-y-4 group">
            <div className="flex items-center gap-3 text-blue-500 group-hover:text-blue-600 transition-colors">
              <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                {t.icon}
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">{t.title}</h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm pl-12 font-medium">
              {t.content}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-16 p-8 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldAlert size={100} />
        </div>
        <h3 className="text-lg font-bold mb-2 italic">Notice for Enterprise Users</h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
          If your organization has signed a custom Master Service Agreement (MSA) or a separate Business Associate Agreement (BAA) with PHItag, those documents take precedence over these standard Online Terms.
        </p>
      </div>

      <footer className="mt-10 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
          PHItag Governance Suite • Secure Azure Tagging
        </p>
      </footer>
    </div>
  );
}