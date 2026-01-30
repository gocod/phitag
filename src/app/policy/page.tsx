"use client";
import React from 'react';
import { ShieldCheck, EyeOff, Lock, Scale, FileText, Globe } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "The Zero-PHI Guarantee",
      icon: <EyeOff className="text-blue-600" />,
      content: "PHItag is architected as a stateless control plane. We do not store, process, or have access to any Protected Health Information (PHI) or Personally Identifiable Information (PII) residing within your Azure environment. We only manage resource metadata (Tags)."
    },
    {
      title: "Data We Collect",
      icon: <FileText className="text-emerald-600" />,
      content: "We collect account information (work email, name) for authentication, and Azure Resource Metadata (resource IDs, existing tag keys, and values) to facilitate governance and reporting."
    },
    {
      title: "Third-Party Subprocessors",
      icon: <Globe className="text-purple-600" />,
      content: "We use Microsoft Azure (hosting), Stripe (billing), and Clerk/Auth0 (identity). All subprocessors are vetted for HIPAA compliance and have signed BAAs where applicable."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12 animate-in fade-in duration-700">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
          <Scale size={14} /> Effective Jan 2026
        </div>
        <h1 className="text-4xl font-black text-compliance-blue">Privacy Policy</h1>
        <p className="text-slate-500 font-medium leading-relaxed">
          At PHItag, we believe privacy is a fundamental human right. Our software is designed to enforce security while minimizing data footprint.
        </p>
      </header>

      <div className="space-y-8">
        {sections.map((section, i) => (
          <section key={i} className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl">{section.icon}</div>
              <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium pl-2">
              {section.content}
            </p>
          </section>
        ))}
      </div>

      <section className="bg-slate-50 p-10 rounded-[3rem] border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Lock size={20} className="text-blue-600" /> Your Rights
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Under HIPAA and GDPR, you have the right to access, delete, or port your account data at any time. Because we do not store your clinical data, these requests apply only to your administrative account profile.
        </p>
        <a href="mailto:privacy@phitag.com" className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">
          Contact Privacy Officer →
        </a>
      </section>
    </div>
  );
}