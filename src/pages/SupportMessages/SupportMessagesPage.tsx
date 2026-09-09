import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  AlertCircle,
  Smartphone,
  ExternalLink,
  Crown,
  Eye,
  Send,
  UserCheck,
} from 'lucide-react';
import { supportMessageService } from '@/services/supportMessageService';
import { SupportMessage } from '@/types';
import { SearchInput } from '@/components/common/SearchInput';
import { StatCard } from '@/components/common/StatCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Modal } from '@/components/common/Modal';
import { ExportDropdown } from '@/components/common/ExportDropdown';
import { formatDateTime, formatTimeAgo, formatPhoneNumber } from '@/utils/formatters';

export const SupportMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Selected message for details & resolution modal
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    const res = await supportMessageService.getSupportMessages({
      status: statusFilter,
      priority: priorityFilter,
      search,
    });
    if (res.data) setMessages(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter, priorityFilter, search]);

  const handleUpdateStatus = async (status: SupportMessage['status']) => {
    if (!selectedMessage) return;
    setUpdating(true);
    await supportMessageService.updateMessageStatus(selectedMessage.id, status, resolutionNotes);
    setUpdating(false);
    setSelectedMessage(null);
    fetchMessages();
  };

  const openCount = messages.filter((m) => m.status === 'open').length;
  const inProgressCount = messages.filter((m) => m.status === 'in_progress').length;
  const resolvedCount = messages.filter((m) => m.status === 'resolved').length;

  const getPriorityStyle = (priority: SupportMessage['priority']) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return 'bg-rose-100 text-rose-950 border-rose-300';
      case 'medium':
        return 'bg-amber-100 text-amber-950 border-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-950 border-emerald-300';
    }
  };

  const getStatusStyle = (status: SupportMessage['status']) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-100 text-emerald-950 border-emerald-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-950 border-blue-300';
      default:
        return 'bg-amber-100 text-amber-950 border-amber-300';
    }
  };

  return (
    <div className="space-y-6 font-alata text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-100/70 via-emerald-50/50 to-white border-2 border-emerald-200 rounded-3xl p-6 sm:p-7 shadow-card-subtle">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-500 flex items-center justify-center text-white shadow-emerald-sm flex-shrink-0 border-2 border-emerald-300">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
              Customer & Salon Support Center
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold shadow-2xs">
              Live Inquiries
            </span>
          </div>
          <p className="text-xs text-black mt-1.5 leading-relaxed font-bold">
            Centralized communications portal for salon owner inquiries, customer care requests, and technical assistance.
          </p>
        </div>

        <ExportDropdown
          data={messages.map((m) => ({
            Sender: m.customer_name,
            Salon: m.salon_name,
            Phone: m.phone_number,
            Subject: m.subject,
            Message: m.message,
            Category: m.category,
            Priority: m.priority,
            Status: m.status,
            AppVersion: m.app_version,
            CreatedAt: m.created_at,
          }))}
          fileName="support_messages_log"
          pdfConfig={{
            title: 'Customer & Salon Support Messages Report',
            subtitle: `Total Inquiries: ${messages.length}`,
            headers: ['Sender / Salon', 'Phone', 'Subject', 'Priority', 'Status', 'Date'],
            rows: messages.map((m) => [
              `${m.customer_name} (${m.salon_name || '—'})`,
              m.phone_number || '—',
              m.subject,
              m.priority.toUpperCase(),
              m.status.toUpperCase(),
              formatDateTime(m.created_at),
            ]),
          }}
        />
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Open Inquiries"
          value={openCount}
          icon={<AlertCircle className="w-5 h-5" />}
          subtitle="Awaiting response / action"
          variant="amber"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          icon={<Clock className="w-5 h-5" />}
          subtitle="Currently being resolved"
          variant="blue"
        />
        <StatCard
          title="Resolved Inquiries"
          value={resolvedCount}
          icon={<CheckCircle2 className="w-5 h-5" />}
          subtitle="Successfully handled tickets"
          variant="emerald"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-2 border-emerald-100 p-4 rounded-2xl shadow-card-subtle space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-emerald-50/70 p-1 rounded-xl border border-emerald-200">
            {['all', 'open', 'in_progress', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-black hover:text-emerald-800'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white border-2 border-emerald-200 text-black font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by sender name, salon, phone, subject, or message..."
          className="text-black font-bold"
        />
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {loading ? (
          <LoadingSpinner message="Fetching live support messages..." size="md" />
        ) : messages.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="w-6 h-6" />}
            title="No support messages found"
            description="No customer inquiries matched your search or status filter."
          />
        ) : (
          messages.map((item) => (
            <div
              key={item.id}
              className="bg-white border-2 border-emerald-100 rounded-2xl p-5 hover:border-emerald-500 transition-all shadow-card-subtle flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border uppercase ${getStatusStyle(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border uppercase ${getPriorityStyle(item.priority)}`}>
                    {item.priority} priority
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-950 border border-emerald-200 uppercase">
                    {item.category}
                  </span>
                  {item.app_version && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-black border border-slate-300">
                      App v{item.app_version}
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-black">{item.subject}</h3>
                <p className="text-xs text-black font-semibold leading-relaxed line-clamp-2">
                  {item.message}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-black font-bold pt-1">
                  <span>From: <strong className="text-black">{item.customer_name}</strong></span>
                  {item.salon_name && <span>Salon: <strong className="text-black">{item.salon_name}</strong></span>}
                  {item.phone_number && <span>Phone: <strong className="text-black">{formatPhoneNumber(item.phone_number)}</strong></span>}
                  <span className="text-emerald-900 font-semibold">{formatTimeAgo(item.created_at)}</span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-100">
                <button
                  onClick={() => {
                    setSelectedMessage(item);
                    setResolutionNotes(item.notes || '');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-emerald-sm flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect & Manage</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Support Details & Management Modal */}
      {selectedMessage && (
        <Modal
          isOpen={!!selectedMessage}
          onClose={() => setSelectedMessage(null)}
          title="Support Inquiry Details"
          subtitle={`Ticket ID: ${selectedMessage.id}`}
        >
          <div className="space-y-4 font-alata text-xs text-black">
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2 font-bold text-black">
              <div className="flex justify-between">
                <span>Sender Name:</span>
                <span className="text-black font-bold">{selectedMessage.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Salon Partner:</span>
                <span className="text-black font-bold">{selectedMessage.salon_name || 'Direct Inquiry'}</span>
              </div>
              <div className="flex justify-between">
                <span>Contact Phone:</span>
                <span className="text-black font-bold">{formatPhoneNumber(selectedMessage.phone_number)}</span>
              </div>
              <div className="flex justify-between">
                <span>App Version / Platform:</span>
                <span className="text-black font-bold">v{selectedMessage.app_version || '1.0.0'} ({selectedMessage.platform || 'Android'})</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span className="text-black">{formatDateTime(selectedMessage.created_at)}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-black mb-1.5">Subject: {selectedMessage.subject}</h4>
              <div className="p-4 bg-white border-2 border-emerald-200 rounded-xl text-black font-bold text-xs leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedMessage.phone_number && (
                <a
                  href={`tel:${selectedMessage.phone_number}`}
                  className="px-3 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold border border-emerald-300 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Call Sender</span>
                </a>
              )}
              {selectedMessage.phone_number && (
                <a
                  href={`https://wa.me/${selectedMessage.phone_number.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-emerald-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>WhatsApp Message</span>
                </a>
              )}
            </div>

            {/* Admin Notes & Resolution */}
            <div className="space-y-2 pt-3 border-t border-emerald-200">
              <label className="block text-xs font-bold uppercase text-black">
                Super Admin Resolution Notes:
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter actions taken, follow-up status, or resolution notes..."
                rows={3}
                className="w-full bg-[#f8fafc] border-2 border-emerald-200 rounded-xl p-3 text-xs text-black font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Status Change Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <button
                onClick={() => handleUpdateStatus('open')}
                disabled={updating}
                className="px-3 py-2 rounded-xl bg-amber-100 text-amber-950 hover:bg-amber-200 border border-amber-300 font-bold transition-all"
              >
                Mark as Open
              </button>
              <button
                onClick={() => handleUpdateStatus('in_progress')}
                disabled={updating}
                className="px-3 py-2 rounded-xl bg-blue-100 text-blue-950 hover:bg-blue-200 border border-blue-300 font-bold transition-all"
              >
                Mark In Progress
              </button>
              <button
                onClick={() => handleUpdateStatus('resolved')}
                disabled={updating}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-emerald-sm transition-all"
              >
                Resolve Ticket
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
