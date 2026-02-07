"use client";
import React from 'react';
import Image from 'next/image';
import { signIn } from "next-auth/react";
import { Github, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-md space-y-8 bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50">
        
        {/* BRANDING - Updated to use your Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
               <Image src="/logo.png" alt="PHItag Logo" width={48} height={48} priority />
            </div>
          </div>
          <h1 className="text-3xl font-black text-[#003366] tracking-tighter italic">
            PHItag <span className="text-slate-300 not-italic font-light">|</span> <span className="text-slate-400 not-italic font-medium">Auth</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] pt-1">
            Secure Control Plane Access
          </p>
        </div>

        {/* LOGIN ACTIONS */}
        <div className="space-y-4">
          {/* Azure AD / Microsoft Button - Primary Action */}
          <button 
            onClick={() => signIn("azure-ad", { callbackUrl: "/" })}
            className="w-full flex items-center justify-between px-6 py-4 bg-[#003366] text-white rounded-2xl hover:bg-[#002B5B] transition-all font-bold text-sm shadow-lg shadow-blue-900/20 group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-1 rounded-md">
                <Lock size={16} className="text-white" />
              </div>
              <span>Sign in with Enterprise SSO</span>
            </div>
            <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </button>

          {/* GitHub Login Button - Secondary Action */}
          <button 
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="w-full flex items-center justify-between px-6 py-4 border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all font-bold text-sm group"
          >
            <div className="flex items-center gap-3">
              <Github size={20} />
              <span>Continue with GitHub</span>
            </div>
            <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </button>
        </div>

        {/* SECURITY FOOTER */}
        <div className="space-y-4 pt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Audited Access</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50/50 py-2 rounded-full">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">HIPAA Compliant Environment</span>
          </div>
          
          <p className="text-center text-[9px] text-slate-400 leading-relaxed px-4">
            Authorized personnel only. All access attempts and session activities are monitored under the PHItag Traceback protocol.
          </p>
        </div>

      </div>
    </div>
  );
}