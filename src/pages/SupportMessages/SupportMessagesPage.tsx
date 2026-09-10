import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Crown,
  Eye,
  Send,
  CornerDownRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
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

const PRESET_ANSWERS = [
  'Thank you for reaching out! We have investigated and resolved the issue for your salon.',
  'Your request has been processed. Please restart your mobile app to see the updates.',
  'We have updated your salon profile settings and synced with our live cloud server.',
  'Our technical support team is currently working on this and will follow up shortly.',
];

export const SupportMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Inline answer state per message: { [messageId]: answerText }
  const [inlineAnswers, setInlineAnswers] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);

  // Selected message for detailed inspection modal
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [modalAnswerText, setModalAnswerText] = useState('');
  const [modalSending, setModalSending] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    const res = await supportMessageService.getSupportMessages({
      status: statusFilter,
      category: categoryFilter,
      search,
    });
    if (res.data) setMessages(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter, categoryFilter, search]);

  const handleSendInlineAnswer = async (item: SupportMessage) => {
    const text = (inlineAnswers[item.id] || '').trim();
    if (!text) return;

    setSendingId(item.id);
    const res = await supportMessageService.sendAnswer(item.id, text, {
      salonId: item.salon_id,
      salonName: item.salon_name,
      phone: item.phone || item.phone_number,
    });

    if (res.success) {
      setInlineAnswers((prev) => ({ ...prev, [item.id]: '' }));
      await fetchMessages();
    }
    setSendingId(null);
  };

  const handleSendModalAnswer = async () => {
    if (!selectedMessage || !modalAnswerText.trim()) return;

    setModalSending(true);
    const res = await supportMessageService.sendAnswer(selectedMessage.id, modalAnswerText.trim(), {
      salonId: selectedMessage.salon_id,
      salonName: selectedMessage.salon_name,
      phone: selectedMessage.phone || selectedMessage.phone_number,
    });

    if (res.success) {
      setModalAnswerText('');
      setSelectedMessage(null);
      await fetchMessages();
    }
    setModalSending(false);
  };

  const openCount = messages.filter((m) => m.status === 'open').length;
  const inProgressCount = messages.filter((m) => m.status === 'in_progress').length;
  const resolvedCount = messages.filter((m) => m.status === 'resolved' || m.status === 'replied').length;

  const getStatusBadge = (status: SupportMessage['status']) => {
    switch (status) {
      case 'resolved':
      case 'replied':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Answered & Resolved</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-950 border border-blue-300">
            <Clock className="w-3.5 h-3.5 text-blue-700" />
            <span>In Progress</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>Awaiting Answer</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-alata text-black">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-100/70 via-emerald-50/50 to-white border-2 border-emerald-200 rounded-3xl p-6 sm:p-7 shadow-card-subtle">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-500 flex items-center justify-center text-white shadow-emerald-sm flex-shrink-0 border-2 border-emerald-300">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
              Salon Support Messages & Response Center
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold shadow-2xs">
              Live Supabase
            </span>
          </div>
          <p className="text-xs text-black mt-1.5 leading-relaxed font-bold">
            Real-time messages sent by salon owners from the mobile app. Reply directly from the answer box to resolve their queries and dispatch live responses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchMessages()}
            className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 text-black border-2 border-emerald-200 transition-colors shadow-2xs"
            title="Refresh Messages"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
          <ExportDropdown
            data={messages.map((m) => ({
              Salon: m.salon_name,
              Owner: m.owner_name,
              Phone: m.phone || m.phone_number,
              Category: m.category,
              Message: m.message,
              Status: m.status,
              AnswersCount: (m.answers || []).length,
              LastAnswer: (m.answers || []).slice(-1)[0]?.answer || 'None',
              CreatedAt: m.created_at,
            }))}
            fileName="support_messages_and_answers_log"
          />
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Awaiting Answer"
          value={openCount}
          icon={<AlertCircle className="w-5 h-5" />}
          subtitle="Open salon messages"
          variant="amber"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          icon={<Clock className="w-5 h-5" />}
          subtitle="Under active review"
          variant="blue"
        />
        <StatCard
          title="Answered & Resolved"
          value={resolvedCount}
          icon={<CheckCircle2 className="w-5 h-5" />}
          subtitle="Responses delivered"
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
                {st === 'resolved' ? 'Answered / Resolved' : st === 'open' ? 'Awaiting Answer' : st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border-2 border-emerald-200 text-black font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="all">All Categories</option>
              <option value="Bug / Error">Bug / Error</option>
              <option value="Feature Request">Feature Request</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Billing / Payment">Billing / Payment</option>
            </select>
          </div>
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by salon name, owner, phone number, category, or message content..."
          className="text-black font-bold"
        />
      </div>

      {/* Support Messages List with Integrated Answer Box */}
      <div className="space-y-4">
        {loading ? (
          <LoadingSpinner message="Querying live support_messages from Supabase..." size="md" />
        ) : messages.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="w-6 h-6" />}
            title="No support messages recorded"
            description="When salon owners send support inquiries from their mobile app, they will automatically appear here."
          />
        ) : (
          messages.map((item) => {
            const hasAnswers = item.answers && item.answers.length > 0;
            const currentDraft = inlineAnswers[item.id] || '';

            return (
              <div
                key={item.id}
                className="bg-white border-2 border-emerald-100 rounded-3xl p-5 sm:p-6 hover:border-emerald-500 transition-all shadow-card-subtle space-y-4"
              >
                {/* Message Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b-2 border-emerald-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(item.status)}
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-950 border border-emerald-200 uppercase">
                        {item.category || 'General Inquiry'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-black font-bold pt-1">
                      <span>Salon: <strong className="text-black text-sm">{item.salon_name || 'Salon'}</strong></span>
                      <span>Owner: <strong className="text-black">{item.owner_name || 'Owner'}</strong></span>
                      {(item.phone || item.phone_number) && (
                        <span className="flex items-center gap-1 text-emerald-900 font-bold">
                          <Phone className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{formatPhoneNumber(item.phone || item.phone_number)}</span>
                        </span>
                      )}
                      <span className="text-emerald-900 font-semibold">{formatTimeAgo(item.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Quick WhatsApp Button */}
                    {(item.phone || item.phone_number) && (
                      <a
                        href={`https://wa.me/${(item.phone || item.phone_number || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hello ${item.owner_name || ''}, regarding your salon CRM support query: ` +
                            (hasAnswers ? item.answers![item.answers!.length - 1].answer : '')
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-emerald-sm flex items-center gap-1.5"
                        title="Send message on WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5 text-white" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setSelectedMessage(item);
                        setModalAnswerText('');
                      }}
                      className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-black border border-emerald-200 transition-colors"
                      title="Open full dialog"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Salon Owner's Stated Query / Message */}
                <div className="p-4 bg-[#f8fafc] border-2 border-emerald-100 rounded-2xl">
                  <div className="text-[11px] font-bold uppercase text-emerald-950 mb-1 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Salon Owner's Query:</span>
                  </div>
                  <p className="text-black font-bold text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    "{item.message}"
                  </p>
                </div>

                {/* Previous Answers Thread (if any) */}
                {hasAnswers && (
                  <div className="space-y-2 pl-2 sm:pl-4 border-l-4 border-emerald-500">
                    <div className="text-[11px] font-bold uppercase text-emerald-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Super Admin Answer & Reply History ({item.answers!.length}):</span>
                    </div>
                    {item.answers!.map((ans) => (
                      <div
                        key={ans.id}
                        className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-black font-bold space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] text-emerald-950 font-bold border-b border-emerald-200 pb-1">
                          <span>Answered by: {ans.answered_by}</span>
                          <span>{formatTimeAgo(ans.created_at)} ({formatDateTime(ans.created_at)})</span>
                        </div>
                        <p className="text-black font-bold leading-relaxed pt-1">
                          {ans.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dedicated Answer & Reply Box */}
                <div className="pt-2 border-t-2 border-emerald-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase text-black flex items-center gap-1.5">
                      <CornerDownRight className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{hasAnswers ? 'Add Another Reply / Update:' : 'Reply & Answer This Query:'}</span>
                    </label>
                  </div>

                  {/* Preset Quick Replies */}
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_ANSWERS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          setInlineAnswers((prev) => ({
                            ...prev,
                            [item.id]: preset,
                          }))
                        }
                        className="text-[10.5px] px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 font-bold transition-colors text-left"
                      >
                        ✨ {preset.slice(0, 42)}...
                      </button>
                    ))}
                  </div>

                  {/* Answer Input Textarea & Action Button */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <textarea
                      value={currentDraft}
                      onChange={(e) =>
                        setInlineAnswers((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                      placeholder="Type your official answer here to resolve this query and deliver to the salon..."
                      rows={2}
                      className="flex-1 bg-[#f8fafc] border-2 border-emerald-200 rounded-2xl p-3 text-xs text-black font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />

                    <button
                      onClick={() => handleSendInlineAnswer(item)}
                      disabled={!currentDraft.trim() || sendingId === item.id}
                      className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-emerald-sm transition-all flex items-center justify-center gap-2 flex-shrink-0"
                    >
                      {sendingId === item.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 text-white" />
                      )}
                      <span>Send Answer & Resolve</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detailed Modal */}
      {selectedMessage && (
        <Modal
          isOpen={!!selectedMessage}
          onClose={() => setSelectedMessage(null)}
          title="Support Message Inspection & Response"
          subtitle={`Message Reference ID: ${selectedMessage.id}`}
        >
          <div className="space-y-4 font-alata text-xs text-black">
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2 font-bold text-black">
              <div className="flex justify-between">
                <span>Salon:</span>
                <span className="text-black font-bold">{selectedMessage.salon_name || 'Salon Owner'}</span>
              </div>
              <div className="flex justify-between">
                <span>Owner Name:</span>
                <span className="text-black font-bold">{selectedMessage.owner_name || 'Owner'}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <span className="text-black font-bold">{formatPhoneNumber(selectedMessage.phone || selectedMessage.phone_number)}</span>
              </div>
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="text-black font-bold">{selectedMessage.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Received At:</span>
                <span className="text-black">{formatDateTime(selectedMessage.created_at)}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-black mb-1.5">Salon Owner Query:</h4>
              <div className="p-4 bg-white border-2 border-emerald-200 rounded-xl text-black font-bold text-xs leading-relaxed whitespace-pre-wrap">
                "{selectedMessage.message}"
              </div>
            </div>

            {/* Modal Previous Answers */}
            {selectedMessage.answers && selectedMessage.answers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-black">Previous Answers ({selectedMessage.answers.length}):</h4>
                {selectedMessage.answers.map((a) => (
                  <div key={a.id} className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl font-bold text-black">
                    <div className="text-[10.5px] text-emerald-900 border-b border-emerald-200 pb-1 flex justify-between">
                      <span>{a.answered_by}</span>
                      <span>{formatDateTime(a.created_at)}</span>
                    </div>
                    <p className="pt-1 text-black font-bold">{a.answer}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Modal Answer Box */}
            <div className="space-y-2 pt-2 border-t border-emerald-200">
              <label className="block text-xs font-bold uppercase text-black">
                Type Super Admin Answer:
              </label>
              <textarea
                value={modalAnswerText}
                onChange={(e) => setModalAnswerText(e.target.value)}
                placeholder="Enter official answer / solution..."
                rows={3}
                className="w-full bg-[#f8fafc] border-2 border-emerald-200 rounded-xl p-3 text-xs text-black font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={handleSendModalAnswer}
                disabled={!modalAnswerText.trim() || modalSending}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold shadow-emerald-sm transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Answer & Resolve</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
