"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from "next-auth/react"; // Cleaned up imports
import { 
  UserCircle, ChevronDown, Clock, Search, 
  Zap, ArrowUpRight, Settings, ClipboardList, HardDrive, FileSearch 
} from 'lucide-react';

export default function Nav() {
  const [lastScanned, setLastScanned] = useState("");
  const [isSuiteOpen, setIsSuiteOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setLastScanned(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
      }));
    };
    updateClock();
    setIsSuiteOpen(false); 
  }, [pathname]);

  const suiteModules = {
    enforcement: [
      { name: "Policy Engine", href: "/", icon: <Zap size={16} />, desc: "Proactive drift enforcement" },
      { name: "Tag Registry", href: "/registry", icon: <ClipboardList size={16} />, desc: "Healthcare schema standards" },
    ],
    visibility: [
      { name: "Traceback Map", href: "/infrastructure", icon: <HardDrive size={16} />, desc: "Resource-to-owner mapping" },
      { name: "Audit Vault", href: "/audit", icon: <FileSearch size={16} />, desc: "HIPAA compliance evidence" },
    ]
  };

  return (
    <header className="shrink-0 bg-white border-b border-gray-200 z-50">
      {/* TIER 1: GLOBAL NAV */}
      <div className="h-14 px-8 flex items-center justify-between border-b border-gray-50">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1 rounded-lg">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <span className="font-black text-xl tracking-tighter text-compliance-blue italic">PHItag</span>
          </Link>

          <nav className="flex items-center gap-8 text-[13px] font-bold text-slate-500 tracking-tight">
            <div className="relative" onMouseEnter={() => setIsSuiteOpen(true)} onMouseLeave={() => setIsSuiteOpen(false)}>
              <button className={`flex items-center gap-1 hover:text-blue-600 transition-colors py-4 ${isSuiteOpen ? 'text-blue-600' : ''}`}>
                Governance Suite <ChevronDown size={14} className={`transition-transform duration-200 ${isSuiteOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSuiteOpen && (
                <div className="absolute top-[100%] -left-4 w-[480px] bg-white border border-gray-200 shadow-2xl rounded-3xl p-6 flex gap-8">
                  <div className="flex-1 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Build & Enforce</h4>
                    {suiteModules.enforcement.map((link) => (
                      <Link key={link.name} href={link.href} className="block group">
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{link.name}</div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-0.5 font-medium">{link.desc}</div>
                      </Link>
                    ))}
                  </div>
                  <div className="w-[1px] bg-slate-100" />
                  <div className="flex-1 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Track & Audit</h4>
                    {suiteModules.visibility.map((link) => (
                      <Link key={link.name} href={link.href} className="block group">
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{link.name}</div>
                        <div className="text-[10px] text-slate-400 leading-tight mt-0.5 font-medium">{link.desc}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link href="/pricing">Pricing</Link>
            <Link href="/solutions">Solutions</Link>
            <Link href="/about">About</Link>
            <Link href="/docs">Documentation</Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <Search size={18} className="text-slate-400 cursor-pointer hover:text-blue-600 transition-colors" />
          <div className="flex items-center gap-5">
            {/* 🔐 AUTH LOGIC BUTTON START */}
{!session ? (
  <Link 
    href="/login" 
    className="text-[11px] font-bold text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-colors"
  >
    Sign In
  </Link>
) : (
  <button 
    onClick={() => signOut()}
    className="text-[11px] font-bold text-red-500 hover:text-red-600 uppercase tracking-widest transition-colors"
  >
    Sign Out
  </button>
)}
            {/* 🔐 AUTH LOGIC BUTTON END */}

            <Link href="/pricing" className="text-[10px] font-extrabold bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center gap-2 uppercase tracking-[0.1em]">
              Get Started <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* TIER 2: CONTEXT BAR */}
      <div className="h-12 px-8 flex items-center justify-between bg-slate-50/40">
        <div className="flex items-center gap-6 text-[10px] font-bold text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-slate-400 uppercase tracking-widest">Context:</span>
            <span className="text-compliance-blue uppercase tracking-tight">Production-US-East</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-200" />
          <div className="flex items-center gap-2 font-mono uppercase">
            <Clock size={12} className="text-blue-500" />
            Last Sync: <span className="text-blue-600">{lastScanned || "PENDING"}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/settings" className="p-1.5 hover:bg-white rounded-md transition-colors text-slate-400 hover:text-blue-600">
            <Settings size={18} />
          </Link>
          <div className="flex items-center gap-2.5 pl-4 border-l border-slate-200">
            <div className="text-right">
              <p className="text-[11px] font-black text-compliance-blue leading-none text-right tracking-tight">
                {session?.user?.name || "Guest Access"}
              </p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
                {session ? "Control Plane Access" : "Identity Pending"}
              </p>
            </div>
            <div className="bg-white p-1 rounded-full border border-slate-200 shadow-sm text-slate-300">
               {session?.user?.image ? (
                 <img src={session.user.image} className="w-6 h-6 rounded-full" alt="profile" />
               ) : (
                 <UserCircle size={24} />
               )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}