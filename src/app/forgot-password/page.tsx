"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, ShieldQuestion } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-in fade-in duration-700">
      <div className="w-full max-w-md space-y-8 bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-xl shadow-slate-100">
        
        {/* BACK BUTTON */}
        <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Login
        </Link>

        {!submitted ? (
          <>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-50 rounded-xl mb-4">
                <ShieldQuestion size={24} className="text-slate-400" />
              </div>
              <h1 className="text-2xl font-black text-compliance-blue tracking-tight">Reset Password</h1>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Enter your work email and we'll send you a secure link to reset your access.
              </p>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Work Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-3.5 text-slate-400" />
                  <input 
                    required
                    type="email" 
                    placeholder="name@company.com" 
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" 
                  />
                </div>
              </div>

              <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-100">
                Send Reset Link
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-500">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-full">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Check your inbox</h2>
              <p className="text-sm text-slate-500 leading-relaxed px-4">
                If an account exists for that email, we've sent a password reset link.
              </p>
            </div>
            <button 
              onClick={() => setSubmitted(false)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Didn't get the email? Try again
            </button>
          </div>
        )}

        <div className="pt-6 border-t border-slate-50 text-center">
          <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-tighter">
            Security Note: Reset links expire after 24 hours for HIPAA compliance.
          </p>
        </div>
      </div>
    </div>
  );
}