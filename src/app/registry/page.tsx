"use client";
import React from 'react';
import { 
  Database, ShieldCheck, Zap, Lock, 
  FileText, CheckCircle2, Info
} from 'lucide-react';

export default function TagRegistry() {
  const mandatoryKeys = [
    { key: "BusinessUnit", values: ["Clinical", "Research", "Billing", "Operations", "IT"], details: "Identifies the healthcare business unit that owns the workload for chargeback." },
    { key: "ApplicationName", values: ["EpicEMR", "PatientPortal", "BillingSystem", "LabSystem", "Analytics"], details: "Application or service associated with the resource." },
    { key: "Environment", values: ["Prod", "NonProd", "Dev", "Test", "DR"], details: "Defines operational and compliance controls." },
    { key: "Owner", pattern: "firstname.lastname@healthco.com", details: "Accountable technical or business owner." },
    { key: "DataClassification", values: ["PHI", "PII", "Internal", "Public"], details: "Defines sensitivity of data stored or processed." },
    { key: "ContainsPHI", values: ["Yes", "No"], details: "Identifies if protected health information is present." },
    { key: "HIPAAZone", values: ["Secure", "General"], dependency: "Required when ContainsPHI = Yes" },
    { key: "EncryptionRequired", values: ["Yes"], dependency: "Required when ContainsPHI = Yes" }
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 space-y-12 animate-in fade-in duration-500">
      
      {/* 🏷️ PAGE HEADER */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 text-blue-600 mb-2">
          <Database size={32} />
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Tag Registry</h1>
        </div>
        <p className="text-slate-500 text-lg max-w-2xl font-medium">
          The official healthcare schema standards for 100% financial traceability and HIPAA compliance.
        </p>
      </section>

      {/* 🏛️ ARCHITECTURE OVERVIEW */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 space-y-2">
          <ShieldCheck className="text-blue-600" size={24} />
          <h3 className="font-bold text-slate-900">16 Mandatory Keys</h3>
          <p className="text-xs text-slate-600 leading-relaxed">Every resource must contain the full base-schema to be considered compliant.</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 space-y-2">
          <Zap className="text-emerald-600" size={24} />
          <h3 className="font-bold text-slate-900">Logic Dependencies</h3>
          <p className="text-xs text-slate-600 leading-relaxed">Tags like HIPAAZone are dynamically required based on PHI status.</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] text-white space-y-2">
          <Lock className="text-blue-400" size={24} />
          <h3 className="font-bold">Zero-PHI Control</h3>
          <p className="text-xs text-slate-400 leading-relaxed">Registry only manages metadata. Clinical data is never touched.</p>
        </div>
      </div>

      {/* 📑 DETAILED SCHEMA TABLE */}
      <section className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Name</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Allowed Values</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requirement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mandatoryKeys.map((tag) => (
              <tr key={tag.key} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <code className="text-blue-600 font-black text-sm">{tag.key}</code>
                    <span className="text-[10px] text-slate-400 max-w-[200px] leading-tight">{tag.details}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-wrap gap-1.5">
                    {tag.values ? tag.values.map(v => (
                      <span key={v} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-bold">
                        {v}
                      </span>
                    )) : (
                      <span className="text-slate-400 italic text-xs font-mono">{tag.pattern}</span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  {tag.dependency ? (
                    <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black italic uppercase">
                      <Info size={12} /> {tag.dependency}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase">
                      <CheckCircle2 size={12} /> Always Mandatory
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 🔗 REDIRECT TO PRIVACY */}
      <div className="pt-8 text-center border-t border-slate-100">
        <p className="text-slate-400 text-sm">
          Looking for our legal and data protection policies? 
          <a href="/privacy" className="text-blue-600 font-bold ml-1 hover:underline">View Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}