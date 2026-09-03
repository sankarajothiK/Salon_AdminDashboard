import { format, parseISO, isValid } from 'date-fns';

/**
 * Format number as Indian Rupee currency (e.g. ₹1,25,000)
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date string (e.g., '01 Sep 2026')
 */
export function formatDate(dateString: string | null | undefined, formatPattern = 'dd MMM yyyy'): string {
  if (!dateString) return '—';
  try {
    const d = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(d)) return '—';
    return format(d, formatPattern);
  } catch {
    return '—';
  }
}

/**
 * Format time string (e.g., '10:30 AM')
 */
export function formatTime(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const d = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(d)) return '—';
    return format(d, 'hh:mm a');
  } catch {
    return '—';
  }
}

/**
 * Format full date and time (e.g., '01 Sep 2026, 10:30 AM')
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const d = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(d)) return '—';
    return format(d, 'dd MMM yyyy, hh:mm a');
  } catch {
    return '—';
  }
}

/**
 * Mask phone number for security or clean presentation (e.g. +91 98450 62110)
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '—';
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+91') && cleaned.length === 13) {
    return `+91 ${cleaned.slice(3, 8)} ${cleaned.slice(8)}`;
  }
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

/**
 * Time ago human string (e.g., '2 mins ago', '1 hour ago', 'Yesterday')
 */
export function formatTimeAgo(dateString: string | null | undefined): string {
  if (!dateString) return 'Never';
  try {
    const d = new Date(dateString).getTime();
    const now = Date.now();
    const diffSec = Math.floor((now - d) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 172800) return 'Yesterday';
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return '—';
  }
}
