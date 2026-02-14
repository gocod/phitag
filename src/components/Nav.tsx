"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from "next-auth/react";
import { 
  UserCircle, ChevronDown, Clock, Search, 
  Zap, ArrowUpRight, Settings, ClipboardList, 
  HardDrive, FileSearch, X, Command
} from 'lucide-react';

export default function Nav() {
  const [lastScanned, setLastScanned] = useState("");
  const [isSuiteOpen, setIsSuiteOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // New Search State
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Handle Clock and Keyboard Shortcuts
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setLastScanned(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
      }));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') setIsSearchOpen(false);
    };

    updateClock();
    window.addEventListener('keydown', handleKeyDown);
    setIsSuiteOpen(false); 
    
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pathname]);

  const suiteModules = {
    enforcement: [
      { name: "Policy Engine", href: "/schema", icon: <Zap size={16} />, desc: "Proactive drift enforcement" },
    ],
    visibility: [
      { name: "Traceback Map", href: "/infrastructure", icon: <HardDrive size={16} />, desc: "Resource-to-owner mapping" },
      { name: "Audit Vault", href: "/audit", icon: <FileSearch size={16} />, desc: "HIPAA compliance evidence" },
    ]
  };

  return (
    <>
      <header className="shrink-0 bg-white border-b border-gray-200 z-[100] relative">
        {/* TIER 1: GLOBAL NAV */}
        <div className="h-14 px-8 flex items-center justify-between border-b border-gray-50">
          <div className="flex items-center gap-12">
            {/* LOGO */}
            <Link href="/" className="flex items-center gap-1 group cursor-pointer">
              <Image 
                src="/logo.png" 
                alt="PHItag Logo" 
                width={30} 
                height={25} 
                className="object-contain w-[30px] h-auto" 
                priority 
              />
              <span className="font-black text-xl tracking-tighter text-[#003366] italic">PHItag</span>
            </Link>

            {/* MAIN LINKS */}
            <nav className="flex items-center gap-8 text-[13px] font-bold text-slate-500 tracking-tight">
              <div className="relative" onMouseEnter={() => setIsSuiteOpen(true)} onMouseLeave={() => setIsSuiteOpen(false)}>
                <button className={`flex items-center gap-1 hover:text-blue-600 transition-colors py-4 cursor-pointer ${isSuiteOpen ? 'text-blue-600' : ''}`}>
                  Governance Suite <ChevronDown size={14} className={`transition-transform ${isSuiteOpen ? 'rotate-180' : ''}`} />
                </button>
                {/* ... (Suite Dropdown Content) ... */}
                {isSuiteOpen && (
                  <div className="absolute top-[100%] -left-4 w-[480px] bg-white border border-gray-200 shadow-2xl rounded-3xl p-6 flex gap-8 z-[110] animate-in fade-in slide-in-from-top-2">
                    <div className="flex-1 space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Build & Enforce</h4>
                      {suiteModules.enforcement.map((link) => (
                        <Link key={link.name} href={link.href} className="block group cursor-pointer">
                          <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{link.name}</div>
                          <div className="text-[10px] text-slate-400 leading-tight mt-0.5 font-medium">{link.desc}</div>
                        </Link>
                      ))}
                    </div>
                    <div className="w-[1px] bg-slate-100" />
                    <div className="flex-1 space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Track & Audit</h4>
                      {suiteModules.visibility.map((link) => (
                        <Link key={link.name} href={link.href} className="block group cursor-pointer">
                          <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{link.name}</div>
                          <div className="text-[10px] text-slate-400 leading-tight mt-0.5 font-medium">{link.desc}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link href="/pricing" className="hover:text-blue-600 transition-colors cursor-pointer">Pricing</Link>
              <Link href="/solutions" className="hover:text-blue-600 transition-colors cursor-pointer">Solutions</Link>
              <Link href="/about" className="hover:text-blue-600 transition-colors cursor-pointer">About</Link>
              <Link href="/docs" className="hover:text-blue-600 transition-colors cursor-pointer">Documentation</Link>
            </nav>
          </div>

          {/* IDENTITY & ACTIONS */}
          <div className="flex items-center gap-6">
            {/* ACTIVE SEARCH BUTTON */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="group flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
            >
              <Search size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
              <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-400 shadow-sm">
                <Command size={10} /> K
              </div>
            </button>
            
            <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  {status === "loading" ? (
                    <div className="w-6 h-6 rounded-full bg-slate-100 animate-pulse" />
                  ) : session?.user?.image ? (
                    <div className="w-7 h-7 rounded-full border border-slate-200 overflow-hidden shadow-sm">
                      <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <UserCircle size={24} className="text-slate-300" strokeWidth={1.5} />
                  )}
                </div>

                {!session ? (
                  <button onClick={() => signIn()} className="cursor-pointer text-[11px] font-black text-slate-500 hover:text-[#003366] uppercase tracking-widest transition-colors py-2">
                    Sign In
                  </button>
                ) : (
                  <button onClick={() => signOut()} className="cursor-pointer text-[11px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest transition-colors py-2">
                    Sign Out
                  </button>
                )}
              </div>

              <Link href="/pricing" className="text-[10px] font-extrabold bg-[#003366] text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-blue-900 transition-all flex items-center gap-2 uppercase tracking-widest shrink-0 whitespace-nowrap cursor-pointer">
                Get Started <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* TIER 2: CONTEXT BAR */}
        <div className="h-10 px-8 flex items-center justify-between bg-slate-50/50">
          {/* ... (Context Bar Content) ... */}
          <div className="flex items-center gap-6 text-[10px] font-bold">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-400 uppercase tracking-widest">Context:</span>
            <span className="text-[#003366] uppercase tracking-tight font-black">Production-US-East</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-200" />
          <div className="flex items-center gap-2 font-mono text-slate-500">
            <Clock size={12} className="text-blue-500" />
            SYNC: <span className="text-blue-600 font-bold uppercase">{lastScanned || "PENDING"}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
            {session?.user?.name ? `Operator: ${session.user.name}` : "Public Read-Only Mode"}
          </span>
          {session && (
            <Link href="/settings" className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-[#003366] cursor-pointer">
              <Settings size={14} />
            </Link>
          )}
        </div>
        </div>
      </header>

      {/* SEARCH MODAL OVERLAY */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsSearchOpen(false)} />
          
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100">
              <Search size={20} className="text-[#003366]" />
              <input 
                autoFocus
                placeholder="Search resources, policies, or documentation..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400"
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-4 bg-slate-50/50">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Activity</span>
              </div>
              <div className="space-y-1">
                {['HIPAA-Compliance-Audit', 'Infrastructure-Map', 'Global-Tag-Policy'].map((item) => (
                  <div key={item} className="flex items-center justify-between p-3 hover:bg-white hover:shadow-sm rounded-xl cursor-pointer group transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg border border-slate-100 group-hover:border-blue-100">
                        <FileSearch size={14} className="text-slate-400 group-hover:text-blue-600" />
                      </div>
                      <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">{item}</span>
                    </div>
                    <ArrowUpRight size={14} className="text-slate-300 group-hover:text-blue-600" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-[10px] font-bold text-slate-400">
              <div className="flex gap-4">
                <span><kbd className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">Enter</kbd> to select</span>
                <span><kbd className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">Esc</kbd> to close</span>
              </div>
              <span className="text-[#003366] italic">PHItag Intelligence v1.2</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}