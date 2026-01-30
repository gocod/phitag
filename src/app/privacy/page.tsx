"use client";
import React from 'react';
import { Shield, Eye, Lock, Globe, FileText, Scale } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "1. Introduction",
      icon: <Globe size={18} />,
      content: "PHItag ('we', 'us') respects your privacy. This policy explains how we collect, protect, and handle data when you use our Governance Suite. We operate as a Data Processor for your Azure metadata and a Data Controller for your account information."
    },
    {
      title: "2. Data We Collect",
      icon: <Eye size={18} />,
      content: "We collect account information (email, name) and Azure Resource Metadata (Tag keys, values, resource types). Importantly: PHItag does NOT access, read, or store raw Patient Health Information (PHI) contained within your databases or storage blobs."
    },
    {
      title: "3. How We Use Data",
      icon: <Shield size={18} />,
      content: "Data is used solely to provide compliance reporting, identify tagging drift, and manage your subscription. We do not sell your data or use it for behavioral advertising."
    },
    {
      title: "4. HIPAA & Data Sovereignty",
      icon: <Lock size={18} />,
      content: "For healthcare clients, our processing is governed by a Business Associate Agreement (BAA). All audit data is encrypted at rest using AES-256 and is stored exclusively in Azure US-East regions to maintain compliance."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-700">
      <div className="mb-12 border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-black text-compliance-blue tracking-tight">Privacy Policy</h1>
        <p className="text-slate-500 mt-2 italic text-sm">Last Updated: January 2026</p>
      </div>

      <div className="space-y-12">
        {sections.map((s, i) => (
          <section key={i} className="space-y-4">
            <div className="flex items-center gap-3 text-blue-600">
              {s.icon}
              <h2 className="text-xl font-bold text-slate-900">{s.title}</h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm pl-8">
              {s.content}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-16 p-8 bg-slate-50 rounded-3xl border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-2">Questions?</h3>
        <p className="text-sm text-slate-500">Contact our Data Protection Officer at <span className="text-blue-600 font-bold">privacy@phitag.com</span></p>
      </div>
    </div>
  );
}