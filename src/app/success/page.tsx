"use client";
import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  ArrowRight, 
  Settings, 
  ShieldCheck, 
  Zap,
  Users
} from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* 🎉 CELEBRATION HEADER */}
      <div className="text-center space-y-6 mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-4">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h1 className="text-4xl font-black text-compliance-blue tracking-tight">
          Welcome to the <span className="text-blue-600">Pro</span> Tier.
        </h1>
        <p className="text-slate-500 text-lg max-w-md mx-auto">
          Your subscription is confirmed. You now have full access to the HIPAA Audit Vault and Policy Enforcement.
        </p>
      </div>

      {/* 📋 NEXT STEPS GRID */}
      <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-xl shadow-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <Zap size={120} />
        </div>
        
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
          Activation Checklist
        </h2>

        <div className="space-y-8 relative z-10">
          {/* STEP 1 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">1</div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">Connect Azure Tenant</h3>
              <p className="text-sm text-slate-500">Enter your Service Principal credentials in Settings to begin scanning.</p>
              <Link href="/settings" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 mt-2 hover:underline">
                Go to Settings <Settings size={14} />
              </Link>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="flex gap-6 opacity-60">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center font-bold">2</div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">Define Your Schema</h3>
              <p className="text-sm text-slate-500">Visit the Tag Registry to set your mandatory healthcare tags.</p>
              <Link href="/policy" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 mt-2 hover:underline">
                View Registry <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="flex gap-6 opacity-60">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center font-bold">3</div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">Download BAA</h3>
              <p className="text-sm text-slate-500">Your signed Business Associate Agreement is ready in the Audit Vault.</p>
              <Link href="/audit" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 mt-2 hover:underline">
                Go to Vault <ShieldCheck size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 📞 SUPPORT CALLOUT */}
      <div className="mt-12 text-center">
        <p className="text-xs text-slate-400 font-medium">
          Need help onboarding? <Link href="/support" className="text-blue-600 font-bold hover:underline">Talk to a PHItag Engineer</Link>
        </p>
      </div>
    </div>
  );
}