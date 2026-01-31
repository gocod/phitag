"use client";
import React from 'react';
import { 
  Shield, Eye, Lock, Globe, 
  Database, Scale, Fingerprint, 
  Users, HardDrive 
} from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "1. The Zero-PHI Guarantee",
      icon: <Database className="text-blue-600" size={20} />,
      content: "PHItag is architected as a stateless control plane. We do not store, process, or have access to any Protected Health Information (PHI) or Personally Identifiable Information (PII) residing within your Azure environment. Our system is designed to manage and monitor resource metadata (Tags) only."
    },
    {
      title: "2. Data Collection & Processing",
      icon: <Eye className="text-blue-600" size={20} />,
      content: "We act as a Data Processor for your Azure metadata. We collect: (a) Account Information (name, work email) for authentication, and (b) Azure Resource Metadata (Resource IDs, Tag keys, and values) to facilitate governance and compliance reporting."
    },
    {
      title: "3. HIPAA & Data Sovereignty",
      icon: <Lock className="text-blue-600" size={20} />,
      content: "For healthcare clients, all processing is governed by a signed Business Associate Agreement (BAA). To maintain compliance, all audit metadata is encrypted at rest using AES-256 and stored exclusively in Azure US-East regions to ensure data remains within the approved geographic boundary."
    },
    {
      title: "4. Third-Party Subprocessors",
      icon: <Users className="text-blue-600" size={20} />,
      content: "We use strictly vetted subprocessors to maintain our service: Microsoft Azure (Cloud Hosting), Stripe (Billing Operations), and Clerk/Auth0 (Identity Management). All subprocessors are vetted for HIPAA compliance and maintain active BAAs where applicable."
    },
    {
      title: "5. Data Usage & Security",
      icon: <Shield className="text-blue-600" size={20} />,
      content: "Your data is used solely to identify tagging drift and generate compliance evidence. We do not sell your metadata or use it for behavioral advertising. Audit trails of who certified inventory (e.g., 'Certified by Jenny') are maintained for your internal regulatory requirements."
    },
    {
      title: "6. Your Rights & Access",
      icon: <Scale className="text-blue-600" size={20} />,
      content: "Under HIPAA and GDPR, you have the right to access, delete, or port your account data. Because we do not store clinical data, these requests apply only to your administrative account profile. For data removal, contact our Privacy Officer."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-16 px-6 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="mb-16 border-b border-slate-200 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <Fingerprint className="text-blue-600" size={32} />
          <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            Legal Framework
          </span>
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
          Privacy Policy
        </h1>
        <p className="text-slate-500 mt-4 text-lg font-medium">
          How PHItag protects healthcare metadata while maintaining a zero-access posture toward clinical data.
        </p>
        <div className="flex gap-6 mt-6 text-xs text-slate-400 font-bold uppercase tracking-widest">
          <span>Version 1.2</span>
          <span>Last Updated: Jan 30, 2026</span>
        </div>
      </div>

      {/* POLICY SECTIONS */}
      <div className="grid gap-12">
        {sections.map((s, i) => (
          <section key={i} className="group">
            <div className="flex items-start gap-6">
              <div className="mt-1 p-3 bg-blue-50 rounded-2xl border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                {s.icon}
              </div>
              <div className="space-y-3">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {s.title}
                </h2>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {s.content}
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* CALL TO ACTION / SUPPORT */}
      <div className="mt-20 p-10 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Privacy Questions?</h3>
            <p className="text-slate-400 text-sm max-w-sm">
              Our Data Protection Officer is available to discuss our BAA terms and stateless architecture.
            </p>
          </div>
          <a 
            href="mailto:privacy@phitag.com" 
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
          >
            Contact Privacy Officer
          </a>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <HardDrive size={180} />
        </div>
      </div>
    </div>
  );
}