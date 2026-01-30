"use client";
import React from 'react';
import { Target, ShieldCheck, HeartPulse, Landmark } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-20 py-10 animate-in fade-in duration-700">
      <section className="text-center space-y-6">
        <h2 className="text-blue-600 font-black uppercase tracking-[0.3em] text-xs italic">The PHItag Story</h2>
        <h1 className="text-6xl font-black text-compliance-blue leading-tight tracking-tighter">
          Where <span className="text-blue-600">FinOps</span> meets <span className="text-blue-600">Compliance.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Founded by practitioners who were tired of choosing between cloud agility and HIPAA safety.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-800">Born from Professional Services.</h3>
          <p className="text-slate-600 leading-relaxed italic">
            "We spent years consulting for major health systems, manually fixing tagging errors that caused millions in waste. We built PHItag to put our best practices on autopilot."
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
              <Target size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900">100% Traceability</p>
              <p className="text-xs text-slate-500 font-medium italic">Our guiding North Star.</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-600 aspect-video rounded-[3rem] shadow-2xl shadow-blue-200 flex items-center justify-center p-12">
           <div className="text-white text-center space-y-2">
              <span className="text-5xl font-black italic tracking-widest opacity-20">PHItag</span>
              <p className="text-xs font-black uppercase tracking-[0.4em] text-blue-200">Governance Suite</p>
           </div>
        </div>
      </div>
    </div>
  );
}