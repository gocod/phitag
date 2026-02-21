"use client";
import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, EyeOff, Server, 
  FileCheck, ShieldAlert, Mail, Globe, 
  CheckCircle2, Clock, Zap, Database, ArrowRight, Loader2, CheckCircle
} from 'lucide-react';

export default function SecurityPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSecuritySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: "Security Vulnerability Report",
          email: formData.get('email'),
          message: formData.get('message'),
        }),
      });
      if (res.ok) setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  const securityControls = [
    {
      category: "Data Privacy & Architecture",
      icon: <EyeOff className="text-blue-600" size={20} />,
      items: [
        "Zero-PHI Footprint: We never store patient data",
        "Metadata Only: We only access & store resource tags",
        "Encryption at rest (AES-256) for all configuration",
        "TLS 1.3 Encryption for all API communications"
      ]
    },
    {
      category: "Azure Access Control",
      icon: <Lock className="text-emerald-600" size={20} />,
      items: [
        "Least-Privilege Service Principal (RBAC) access",
        "Scoped access to specific Azure Subscriptions only",
        "Audit logs for every tagging action taken",
        "Credential rotation and secret management"
      ]
    },
    {
      category: "Compliance & Auditing",
      icon: <FileCheck className="text-amber-600" size={20} />,
      items: [
        "Signed BAA (Business Associate Agreement) available",
        "Strict employee access controls (Least-Privilege)",
        "Annual mandatory HIPAA & Cyber-security training",
        "Continuous vulnerability monitoring"
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-16 py-10 animate-in fade-in duration-700">
      <section className="text-center space-y-4">
        <div className="flex justify-center mb-6">
           <div className="bg-slate-900 p-4 rounded-3xl shadow-2xl">
             <ShieldCheck size={40} className="text-blue-500" />
           </div>
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Enterprise Trust Center</h1>
        <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed text-lg font-medium">
          PHItag is a stateless governance engine. We manage your cloud integrity without ever touching your patient data.
        </p>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["HIPAA COMPLIANT", "BAA AVAILABLE", "ZERO-PHI ARCHITECTURE", "AES-256 ENCRYPTED"].map((badge) => (
          <div key={badge} className="bg-white border border-slate-100 p-6 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">
            <CheckCircle2 size={18} className="text-blue-600 mb-3" />
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.15em]">{badge}</span>
          </div>
        ))}
      </div>

      <section className="bg-blue-50 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-8 border border-blue-100">
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-200/50 shrink-0">
          <Database size={48} className="text-blue-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Our "No-Data" Guarantee</h2>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Unlike traditional tools, PHItag is a <strong>Control Plane</strong>. We connect to your Azure environment via secure Service Principals to manage <strong>Tags and Metadata only</strong>. Your PHI remains safely within your Azure Tenant.
          </p>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-8">
        {securityControls.map((control, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-6 p-3 bg-slate-50 w-fit rounded-2xl">{control.icon}</div>
            <h3 className="font-extrabold text-slate-900 mb-6 tracking-tight">{control.category}</h3>
            <ul className="space-y-4">
              {control.items.map((item, j) => (
                <li key={j} className="flex items-start gap-3 text-[11px] text-slate-500 font-bold uppercase tracking-tight">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <section className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-black italic tracking-tight">Vulnerability Disclosure</h2>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              We appreciate the global security community. Reports are triaged within 24 hours. We offer safe harbor for researchers acting in good faith.
            </p>
            {status === 'success' ? (
              <div className="bg-blue-600/20 border border-blue-600 p-6 rounded-2xl flex items-center gap-4 animate-in zoom-in">
                <CheckCircle className="text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-widest">Report Sent Successfully</span>
              </div>
            ) : (
              <form onSubmit={handleSecuritySubmit} className="space-y-3 pt-4">
                <input name="email" required type="email" placeholder="Researcher Email" className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                <textarea name="message" required rows={3} placeholder="Describe the finding..." className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                <button disabled={status === 'loading'} className="w-full bg-blue-600 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                  {status === 'loading' ? <Loader2 className="animate-spin" size={16} /> : <>Submit Report <ArrowRight size={14} /></>}
                </button>
              </form>
            )}
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-sm">
              <Zap className="text-blue-400 mb-4" size={32} />
              <h4 className="text-sm font-black text-white uppercase mb-2 tracking-widest">Our Triage Promise</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                We provide transparent updates throughout the remediation process and credit researchers via our `security@phitag.app` channel.
              </p>
          </div>
        </div>
      </section>
    </div>
  );
}