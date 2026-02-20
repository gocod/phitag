"use client";

import React, { useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { 
  CheckCircle2, Settings, ShieldCheck, Zap, FileDown 
} from 'lucide-react';
import confetti from 'canvas-confetti';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { data: session, status, update } = useSession(); 
  
  // ⚡ tracks if we've already run the success logic to prevent loops
  const hasCelebrated = useRef(false);

  useEffect(() => {
    // If logic already ran, don't trigger again (Fixes the flashing fireworks)
    if (hasCelebrated.current) return;

    // 1. Celebration (Only runs once)
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#10b981']
    });

    // 2. ⚡ SESSION RECOVERY:
    if (status === "unauthenticated") {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 2000);
      return () => clearTimeout(timer);
    }

    // 3. ⚡ PERMISSION SYNC:
    if (status === "authenticated") {
      // Use 'as any' to bypass the TypeScript 'plan' property error
      const user = session?.user as any;
      const isUpgraded = user?.plan === "Pro" || user?.plan === "Elite";
      
      if (!isUpgraded) {
        const timer = setTimeout(() => {
          update();
          hasCelebrated.current = true; 
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        hasCelebrated.current = true; 
      }
    }
  }, [status, update, session]);

  // PROTECTIVE RENDER: Prevents flickering
  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 font-medium animate-pulse">Syncing Governance Suite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center space-y-6 mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-4">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Governance Suite <span className="text-blue-600">Activated.</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-md mx-auto font-medium">
          Your compliance engine is now online. Your session is currently syncing with your new permissions.
        </p>
        {sessionId && (
           <p className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">
             Ref: {sessionId.slice(0, 18)}...
           </p>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-xl shadow-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <Zap size={120} />
        </div>
        
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
          Next Steps
        </h2>

        <div className="space-y-8 relative z-10">
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-200">1</div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">Connect Azure</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Enter credentials in Settings to start your first scan.</p>
              <Link href="/settings" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 mt-2 hover:underline">
                Go to Settings <Settings size={14} />
              </Link>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center font-bold">2</div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">Download Manifesto</h3>
              <a href="/healthcare-tagging-manifesto.pdf" download className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 mt-2 hover:underline">
                Download PDF <FileDown size={14} />
              </a>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center font-bold">3</div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">Audit Vault</h3>
              <Link href="/audit" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 mt-2 hover:underline">
                Go to Audit Vault <ShieldCheck size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-xs text-slate-400 font-medium">
          Need help? <Link href="/support" className="text-blue-600 font-bold hover:underline">Contact Governance Support</Link>
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}