"use client";
import React from 'react';
import { 
  HardDrive, 
  User, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRightLeft,
  DollarSign
} from 'lucide-react';

export default function TracebackMap() {
  const resources = [
    { id: "vm-prod-01", type: "Virtual Machine", owner: "Clinical-Ops", cost: "$420.00", status: "mapped" },
    { id: "sql-db-hipaa", type: "SQL Database", owner: "Radiology", cost: "$890.00", status: "mapped" },
    { id: "unidentified-disk-7b", type: "Managed Disk", owner: "UNKNOWN", cost: "$115.00", status: "orphaned" },
    { id: "app-service-front", type: "App Service", owner: "Patient-Portal", cost: "$210.00", status: "mapped" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 📊 SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attribution Rate</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-compliance-blue">94.2%</span>
            <span className="text-emerald-500 text-xs font-bold mb-1">+2.1%</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Untraceable Spend</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-red-500">$1,142</span>
            <span className="text-slate-400 text-xs font-bold mb-1">this month</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Resources</p>
          <span className="text-3xl font-black text-compliance-blue">1,204</span>
        </div>
      </div>

      {/* 🗺️ THE MAP TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-compliance-blue">Resource Traceback Map</h2>
            <p className="text-sm text-slate-400">Tracing physical Azure infrastructure to Financial Cost Centers.</p>
          </div>
          <button className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2">
            <ArrowRightLeft size={14} /> Re-sync Azure Graph
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Azure Resource</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Owner</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Mtd Cost</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {resources.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <HardDrive size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{r.id}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-xs text-slate-500 font-medium">{r.type}</td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${r.status === 'orphaned' ? 'bg-red-400' : 'bg-blue-400'}`} />
                    <span className={`text-sm font-bold ${r.status === 'orphaned' ? 'text-red-500' : 'text-slate-600'}`}>
                      {r.owner}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm font-mono font-bold text-slate-600 text-right">{r.cost}</td>
                <td className="px-8 py-5">
                  {r.status === 'mapped' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">
                      <CheckCircle2 size={12} /> Traceable
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase">
                      <AlertTriangle size={12} /> Orphaned
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 💡 THE FINOPS INSIGHT */}
      <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white flex items-center justify-between shadow-xl shadow-blue-100">
        <div className="space-y-2">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <DollarSign size={20} className="text-blue-200" />
            Unallocated Spend Detected
          </h3>
          <p className="text-blue-100 text-sm opacity-80">
            You have 14 resources without a valid 'CostCenter' tag, totaling $1,142 in unallocated spend this month.
          </p>
        </div>
        <button className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all">
          Trigger Auto-Remediation
        </button>
      </div>
    </div>
  );
}