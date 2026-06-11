import { SimulatedTransaction, AuditLog, Receipt, PaymentChannel, TransactionStatus } from './types';

// Fetch all simulated transactions from server
export async function fetchTransactions(): Promise<SimulatedTransaction[]> {
  const res = await fetch('/api/transactions');
  if (!res.ok) throw new Error('Failed to retrieve transactions store.');
  const data = await res.json();
  return data.transactions;
}

// Fetch read-only simulation audit trails
export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await fetch('/api/audit-logs');
  if (!res.ok) throw new Error('Failed to retrieve compliance audit logs.');
  const data = await res.json();
  return data.auditLogs;
}

// Fetch custom branded receipts
export async function fetchReceipts(): Promise<Receipt[]> {
  const res = await fetch('/api/receipts');
  if (!res.ok) throw new Error('Failed to retrieve invoice receipts store.');
  const data = await res.json();
  return data.receipts;
}

// Post a new transaction to the simulation engine
export async function createSimulatedTransaction(payload: {
  amount: number;
  channel: PaymentChannel;
  sender: string;
  receiver: string;
  status: TransactionStatus;
  note: string;
}): Promise<SimulatedTransaction> {
  const res = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to simulate transaction.');
  }
  return await res.json();
}

// Trigger standard preset reset
export async function resetTransactionsStore(): Promise<SimulatedTransaction[]> {
  const res = await fetch('/api/transactions/reset', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset ledger data.');
  const data = await res.json();
  return data.transactions;
}

// Post custom receipt spec
export async function createBrandedReceipt(payload: Omit<Receipt, 'id'>): Promise<Receipt> {
  const res = await fetch('/api/receipts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to compile branded receipt.');
  }
  return await res.json();
}

// Prompt Gemini AI to construct a transaction scenario history
export async function generateAIScenario(prompt: string): Promise<SimulatedTransaction[]> {
  const res = await fetch('/api/generate-scenario', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'AI Scenario engine failed.');
  }
  const data = await res.json();
  return data.transactions;
}

// Currency format utility
export function formatCurrency(value: number, currencyCode: string = 'USD'): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(abs);
  return value < 0 ? `-${formatted}` : formatted;
}

// Date format utility
export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' ' + d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return 'N/A';
  }
}
