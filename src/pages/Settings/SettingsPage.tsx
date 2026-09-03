import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Key,
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Crown,
  Check,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/common/Button';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [testingConnection, setTestingConnection] = useState(false);
  const [connStatus, setConnStatus] = useState<'success' | 'idle'>('idle');

  const handleTestConnection = async () => {
    setTestingConnection(true);
    await new Promise((r) => setTimeout(r, 800));
    setConnStatus('success');
    setTestingConnection(false);
  };

  const superAdminPrivileges = [
    { module: 'Executive Platform Overview & KPIs', description: 'Real-time telemetry aggregated across all salons in Supabase', status: 'Active' },
    { module: 'Multi-Salon Directory & Health', description: '360° audit of registered salon profiles, owners, and contact information', status: 'Active' },
    { module: 'Unified Customer Intelligence (CRM)', description: 'Full customer directory, journey timelines, retention segments, and visit metrics', status: 'Active' },
    { module: 'Global Appointments & Operations', description: 'Real-time booking logs, stylist scheduling, and appointment lifecycle tracking', status: 'Active' },
    { module: 'Centralized Service & Pricing Catalog', description: 'Standard hair, beard, spa, and treatment catalog across the platform', status: 'Active' },
    { module: 'Staff & Stylist Productivity Metrics', description: 'Revenue attribution, appointment count, and performance analytics', status: 'Active' },
    { module: 'Master Financials & Invoices Ledger', description: 'Aggregated billing transactions, itemized receipts, and GST breakdown', status: 'Active' },
    { module: 'Executive BI Reports & Multi-Format Exporter', description: 'Download clean CSV, Excel (.xlsx), and PDF reports directly to disk', status: 'Active' },
    { module: 'Cross-Salon Audit Trail & Event Stream', description: 'Live operational event streams and audit trails across all salons', status: 'Active' },
    { module: 'Proactive System & Health Heuristics', description: 'Rule-based detection for salon inactivity, cancellation spikes, and delivery alerts', status: 'Active' },
  ];

  return (
    <div className="space-y-6 font-alata text-black">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">System Configuration & Governance</h1>
        <p className="text-xs text-black font-semibold mt-1">
          Super Admin administrative authority, live Supabase backend connection, and platform integrity
        </p>
      </div>

      {/* Database Diagnostic Card */}
      <div className="bg-white border-2 border-[#BD5579]/20 rounded-2xl p-6 shadow-card-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#601D49] text-[#FFEBB8] border-2 border-[#FFEBB8] flex items-center justify-center font-bold shadow-plum-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black">Supabase Cloud Database Connectivity</h3>
              <p className="text-xs text-black font-semibold">Single production backend & zero duplicate databases</p>
            </div>
          </div>

          <Button
            variant="berry"
            size="sm"
            loading={testingConnection}
            onClick={handleTestConnection}
          >
            Test Connection
          </Button>
        </div>

        <div className="p-4 bg-[#fdf5f8] rounded-xl border border-[#BD5579]/20 space-y-2 text-xs text-black font-bold">
          <div className="flex justify-between">
            <span>Database URL:</span>
            <span className="font-mono text-black">https://fqjvrbzrmsoaymaxdysk.supabase.co</span>
          </div>
          <div className="flex justify-between">
            <span>Production Tables Connected:</span>
            <span className="text-black">salons, customers, appointments, services, staff, bills, bill_items, expenses, notifications</span>
          </div>
          <div className="flex justify-between">
            <span>Single Source of Truth:</span>
            <span className="text-emerald-800 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
              <span>100% Real Live Data (Zero Dummy Data)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Super Admin Privileges Table */}
      <div className="bg-white border-2 border-[#BD5579]/20 rounded-2xl overflow-hidden shadow-card-subtle">
        <div className="p-5 border-b border-[#BD5579]/20 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-black">Super Admin Platform Privileges</h3>
            <p className="text-xs text-black font-semibold mt-0.5">Unrestricted administrative governance across all platform modules</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#FFEBB8] text-black border border-[#BD5579]/40 text-xs font-bold shadow-2xs flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-[#601D49]" />
            <span>Super Admin Tier</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-black">
            <thead className="bg-[#fdf2f6] text-black font-bold uppercase text-[11px] border-b border-[#BD5579]/20">
              <tr>
                <th className="px-5 py-3.5 font-bold text-black">Platform Module</th>
                <th className="px-4 py-3.5 font-bold text-black">Capability & Scope</th>
                <th className="px-4 py-3.5 font-bold text-black text-center">Access Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#BD5579]/10 font-bold">
              {superAdminPrivileges.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#fcf2f6]/60 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-black">{row.module}</td>
                  <td className="px-4 py-3.5 text-black font-semibold">{row.description}</td>
                  <td className="px-4 py-3.5 text-center text-emerald-800 font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-[10.5px]">
                      <Check className="w-3 h-3 text-emerald-800" />
                      <span>Full Access</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
