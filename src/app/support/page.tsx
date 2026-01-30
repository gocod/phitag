"use client";
import React from 'react';
import { Mail, MessageSquare, FileText, LifeBuoy, ArrowRight } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10 animate-in fade-in duration-700">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-black text-compliance-blue tracking-tight">How can we help?</h1>
        <p className="text-slate-500">Enterprise-grade support for your cloud governance journey.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {/* BAA REQUEST CARD */}
        <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white space-y-6 shadow-xl shadow-blue-100">
          <FileText size={32} className="text-blue-200" />
          <h2 className="text-2xl font-bold">Request a BAA</h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Need a Business Associate Agreement for HIPAA compliance? Enterprise customers can initiate the legal review process here.
          </p>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center gap-2">
            Start Request <ArrowRight size={16} />
          </button>
        </div>

        {/* GENERAL SUPPORT CARD */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 space-y-6">
          <LifeBuoy size={32} className="text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900">Technical Support</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Having trouble connecting your Azure tenant or defining your tag schema? Our engineers are here to help.
          </p>
          <div className="space-y-3 pt-2">
            <a href="mailto:support@phitag.app" className="flex items-center gap-3 text-sm font-bold text-blue-600 hover:underline">
              <Mail size={18} /> support@phitag.app
            </a>
            <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
              <MessageSquare size={18} /> Average response: 2 hours
            </div>
          </div>
        </div>
      </div>

      {/* FAQ SECTION PREVIEW */}
      <section className="bg-slate-50 rounded-[2.5rem] p-10 text-center">
        <h3 className="font-bold text-slate-800 mb-2">Check the Documentation first?</h3>
        <p className="text-xs text-slate-500 mb-6">Our User Manual covers 90% of common configuration questions.</p>
        <a href="/docs" className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors">
          Go to Docs →
        </a>
      </section>
    </div>
  );
}