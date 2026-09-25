export interface StatusStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
}

export function getAppointmentStatusStyle(status: string | undefined): StatusStyle {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'done':
      return {
        label: 'Completed',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-400',
      };
    case 'in_progress':
      return {
        label: 'In Progress',
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-400',
        border: 'border-indigo-500/20',
        dot: 'bg-indigo-400 animate-pulse',
      };
    case 'confirmed':
      return {
        label: 'Confirmed',
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/20',
        dot: 'bg-blue-400',
      };
    case 'scheduled':
      return {
        label: 'Scheduled',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/20',
        dot: 'bg-amber-400',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/20',
        dot: 'bg-rose-400',
      };
    case 'noshow':
      return {
        label: 'No Show',
        bg: 'bg-slate-500/10',
        text: 'text-slate-400',
        border: 'border-slate-500/20',
        dot: 'bg-slate-400',
      };
    default:
      return {
        label: status || 'Unknown',
        bg: 'bg-slate-700/30',
        text: 'text-slate-300',
        border: 'border-slate-700',
        dot: 'bg-slate-400',
      };
  }
}

export function getPaymentStatusStyle(status: string | undefined): StatusStyle {
  switch (status?.toLowerCase()) {
    case 'paid':
    case 'billed':
      return {
        label: 'Paid',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-400',
      };
    case 'pending':
      return {
        label: 'Payment Pending',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/20',
        dot: 'bg-amber-400',
      };
    case 'failed':
      return {
        label: 'Failed',
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/20',
        dot: 'bg-rose-400',
      };
    default:
      return {
        label: status || 'Pending',
        bg: 'bg-slate-700/30',
        text: 'text-slate-300',
        border: 'border-slate-700',
        dot: 'bg-slate-400',
      };
  }
}

export function getSalonStatusStyle(status: string | undefined): StatusStyle {
  switch (status?.toLowerCase()) {
    case 'active':
      return {
        label: 'Active',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-400',
      };
    case 'trial':
      return {
        label: 'Trial',
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/20',
        dot: 'bg-purple-400',
      };
    case 'inactive':
      return {
        label: 'Inactive',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/20',
        dot: 'bg-amber-400',
      };
    case 'suspended':
      return {
        label: 'Suspended',
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/20',
        dot: 'bg-rose-400',
      };
    default:
      return {
        label: 'Active',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-400',
      };
  }
}
