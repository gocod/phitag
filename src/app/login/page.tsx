"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { signIn } from "next-auth/react";
import { Github, ShieldCheck, ArrowRight, Lock, Mail, Loader2, ExternalLink } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  // --- ADMIN NOTIFICATION HELPER ---
  const notifyAdmin = async (userEmail: string, type: string) => {
    try {
      await fetch('/api/admin/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: `Login Attempt (${type})`,
          userEmail: userEmail || "SSO User",
          planName: "Checking Profile..." 
        }),
      });
    } catch (e) {
      console.error("Failed to notify admin", e);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailLoading(true);
    
    // Notify before triggering the magic link
    await notifyAdmin(email, "Magic Link");
    
    await signIn("email", { email, callbackUrl: "/" });
    setIsEmailLoading(false);
  };

  const handleSSOLogin = async (provider: string) => {
    // For SSO, we don't have the email yet, but we can log the attempt
    await notifyAdmin("SSO Intent", provider);
    signIn(provider, { callbackUrl: "/" });
  };

  const handleRequestAccess = () => {
    window.location.href = "mailto:access@phitag.app?subject=Access Request";
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-md space-y-8 bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50">
        
        {/* BRANDING */}
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
          {/* 1. ENTERPRISE SSO */}
          <button 
            onClick={() => handleSSOLogin("azure-ad")}
            className="w-full flex items-center justify-between px-6 py-4 bg-[#003366] text-white rounded-2xl hover:bg-[#002B5B] transition-all font-bold text-sm shadow-lg shadow-blue-900/20 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-1 rounded-md">
                <Lock size={16} className="text-white" />
              </div>
              <span>Sign in with Enterprise SSO</span>
            </div>
            <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
            <div className="relative flex justify-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] bg-white px-4">
              OR
            </div>
          </div>

          {/* 2. EMAIL MAGIC LINK */}
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="email" 
                placeholder="work-email@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <button 
              type="submit"
              disabled={isEmailLoading}
              className="w-full py-4 text-slate-600 font-bold text-xs uppercase tracking-widest border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isEmailLoading ? <Loader2 size={16} className="animate-spin" /> : "Send Magic Link"}
            </button>
          </form>

          {/* 3. GITHUB */}
          <button 
            onClick={() => handleSSOLogin("github")}
            className="w-full flex items-center justify-center gap-2 py-3 text-slate-400 hover:text-slate-600 transition-all font-bold text-[10px] uppercase tracking-widest cursor-pointer"
          >
            <Github size={14} /> Continue with GitHub
          </button>
        </div>

        {/* SECURITY FOOTER */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50/50 py-2 rounded-full">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">HIPAA Compliant Environment</span>
          </div>
          
          <p className="text-center text-[9px] text-slate-400 leading-relaxed px-4">
            Authorized personnel only. New users will be automatically provisioned under "Auditor" roles.
          </p>
        </div>

        {/* SIGN UP REDIRECT */}
        <p className="text-center text-xs text-slate-400 font-medium">
          Don't have an account?{' '}
          <button 
            onClick={handleRequestAccess}
            className="text-blue-600 font-black hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            Request Access <ExternalLink size={12} />
          </button>
        </p>

      </div>
    </div>
  );
}