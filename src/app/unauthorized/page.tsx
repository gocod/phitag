import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Lock, Fingerprint } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-milk-white">
      {/* Container with a "Glassmorphism" hint */}
      <div className="max-w-md w-full text-center space-y-8 p-10 bg-white border border-slate-200 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem]">
        
        {/* Visual Alert Section */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Soft glow behind icon */}
            <div className="absolute inset-0 bg-red-50 blur-3xl rounded-full opacity-60" />
            <div className="relative bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-red-500" strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#003366] p-2 rounded-xl shadow-lg border-2 border-white">
              <Lock className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>

        {/* Messaging */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-[#003366] tracking-tighter italic">
              PHItag <span className="text-red-500 not-italic">Secure Gate</span>
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Access Level: Restricted
            </p>
          </div>
          
          <div className="h-0.5 w-8 bg-slate-100 mx-auto" />
          
          <p className="text-slate-500 text-sm leading-relaxed px-2 font-medium">
            Your identity has been authenticated, but you lack the 
            <span className="text-[#003366] font-bold"> clearance level</span> required for this sector of the Control Plane.
          </p>
        </div>

        {/* Action Buttons with explicit Hand/Figure cursor */}
        <div className="flex flex-col gap-4 pt-2">
          <Link 
            href="/login" 
            className="group relative w-full py-4 bg-[#003366] text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-900/10 hover:bg-blue-900 transition-all active:scale-[0.98] cursor-pointer overflow-hidden"
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              <Fingerprint size={16} className="text-blue-300" />
              Request Administrative Access
            </div>
            {/* Subtle hover shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Link>

          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-[#003366] transition-colors cursor-pointer group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            Exit to Secure Dashboard
          </Link>
        </div>

        {/* Forensic Footer */}
        <div className="pt-6 border-t border-slate-50 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-[9px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-red-400/20 flex items-center justify-center">
               <span className="w-1 h-1 rounded-full bg-red-500" />
            </span>
            LOG_ID: {Math.random().toString(36).substring(7).toUpperCase()}
          </div>
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
            Error 403: Insufficient Governance Privileges
          </p>
        </div>
      </div>
    </div>
  );
}