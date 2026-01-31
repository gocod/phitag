"use client";
import React, { useState } from 'react';
import { Check, ShieldCheck, ArrowRight, ShieldAlert, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSession } from "next-auth/react";

export default function PricingPage() {
  const { data: session } = useSession();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const tiers = [
    {
      name: "Governance Pro",
      price: "$699",
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
      desc: "Ideal for health-tech startups and single-tenant Azure environments.",
      features: [
        "Tag Registry (HIPAA Standard)",
        "Real-time Drift Detection",
        "Up to 1,000 Managed Resources",
        "Weekly Compliance Scorecards",
        "Manual Remediation Hooks",
        "Standard BAA Included"
      ],
      button: "Start Subscription",
      highlight: false
    },
    {
      name: "Compliance Elite",
      price: "$1,899",
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ELITE,
      desc: "Full automated enforcement for hospital systems and large payers.",
      features: [
        "Everything in Pro",
        "Automated Tag Remediation",
        "Infrastructure Traceback Map",
        "Up to 10,000 Managed Resources",
        "HIPAA Audit Vault (Ready-to-Sign)",
        "Policy Enforcement Campaigns",
        "Priority Support (2h Response)"
      ],
      button: "Upgrade to Elite",
      highlight: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      priceId: null, 
      desc: "Total cloud accountability for multi-tenant clinical organizations.",
      features: [
        "Everything in Elite",
        "Unlimited Azure Resources",
        "Multi-Tenant Tenant Mapping",
        "Custom BAA Provisions",
        "SAML / SSO / Azure AD",
        "White-glove Implementation",
        "Dedicated Compliance Engineer"
      ],
      button: "Talk to an Expert",
      highlight: false
    }
  ];

  const handleCheckout = async (priceId: string | null | undefined) => {
    if (!priceId) return;

    if (!session) {
      window.location.href = `/login?callbackUrl=/pricing`;
      return;
    }

    setLoadingPriceId(priceId);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          priceId,
          userEmail: session.user?.email 
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoadingPriceId(null);
        console.error("Checkout error:", data.error);
      }
    } catch (err) {
      setLoadingPriceId(null);
      console.error("Payment failed to initialize");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-10 animate-in fade-in duration-700">
      <section className="text-center space-y-4">
        <h2 className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] italic">Cloud Safeguards</h2>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
          Invest in <span className="text-blue-600">Compliance.</span> <br/>
          Avoid the <span className="italic text-slate-400">Drift.</span>
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed font-medium">
          Zero-data liability architecture. We govern your Azure tags so you can focus on clinical outcomes.
        </p>
      </section>

      <div className="grid md:grid-cols-3 gap-8">
        {tiers.map((tier, i) => (
          <div 
            key={i} 
            className={`relative p-8 rounded-[3.5rem] border transition-all duration-300 ${
              tier.highlight 
                ? 'bg-white border-blue-200 shadow-2xl shadow-blue-100 scale-105 z-10' 
                : 'bg-slate-50 border-slate-200 hover:bg-white'
            }`}
          >
            {tier.highlight && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-blue-200">
                Recommended for Health Systems
              </span>
            )}
            
            <div className="mb-8">
              <h3 className="text-xl font-black text-slate-900 mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">{tier.price}</span>
                {tier.price !== "Custom" && <span className="text-slate-400 font-bold text-sm">/mo</span>}
              </div>
              <p className="text-[11px] text-slate-500 mt-4 leading-relaxed font-bold italic h-10">{tier.desc}</p>
            </div>

            <ul className="space-y-4 mb-10">
              {tier.features.map((feature, j) => (
                <li key={j} className="flex items-start gap-3 text-[13px] text-slate-600 font-bold">
                  <div className="mt-0.5 bg-blue-100 text-blue-600 rounded-lg p-1">
                    <Check size={12} strokeWidth={4} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            {/* 🛠️ DYNAMIC BUTTON LOGIC START */}
            {tier.priceId === null ? (
              <Link 
                href="/support"
                className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center bg-slate-900 text-white hover:bg-black"
              >
                {tier.button}
              </Link>
            ) : (
              <button 
                onClick={() => handleCheckout(tier.priceId)}
                disabled={loadingPriceId === tier.priceId}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                  tier.highlight 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100' 
                    : 'bg-slate-900 text-white hover:bg-black'
                }`}
              >
                {loadingPriceId === tier.priceId ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  tier.button
                )}
              </button>
            )}
            {/* 🛠️ DYNAMIC BUTTON LOGIC END */}
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldAlert size={180} />
        </div>
        
        <div className="space-y-4 text-center md:text-left relative z-10">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <ShieldCheck className="text-emerald-400" size={24} />
            <span className="text-emerald-400 font-black uppercase text-[10px] tracking-widest">HIPAA Safe Harbor</span>
          </div>
          <h2 className="text-3xl font-black italic tracking-tight">Need a signed BAA?</h2>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed font-medium">
            We understand the regulatory burden of healthcare IT. Our Enterprise and Elite plans include a pre-signed Business Associate Agreement.
          </p>
        </div>
        
        <Link href="/support" className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center gap-3 shrink-0 relative z-10 shadow-2xl">
          Contact Compliance <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}