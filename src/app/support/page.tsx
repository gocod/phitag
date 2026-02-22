"use client";
import React, { useState, useRef } from 'react';
import { Mail, MessageSquare, FileText, LifeBuoy, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

export default function SupportPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const formRef = useRef<HTMLDivElement>(null);

  // 🚀 Scroll Function
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      subject: formData.get('subject'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus('success');
      } else {
        alert("Something went wrong. Please try again.");
        setStatus('idle');
      }
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6 animate-in zoom-in duration-300">
        <div className="flex justify-center">
          <CheckCircle2 size={64} className="text-emerald-500" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">Message Received</h1>
        <p className="text-slate-500 font-medium">
          We've routed your request to the PHItag compliance team. <br />
          You'll receive a response at your inbox shortly.
        </p>
        <button 
          onClick={() => setStatus('idle')}
          className="text-blue-600 font-bold uppercase tracking-widest text-xs"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-16 py-10 animate-in fade-in duration-700">
      <header className="text-center space-y-4">
        <h2 className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] italic">Assistance</h2>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">How can we <span className="text-blue-600">help?</span></h1>
        <p className="text-slate-500 max-w-lg mx-auto font-medium">Enterprise-grade support for your cloud governance journey.</p>
      </header>

      <div className="grid md:grid-cols-5 gap-12 items-start">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-4">
            <FileText size={28} className="text-blue-400" />
            <h2 className="text-xl font-bold">Request a BAA</h2>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Enterprise customers can initiate the Business Associate Agreement legal review here.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-[2.5rem] p-8 space-y-4">
            <LifeBuoy size={28} className="text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Technical Support</h2>
            <p className="text-slate-500 text-xs leading-relaxed font-medium">
              Average response time for Elite customers: <strong>2 Hours</strong>.
            </p>
            {/* 🛠️ UPDATED BUTTON: Replaces the static email link */}
            <button 
              onClick={scrollToForm}
              className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:translate-x-1 transition-transform group"
            >
              <Mail size={16} /> 
              <span>Open Support Ticket</span>
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>

        {/* 🎯 Added formRef here to capture the scroll target */}
        <div ref={formRef} className="md:col-span-3 bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm scroll-mt-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Subject</label>
                <select name="subject" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all">
                  <option>Technical Support</option>
                  <option>BAA / Legal Request</option>
                  <option>Billing Inquiry</option>
                  <option>Feature Request</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email</label>
                <input name="email" required type="email" placeholder="you@company.com" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Message</label>
              <textarea name="message" required rows={4} placeholder="Describe your issue..." className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>

            <button 
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
            >
              {status === 'loading' ? <Loader2 className="animate-spin" /> : <>Send Message <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>

      <footer className="text-center pt-10">
        <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-tighter">Check the Documentation first?</p>
        <a href="/docs" className="bg-slate-100 text-slate-600 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
          Browse Knowledge Base
        </a>
      </footer>
    </div>
  );
}