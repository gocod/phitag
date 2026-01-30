"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import "./globals.css";
import AuthProvider from '@/components/AuthProvider';
import Nav from '@/components/Nav';
import { ShieldCheck, Shield, Scale, ChevronUp } from 'lucide-react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  return (
    <html lang="en">
      <body className="bg-milk-white flex flex-col h-screen overflow-hidden text-clinical-grey font-sans">
        <AuthProvider>
          {/* Header Component (Contains Auth Logic) */}
          <Nav />
          
          <main className="flex-1 overflow-y-auto bg-milk-white">
            <div className="max-w-7xl mx-auto p-12">
              {children}
            </div>
          </main>
          
          {/* Footer Section */}
          <footer className="h-16 border-t border-gray-200 bg-white flex items-center justify-between px-8 shrink-0 z-[60]">
            <div className="flex items-center gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-sm rotate-45" />
                <span>PHItag v1.2</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600">
                <ShieldCheck size={12} /> SOC2 TYPE II
              </div>
              <div className="hidden lg:block">HIPAA VAULT VERIFIED</div>
            </div>
            
            <div className="flex gap-8 text-[10px] font-black text-blue-600 uppercase tracking-widest items-center">
              <Link href="/security" className="hover:text-blue-800 transition-colors">Security</Link>
              
              <div 
                className="relative group"
                onMouseEnter={() => setIsLegalOpen(true)}
                onMouseLeave={() => setIsLegalOpen(false)}
              >
                <button className="flex items-center gap-1 hover:text-blue-800 transition-colors py-4 uppercase border-none bg-transparent">
                  Legal <ChevronUp size={12} className={`transition-transform ${isLegalOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isLegalOpen && (
                  <div className="absolute bottom-[80%] right-0 pb-4 w-48 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-2">
                      <Link href="/privacy" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors">
                        <Shield size={14} className="text-slate-400" />
                        <span className="text-slate-700 normal-case font-bold">Privacy Policy</span>
                      </Link>
                      <Link href="/terms" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors">
                        <Scale size={14} className="text-slate-400" />
                        <span className="text-slate-700 normal-case font-bold">Terms of Service</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/support" className="hover:text-blue-800 transition-colors">Support</Link>
              <Link href="/status" className="hover:text-blue-800 transition-colors">System Status</Link>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}