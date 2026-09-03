import { supabase } from '@/lib/supabase';
import { AccountDeletion } from '@/types';

export const accountDeletionService = {
  /**
   * Fetch all salon account deletion logs and feedback reasons from Supabase
   */
  async getAccountDeletions(): Promise<{ data: AccountDeletion[]; error: string | null }> {
    try {
      const deletionsMap = new Map<string, AccountDeletion>();

      // 1. Query the dedicated 'account_deletions' table
      const { data: directDeletions, error: directErr } = await supabase
        .from('account_deletions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!directErr && directDeletions) {
        directDeletions.forEach((d: any) => {
          const item: AccountDeletion = {
            id: d.id,
            salon_id: d.salon_id,
            salon_name: d.salon_name || 'Deleted Salon',
            owner_name: d.owner_name || 'Salon Owner',
            phone_number: d.phone_number || '',
            reason: d.reason || 'No specific reason provided',
            deleted_at: d.deleted_at || d.created_at,
            created_at: d.created_at || d.deleted_at,
          };
          deletionsMap.set(item.id, item);
        });
      }

      // 2. Also query 'notifications' for 'ACCOUNT_DELETION' fallback entries
      try {
        const { data: notifDeletions } = await supabase
          .from('notifications')
          .select('*')
          .eq('type', 'ACCOUNT_DELETION')
          .order('created_at', { ascending: false });

        if (notifDeletions && notifDeletions.length > 0) {
          notifDeletions.forEach((n: any) => {
            try {
              let parsedMsg: any = {};
              if (n.message && n.message.startsWith('{')) {
                parsedMsg = JSON.parse(n.message);
              }
              const notifId = `notif-del-${n.id}`;
              if (!deletionsMap.has(notifId)) {
                deletionsMap.set(notifId, {
                  id: notifId,
                  salon_id: parsedMsg.salon_id || n.salon_id,
                  salon_name: parsedMsg.salon_name || n.title?.replace('Account Deleted:', '').trim() || 'Deleted Salon',
                  owner_name: parsedMsg.owner_name || 'Salon Owner',
                  phone_number: parsedMsg.phone_number || '',
                  reason: parsedMsg.reason || n.message || 'No specific reason provided',
                  deleted_at: parsedMsg.deleted_at || n.created_at,
                  created_at: n.created_at,
                });
              }
            } catch (e) {
              console.log('Error parsing deletion notification:', e);
            }
          });
        }
      } catch (e) {
        console.log('Notification deletion query note:', e);
      }

      const results = Array.from(deletionsMap.values()).sort(
        (a, b) => new Date(b.deleted_at || b.created_at || 0).getTime() - new Date(a.deleted_at || a.created_at || 0).getTime()
      );

      return { data: results, error: null };
    } catch (err: any) {
      console.error('accountDeletionService.getAccountDeletions error:', err);
      return { data: [], error: err.message || 'Failed to fetch account deletions' };
    }
  },
};
