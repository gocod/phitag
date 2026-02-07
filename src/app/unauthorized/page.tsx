import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-milk-white">
      <div className="max-w-md w-full text-center space-y-8 p-10 bg-white border border-gray-100 shadow-2xl rounded-3xl">
        {/* Icon Header */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-100 blur-2xl rounded-full opacity-50" />
            <div className="relative bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <ShieldAlert className="w-12 h-12 text-red-500" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-compliance-blue p-1.5 rounded-lg shadow-lg">
              <Lock className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">
            PHItag <span className="text-red-500">Secure Gate</span>
          </h1>
          <div className="h-1 w-12 bg-red-500 mx-auto rounded-full" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest pt-2">
            Access Level: Restricted
          </p>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your current identity does not have the clearance required to access the 
            <span className="font-bold text-slate-600"> Control Plane</span>. 
            Please sign in with an authorized administrative account.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link 
            href="/login" 
            className="w-full py-3 bg-compliance-blue text-white rounded-xl font-bold text-sm shadow-lg hover:bg-blue-800 transition-all active:scale-[0.98]"
          >
            Sign In to PHItag
          </Link>
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>

        {/* Footer Code */}
        <div className="pt-4 border-t border-gray-50">
          <p className="text-[10px] font-mono text-slate-300 uppercase">
            Error Code: 403_RESTRICTED_ACCESS_GOVERNANCE
          </p>
        </div>
      </div>
    </div>
  );
}