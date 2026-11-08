import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCoins(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '0 LC';
  return `${new Intl.NumberFormat('en-IN').format(amount)} LC`;
}

export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '₹0';
  return `₹${new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount)}`;
}

export function maskBankAccount(accountNumber: string | null | undefined): string {
  if (!accountNumber) return '•••• •••• ••••';
  const clean = accountNumber.replace(/\s+/g, '');
  if (clean.length <= 4) return clean;
  const lastFour = clean.slice(-4);
  const maskedLength = clean.length - 4;
  return `${'•'.repeat(Math.min(maskedLength, 8))} ${lastFour}`;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}
