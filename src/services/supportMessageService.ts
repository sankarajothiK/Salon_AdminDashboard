import { supabase } from '@/lib/supabase';
import { SupportMessage } from '@/types';

// Default initial support queries seed from customer care & salon onboardings
const DEFAULT_SUPPORT_SEED: SupportMessage[] = [
  {
    id: 'supp-001',
    salon_id: '74a2ab88-5257-4a79-9912-16c9c48115c7',
    salon_name: 'Bro Salon',
    customer_name: 'Nagaraj (Owner)',
    phone_number: '+910000000001',
    email: 'nagaraj@brosalon.com',
    subject: 'WhatsApp invoice delivery template customization',
    message: 'Can you assist us with configuring our custom header logo in the automated WhatsApp receipt dispatched to walk-in customers?',
    category: 'technical',
    priority: 'medium',
    status: 'open',
    app_version: '1.0.0',
    platform: 'android',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    notes: 'Awaiting template media URL configuration',
  },
  {
    id: 'supp-002',
    salon_id: '74a2ab88-5257-4a79-9912-16c9c48115c7',
    salon_name: 'Bro Salon',
    customer_name: 'Teju (Customer)',
    phone_number: '+919876543210',
    email: 'teju@gmail.com',
    subject: 'Appointment reschedule request for hair spa',
    message: 'I booked an appointment for tomorrow at 11:44 AM, but I would like to shift it to Saturday afternoon 3:00 PM if slot is available.',
    category: 'inquiry',
    priority: 'low',
    status: 'resolved',
    app_version: '1.0.0',
    platform: 'android',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    notes: 'Slot confirmed with stylist Rajuu on phone',
  },
  {
    id: 'supp-003',
    salon_id: null,
    salon_name: 'Potential Partner Salon',
    customer_name: 'Kavitha S.',
    phone_number: '+919444455555',
    email: 'kavitha@glamourspa.in',
    subject: 'Multi-branch staff commission reporting inquiry',
    message: 'We are expanding to a second branch in Madurai. Does the CRM support automated commission calculation per stylist across two branches?',
    category: 'feature',
    priority: 'high',
    status: 'in_progress',
    app_version: '1.0.0',
    platform: 'web',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    notes: 'Demo scheduled with product consultant',
  },
];

const LOCAL_STORAGE_KEY = 'salon_crm_support_messages_store';

function getLocalMessages(): SupportMessage[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_SUPPORT_SEED;
}

function saveLocalMessages(msgs: SupportMessage[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(msgs));
  } catch (e) {}
}

export const supportMessageService = {
  /**
   * Fetch support messages from Supabase or structured fallback
   */
  async getSupportMessages(filter?: {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
  }): Promise<{ data: SupportMessage[]; error: string | null }> {
    try {
      let combinedMessages: SupportMessage[] = [...getLocalMessages()];

      // 1. Attempt to query Supabase 'support_messages' table if exists
      try {
        const { data: dbData, error: dbErr } = await supabase
          .from('support_messages')
          .select('*')
          .order('created_at', { ascending: false });

        if (!dbErr && dbData && dbData.length > 0) {
          dbData.forEach((row: any) => {
            const mapped: SupportMessage = {
              id: String(row.id),
              salon_id: row.salon_id || null,
              salon_name: row.salon_name || 'Salon Client',
              customer_name: row.customer_name || row.name || 'User',
              phone_number: row.phone_number || row.phone || '',
              email: row.email || '',
              subject: row.subject || row.title || 'Support Request',
              message: row.message || row.description || '',
              category: row.category || 'general',
              priority: row.priority || 'medium',
              status: row.status || 'open',
              app_version: row.app_version || '1.0.0',
              platform: row.platform || 'android',
              created_at: row.created_at || new Date().toISOString(),
              resolved_at: row.resolved_at,
              notes: row.notes,
            };
            if (!combinedMessages.some((m) => m.id === mapped.id)) {
              combinedMessages.unshift(mapped);
            }
          });
        }
      } catch (e) {
        // Table not present yet, gracefully use store
      }

      // 2. Also check 'notifications' table for support items
      try {
        const { data: notifData } = await supabase
          .from('notifications')
          .select('*')
          .in('type', ['support', 'SUPPORT', 'feedback', 'FEEDBACK', 'help', 'HELP']);

        if (notifData && notifData.length > 0) {
          notifData.forEach((n: any) => {
            const notifId = `supp-notif-${n.id}`;
            if (!combinedMessages.some((m) => m.id === notifId)) {
              combinedMessages.unshift({
                id: notifId,
                salon_id: n.salon_id,
                salon_name: 'Salon Partner',
                customer_name: 'Customer Support Request',
                phone_number: '',
                email: '',
                subject: n.title || 'Support Query',
                message: n.message || '',
                category: 'general',
                priority: 'medium',
                status: n.status === 'resolved' ? 'resolved' : 'open',
                app_version: '1.0.0',
                platform: 'android',
                created_at: n.created_at,
              });
            }
          });
        }
      } catch (e) {}

      // Apply in-memory filtering
      let result = combinedMessages;

      if (filter?.status && filter.status !== 'all') {
        result = result.filter((m) => m.status === filter.status);
      }
      if (filter?.priority && filter.priority !== 'all') {
        result = result.filter((m) => m.priority === filter.priority);
      }
      if (filter?.category && filter.category !== 'all') {
        result = result.filter((m) => m.category === filter.category);
      }
      if (filter?.search) {
        const term = filter.search.toLowerCase();
        result = result.filter(
          (m) =>
            m.subject.toLowerCase().includes(term) ||
            m.message.toLowerCase().includes(term) ||
            (m.customer_name || '').toLowerCase().includes(term) ||
            (m.salon_name || '').toLowerCase().includes(term) ||
            (m.phone_number || '').includes(term)
        );
      }

      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return { data: result, error: null };
    } catch (err: any) {
      console.error('supportMessageService error:', err);
      return { data: getLocalMessages(), error: err.message };
    }
  },

  /**
   * Update message status or resolution notes
   */
  async updateMessageStatus(
    id: string,
    status: SupportMessage['status'],
    notes?: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // 1. Update in local store
      const current = getLocalMessages();
      const idx = current.findIndex((m) => m.id === id);
      if (idx !== -1) {
        current[idx].status = status;
        if (notes !== undefined) current[idx].notes = notes;
        if (status === 'resolved' || status === 'closed') {
          current[idx].resolved_at = new Date().toISOString();
        }
        saveLocalMessages(current);
      }

      // 2. Also try Supabase update
      try {
        await supabase
          .from('support_messages')
          .update({
            status,
            notes,
            resolved_at: status === 'resolved' ? new Date().toISOString() : null,
          })
          .eq('id', id);
      } catch (e) {}

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Create a new support ticket / inquiry
   */
  async createSupportMessage(msg: Partial<SupportMessage>): Promise<{ success: boolean; error: string | null }> {
    try {
      const newRecord: SupportMessage = {
        id: `supp-${Date.now()}`,
        salon_id: msg.salon_id || null,
        salon_name: msg.salon_name || 'Client',
        customer_name: msg.customer_name || 'User',
        phone_number: msg.phone_number || '',
        email: msg.email || '',
        subject: msg.subject || 'Support Request',
        message: msg.message || '',
        category: msg.category || 'general',
        priority: msg.priority || 'medium',
        status: 'open',
        app_version: msg.app_version || '1.0.0',
        platform: msg.platform || 'android',
        created_at: new Date().toISOString(),
        notes: msg.notes,
      };

      const current = getLocalMessages();
      current.unshift(newRecord);
      saveLocalMessages(current);

      // Try inserting into Supabase
      try {
        await supabase.from('support_messages').insert([newRecord]);
      } catch (e) {}

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
