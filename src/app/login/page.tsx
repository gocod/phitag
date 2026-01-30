"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from "next-auth/react"; // 1. Import signIn
import { 
  Zap, Mail, Lock, 
  ArrowRight, ShieldCheck, Github // 2. Added Github icon
} from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-in fade-in duration-700">
      <div className="w-full max-w-md space-y-8 bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-xl shadow-slate-100">
        
        {/* BRANDING */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
            <Zap size={24} className="text-white fill-white" />
          </div>
          <h1 className="text-2xl font-black text-compliance-blue tracking-tight">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {isLogin ? "Access your HIPAA Governance Suite" : "Start your 14-day Enterprise trial"}
          </p>
        </div>

        {/* SSO SECTION */}
        <div className="space-y-3">
          {/* Microsoft Login Button */}
          <button 
            onClick={() => signIn("azure-ad", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm text-slate-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 23 23">
              <path fill="#f3f3f3" d="M0 0h23v23H0z"/><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/>
            </svg>
            Sign in with Microsoft
          </button>

          {/* 3. GitHub Login Button (New) */}
          <button 
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold text-sm"
          >
            <Github size={18} />
            Continue with GitHub
          </button>
          
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-400">
              <span className="bg-white px-4 italic">or email</span>
            </div>
          </div>
        </div>

        {/* FORM (Currently non-functional until you set up Credentials provider) */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Name</label>
              <div className="relative">
                <input type="text" placeholder="John Doe" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Work Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-3.5 text-slate-400" />
              <input type="email" placeholder="name@company.com" className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Password</label>
              {isLogin && (
                <Link href="/forgot-password" size={10} className="text-[10px] font-bold text-blue-600 hover:underline">Forgot Password?</Link>
              )}
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-3.5 text-slate-400" />
              <input type="password" placeholder="••••••••" className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
            </div>
          </div>

          <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
            {isLogin ? "Sign In" : "Create Account"} <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="pt-6 border-t border-slate-50 flex items-center justify-center gap-2 text-emerald-600">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">HIPAA Compliant Session</span>
        </div>
      </div>
    </div>
  );
}