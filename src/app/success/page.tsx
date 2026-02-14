"use client";

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  ArrowRight, 
  Settings, 
  ShieldCheck, 
  Zap,
  FileDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * SUCCESS CONTENT COMPONENT
 */
function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#10b981']
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* 🎉 CELEBRATION HEADER */}
      <div className="text-center space-y-6 mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-4">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Governance Suite <span className="text-blue-600">Activated.</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-md mx-auto">
          Your compliance engine is now online. You have full access to the HIPAA Audit Vault and Policy Enforcement.
        </p>
        {sessionId && (
           <p className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">
             Ref: {sessionId.slice(0, 18)}...
           </p>
        )}
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
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-200">1</div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">Connect Azure Tenant</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Enter your Service Principal credentials in Settings to begin scanning your subscriptions.</p>
              <Link href="/settings" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 mt-2 hover:underline">
                Go to Settings <Settings size={14} />
              </Link>
            </div>
          </div>

          {/* STEP 2: FIXED - DIRECT PDF DOWNLOAD */}
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center font-bold">2</div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">Define Your Schema</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Align your environment with the 16-Key HIPAA Standard Manifesto.</p>
              <a 
                href="/healthcare-tagging-manifesto.pdf" 
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 mt-2 hover:underline"
              >
                Download Manifesto PDF <FileDown size={14} />
              </a>
            </div>
          </div>

          {/* STEP 3: FIXED - POINTING TO AUDIT VAULT */}
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center font-bold">3</div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">Access Compliance Vault</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Your HIPAA evidence and BAA documentation are now live in the Audit Vault.</p>
              <Link href="/audit" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 mt-2 hover:underline">
                Go to Audit Vault <ShieldCheck size={14} />
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

/**
 * MAIN PAGE EXPORT
 */
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 animate-pulse font-medium">Verifying Activation...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}