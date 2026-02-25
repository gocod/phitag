"use client";

import React, { useEffect, Suspense, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import { 
  CheckCircle2, Settings, ShieldCheck, Zap, FileDown, Calendar, Star
} from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * SUCCESS CONTENT COMPONENT
 * Handles post-purchase celebration, session synchronization, 
 * and trial-to-paid state transition.
 */
function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { data: session, status, update } = useSession(); 
  
  // State to track if the success was specifically for the Pilot program
  const [isPilotSuccess, setIsPilotSuccess] = useState(false);
  
  // Prevents multiple celebration triggers on re-renders
  const hasCelebrated = useRef(false);

  useEffect(() => {
    if (hasCelebrated.current) return;

    // 1. 🛡️ PILOT DETECTION LOGIC
    // We check for the trial flag set by the pricing page.
    const trialStarted = localStorage.getItem('trial_start_date');
    if (trialStarted) {
      setIsPilotSuccess(true);
    }

    // 2. 🎉 CELEBRATION
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#10b981', '#f59e0b']
    });

    // 3. ⚡ SESSION RECOVERY & SYNCING
    // If the user lost their session during checkout, force a reload.
    if (status === "unauthenticated") {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (status === "authenticated") {
      const user = session?.user as any;
      const userTier = user?.tier?.toLowerCase();
      const isUpgraded = userTier === "pro" || userTier === "elite";
      
      // 🎯 CLEANUP: If the user just paid for Pro/Elite, kill the Pilot Banner
      // This ensures the "90 Days Left" UI doesn't persist for paying users.
      if (isUpgraded && !trialStarted) {
        console.log("💎 Paid plan detected. Clearing trial banners...");
        localStorage.removeItem('trial_start_date');
        setIsPilotSuccess(false);
      }

      // Trigger session refresh to fetch the new Tier from Firestore
      if (!isUpgraded) {
        const timer = setTimeout(() => {
          update(); // Refresh JWT
          hasCelebrated.current = true; 
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        hasCelebrated.current = true; 
      }
    }
  }, [status, update, session]);

  // Protective Loading State
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

  // Determine Tier Name for the Header
  const user = session?.user as any;
  const currentTier = user?.tier?.toUpperCase() || "PRO";

  return (
    <div className="max-w-3xl mx-auto py-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* HEADER SECTION */}
      <div className="text-center space-y-6 mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-4">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          {isPilotSuccess ? (
            <>Pilot Program <span className="text-blue-600">Active.</span></>
          ) : (
            <>{currentTier === 'ELITE' ? 'Compliance Elite' : 'Governance Pro'} <span className="text-blue-600">Activated.</span></>
          )}
        </h1>

        <p className="text-slate-500 text-lg max-w-md mx-auto font-medium leading-relaxed">
          {isPilotSuccess 
            ? "Welcome to your 90-day clinical pilot. You have full access to Pro features to secure your Azure environment."
            : `Your ${currentTier} compliance engine is now online. Your session is currently syncing with your new permissions.`
          }
        </p>

        {/* PILOT BADGE (Only shows if it's a trial) */}
        {isPilotSuccess && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 shadow-sm animate-pulse">
            <Calendar size={14} />
            <span className="text-xs font-black uppercase tracking-widest">Auto-Upgrade scheduled in 90 Days</span>
          </div>
        )}

        {/* ELITE BADGE (Special UI for high-value sales) */}
        {currentTier === 'ELITE' && !isPilotSuccess && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100 shadow-sm">
            <Star size={14} className="fill-amber-500" />
            <span className="text-xs font-black uppercase tracking-widest">Elite Tier Status Confirmed</span>
          </div>
        )}

        {sessionId && (
           <p className="text-[10px] font-mono text-slate-300 uppercase tracking-widest block mt-4">
             Ref: {sessionId.slice(0, 18)}...
           </p>
        )}
      </div>

      {/* NEXT STEPS CARD */}
      <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-xl shadow-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <Zap size={120} />
        </div>
        
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
          Next Steps for Onboarding
        </h2>

        <div className="space-y-8 relative z-10">
          {/* STEP 1 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-200">1</div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">Connect Azure Credentials</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Head to Settings to input your Service Principal and Subscription IDs.</p>
              <Link href="/settings" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 mt-2 hover:underline">
                Go to Settings <Settings size={14} />
              </Link>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center font-bold">2</div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">Download BAA & Manifesto</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Prepare your compliance documentation for the clinical review.</p>
              <a href="/healthcare-tagging-manifesto.pdf" download className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 mt-2 hover:underline">
                Download PDF <FileDown size={14} />
              </a>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center font-bold">3</div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">Initialize Audit Vault</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Access your secure logging environment to view the first set of drift reports.</p>
              <Link href="/audit" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 mt-2 hover:underline">
                Go to Audit Vault <ShieldCheck size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SUPPORT FOOTER */}
      <div className="mt-12 text-center">
        <p className="text-xs text-slate-400 font-medium">
          Need help with your {currentTier} setup? <Link href="/support" className="text-blue-600 font-bold hover:underline">Contact Governance Support</Link>
        </p>
      </div>
    </div>
  );
}

/**
 * SUCCESS PAGE WRAPPER
 * Suspense is required because useSearchParams() is a client-side hook 
 * that needs to bail out during static generation.
 */
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}