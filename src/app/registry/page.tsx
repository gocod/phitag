"use client";
import React, { useState } from 'react';
import { Search, Filter, Download, Plus, CheckCircle, Lock, Unlock } from 'lucide-react';
import { complianceSettings } from '@/lib/complianceStore';

export default function RegistryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCertified, setIsCertified] = useState(false);

  const allResources = [
    { id: '1', name: 'sql-patient-db', type: 'Azure SQL', status: complianceSettings.forceNonCompliant ? 'Non-Compliant' : 'Compliant', phi: 'Yes' },
    { id: '2', name: 'web-portal-vm', type: 'Virtual Machine', status: 'Non-Compliant', phi: 'Yes' },
    { id: '3', name: 'storage-logs-gen2', type: 'Storage Account', status: 'Compliant', phi: 'No' },
    { id: '4', name: 'auth-service-aks', type: 'Kubernetes Service', status: 'Compliant', phi: 'No' },
    { id: '5', name: 'clinical-images-blob', type: 'Blob Storage', status: 'Non-Compliant', phi: 'Yes' },
  ];

  const filteredResources = allResources.filter(res => 
    res.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl animate-in fade-in duration-500">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-compliance-blue">Resource Registry</h1>
            {isCertified && (
              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 animate-bounce">
                <CheckCircle size={12} /> CERTIFIED BY JENNY
              </span>
            )}
          </div>
          <p className="text-clinical-grey mt-2">Finalize and sign-off on monthly cloud compliance inventory.</p>
        </div>
        
        {/* 🔘 THE INTERACTIVE BUTTON */}
        {!isCertified ? (
          <button 
            onClick={() => setIsCertified(true)}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-all shadow-md active:scale-95"
          >
            <CheckCircle size={18} /> Certify Inventory
          </button>
        ) : (
          <button 
            onClick={() => setIsCertified(false)}
            className="flex items-center gap-2 text-clinical-grey text-xs hover:text-compliance-blue transition-colors font-medium"
          >
            <Unlock size={12} /> Unlock to edit
          </button>
        )}
      </header>

      {/* 🔍 SEARCH BAR - Disables when certified */}
      <div className={`bg-white p-4 rounded-xl border border-gray-200 mb-6 flex gap-4 shadow-sm transition-all duration-500 ${isCertified ? 'bg-gray-50 opacity-60' : 'opacity-100'}`}>
        <div className="relative flex-1">
          {isCertified ? (
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          )}
          <input 
            type="text"
            disabled={isCertified}
            placeholder={isCertified ? "Inventory locked for audit..." : "Search resources..."}
            className="w-full pl-10 pr-4 py-2 bg-milk-white border border-gray-200 rounded-lg focus:outline-none disabled:cursor-not-allowed"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button disabled={isCertified} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-30">
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-milk-white border-b border-gray-200">
              <th className="p-4 text-xs font-bold uppercase text-clinical-grey">Resource Name</th>
              <th className="p-4 text-xs font-bold uppercase text-clinical-grey">Type</th>
              <th className="p-4 text-xs font-bold uppercase text-clinical-grey">PHI Status</th>
              <th className="p-4 text-xs font-bold uppercase text-clinical-grey">Compliance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredResources.map((res) => (
              <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-semibold text-compliance-blue">{res.name}</td>
                <td className="p-4 text-sm text-clinical-grey">{res.type}</td>
                <td className="p-4">
                   <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-500">{res.phi === 'Yes' ? 'PHI' : 'PUBLIC'}</span>
                </td>
                <td className="p-4">
                  <span className={`text-sm font-bold ${res.status === 'Compliant' ? 'text-green-600' : 'text-red-500'}`}>
                    {res.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}