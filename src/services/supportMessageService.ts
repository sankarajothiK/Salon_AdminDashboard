import { supabase } from '@/lib/supabase';
import { SupportMessage, SupportMessageAnswer } from '@/types';

const LOCAL_STORAGE_ANSWERS_KEY = 'salon_crm_support_answers_store';

function getLocalAnswers(): SupportMessageAnswer[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ANSWERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function saveLocalAnswers(answers: SupportMessageAnswer[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_ANSWERS_KEY, JSON.stringify(answers));
  } catch (e) {}
}

export const supportMessageService = {
  /**
   * Fetch all support messages directly from Supabase with joined answers
   */
  async getSupportMessages(filter?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<{ data: SupportMessage[]; error: string | null }> {
    try {
      // 1. Query live Supabase 'support_messages' table
      const { data: dbMessages, error: msgErr } = await supabase
        .from('support_messages')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Fetch answers from Supabase 'support_message_answers' (if table exists) + local store
      let dbAnswers: SupportMessageAnswer[] = [...getLocalAnswers()];
      try {
        const { data: ansData, error: ansErr } = await supabase
          .from('support_message_answers')
          .select('*')
          .order('created_at', { ascending: true });

        if (!ansErr && ansData && ansData.length > 0) {
          ansData.forEach((a: any) => {
            if (!dbAnswers.some((x) => x.id === a.id)) {
              dbAnswers.push({
                id: a.id,
                support_message_id: a.support_message_id,
                salon_id: a.salon_id,
                salon_name: a.salon_name,
                phone: a.phone,
                answer: a.answer,
                answered_by: a.answered_by || 'Super Admin',
                created_at: a.created_at,
              });
            }
          });
        }
      } catch (e) {
        console.log('support_message_answers query notice:', e);
      }

      let messages: SupportMessage[] = [];

      if (!msgErr && dbMessages) {
        messages = dbMessages.map((row: any) => {
          const msgAnswers = dbAnswers.filter((a) => a.support_message_id === row.id);
          return {
            id: String(row.id),
            salon_id: row.salon_id || null,
            salon_name: row.salon_name || 'Salon Owner',
            owner_name: row.owner_name || 'Owner',
            customer_name: row.owner_name || row.salon_name || 'Salon User',
            phone: row.phone || row.phone_number || '',
            phone_number: row.phone || row.phone_number || '',
            category: row.category || 'General Inquiry',
            message: row.message || '',
            status: row.status || (msgAnswers.length > 0 ? 'resolved' : 'open'),
            app_version: '1.0.0',
            platform: 'android',
            created_at: row.created_at || new Date().toISOString(),
            answers: msgAnswers,
          };
        });
      }

      // Apply in-memory filtering
      let result = messages;

      if (filter?.status && filter.status !== 'all') {
        result = result.filter((m) => m.status === filter.status);
      }
      if (filter?.category && filter.category !== 'all') {
        result = result.filter((m) => m.category === filter.category);
      }
      if (filter?.search) {
        const term = filter.search.toLowerCase();
        result = result.filter(
          (m) =>
            m.message.toLowerCase().includes(term) ||
            (m.salon_name || '').toLowerCase().includes(term) ||
            (m.owner_name || '').toLowerCase().includes(term) ||
            (m.phone || '').includes(term) ||
            (m.category || '').toLowerCase().includes(term)
        );
      }

      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return { data: result, error: null };
    } catch (err: any) {
      console.error('supportMessageService.getSupportMessages error:', err);
      return { data: [], error: err.message };
    }
  },

  /**
   * Submit an answer/reply to a support message and mark it as resolved in Supabase
   */
  async sendAnswer(
    supportMessageId: string,
    answerText: string,
    messageContext?: {
      salonId?: string | null;
      salonName?: string | null;
      phone?: string | null;
    }
  ): Promise<{ success: boolean; answer?: SupportMessageAnswer; error: string | null }> {
    try {
      const newAnswer: SupportMessageAnswer = {
        id: `ans-${Date.now()}`,
        support_message_id: supportMessageId,
        salon_id: messageContext?.salonId || null,
        salon_name: messageContext?.salonName || null,
        phone: messageContext?.phone || null,
        answer: answerText.trim(),
        answered_by: 'Super Admin',
        created_at: new Date().toISOString(),
      };

      // 1. Save in local cache for immediate UI feedback
      const localAnswers = getLocalAnswers();
      localAnswers.push(newAnswer);
      saveLocalAnswers(localAnswers);

      // 2. Insert into Supabase 'support_message_answers' table
      try {
        await supabase.from('support_message_answers').insert([
          {
            support_message_id: supportMessageId,
            salon_id: messageContext?.salonId || null,
            salon_name: messageContext?.salonName || null,
            phone: messageContext?.phone || null,
            answer: answerText.trim(),
            answered_by: 'Super Admin',
          },
        ]);
      } catch (e) {
        console.log('support_message_answers insert notice:', e);
      }

      // 3. Update 'support_messages' row status to 'resolved' in Supabase
      try {
        await supabase
          .from('support_messages')
          .update({
            status: 'resolved',
          })
          .eq('id', supportMessageId);
      } catch (e) {
        console.log('support_messages status update error:', e);
      }

      // 4. Send a notification to the salon in Supabase 'notifications' table so the mobile app receives the answer
      try {
        if (messageContext?.salonId) {
          await supabase.from('notifications').insert([
            {
              salon_id: messageContext.salonId,
              type: 'SUPPORT_ANSWER',
              title: 'Support Query Answered',
              message: `Super Admin replied: "${answerText.trim()}"`,
              status: 'sent',
            },
          ]);
        }
      } catch (e) {
        console.log('Answer notification dispatch note:', e);
      }

      return { success: true, answer: newAnswer, error: null };
    } catch (err: any) {
      console.error('supportMessageService.sendAnswer error:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Update message status directly (e.g. 'in_progress', 'open', 'resolved')
   */
  async updateMessageStatus(
    id: string,
    status: SupportMessage['status']
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      await supabase
        .from('support_messages')
        .update({ status })
        .eq('id', id);

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
