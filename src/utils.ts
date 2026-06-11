import { SimulatedTransaction, AuditLog, Receipt, PaymentChannel, TransactionStatus } from './types';

// ==========================================
// Client-Side In-Memory / Local Storage DB
// Used as a transparent fallback if the API server returns 404 or fails
// ==========================================

const defaultTransactions: SimulatedTransaction[] = [
  {
    id: "ZEL-9283ADFF",
    timestamp: "2026-06-05T09:54:00Z",
    sender: "Jessica Miller",
    receiver: "Adewale Cole",
    channel: "Zelle",
    amount: 450.00,
    status: "Completed",
    note: "Consulting fees payment"
  },
  {
    id: "VEN-4B2C8A9F",
    timestamp: "2026-06-05T09:20:00Z",
    sender: "Adewale Cole",
    receiver: "Marcus Vance",
    channel: "Venmo",
    amount: -45.00,
    status: "Completed",
    note: "Pizza night split"
  },
  {
    id: "CAS-1D9E3C5B",
    timestamp: "2026-06-04T18:12:00Z",
    sender: "Sarah Jenkins",
    receiver: "Adewale Cole",
    channel: "Cash App",
    amount: 120.00,
    status: "Completed",
    note: "Weekly dues reload"
  },
  {
    id: "BNK-009283748291",
    timestamp: "2026-06-04T14:05:00Z",
    sender: "Adewale Cole",
    receiver: "Apex Tech Retailer",
    channel: "Bank Transfer",
    amount: -1249.99,
    status: "Pending",
    note: "Developer workstation upgrade"
  },
  {
    id: "ZEL-8F9D2E1A",
    timestamp: "2026-06-03T11:30:00Z",
    sender: "Adewale Cole",
    receiver: "Coffee & Bytes Café",
    channel: "Zelle",
    amount: -8.72,
    status: "Completed",
    note: "Morning Latte & Bagel"
  },
  {
    id: "VEN-3A8F2B1D",
    timestamp: "2026-06-03T08:45:00Z",
    sender: "David Miller",
    receiver: "Adewale Cole",
    channel: "Venmo",
    amount: 15.00,
    status: "Failed",
    note: "Lunch payout retry"
  }
];

const defaultAuditLogs: AuditLog[] = [
  {
    id: "AUD-INIT",
    timestamp: "2026-06-05T15:25:52Z",
    userEmail: "oladimejiazeez052@gmail.com",
    actionType: "Workspace Created",
    details: "Initialized PayFlow Demo environment simulation engines.",
    ipHash: "127.0.0.1"
  },
  {
    id: "AUD-SEED",
    timestamp: "2026-06-05T15:26:00Z",
    userEmail: "oladimejiazeez052@gmail.com",
    actionType: "Primary Seed Ledger",
    details: "Pre-seeded transaction history for simulation testing.",
    ipHash: "127.0.0.1"
  }
];

const defaultReceipts: Receipt[] = [
  {
    id: "REC-9283ADFF",
    transactionId: "ZEL-9283ADFF",
    merchantName: "Jessica Miller Designs",
    lineItems: [
      { id: "li-1", item: "UI Design Mockup Sprint", price: 350.00 },
      { id: "li-2", item: "Color Consultation", price: 100.00 }
    ],
    subtotal: 450.00,
    taxAmount: 0.00,
    total: 450.00,
    logoColor: "indigo",
    logoInitials: "JM"
  },
  {
    id: "REC-8F9D2E1A",
    transactionId: "ZEL-8F9D2E1A",
    merchantName: "Coffee & Bytes Café",
    lineItems: [
      { id: "li-3", item: "Double Shot Latte", price: 4.50 },
      { id: "li-4", item: "Avocado Sourdough Bagel", price: 4.22 }
    ],
    subtotal: 8.72,
    taxAmount: 0.00,
    total: 8.72,
    logoColor: "amber",
    logoInitials: "CB"
  }
];

function getLocalData<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved) as T;
  } catch (err) {
    console.error(`Failed to load ${key} from local storage:`, err);
  }
  return defaultValue;
}

function saveLocalData<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save ${key} to local storage:`, err);
  }
}

function generateLocalTxId(channel: PaymentChannel): string {
  const chars = "0123456789ABCDEF";
  let randomPart = "";
  const len = channel === 'Bank Transfer' ? 12 : 8;
  for (let i = 0; i < len; i++) {
    randomPart += chars[Math.floor(Math.random() * chars.length)];
  }
  switch (channel) {
    case 'Zelle': return `ZEL-${randomPart}`;
    case 'Venmo': return `VEN-${randomPart}`;
    case 'Cash App': return `CAS-${randomPart}`;
    case 'Bank Transfer': return `BNK-${randomPart}`;
  }
}

function appendLocalAudit(actionType: string, details: string) {
  const logs = getLocalData<AuditLog[]>('payflow_audit_logs', defaultAuditLogs);
  const newLog: AuditLog = {
    id: `AUD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    userEmail: "oladimejiazeez052@gmail.com",
    actionType,
    details,
    ipHash: "127.0.0.1"
  };
  logs.unshift(newLog);
  saveLocalData('payflow_audit_logs', logs);
}

// Client Mock Generator Fallback
function generateClientScenarioTx(prompt: string): SimulatedTransaction[] {
  const isFraud = prompt.toLowerCase().includes('fraud') || prompt.toLowerCase().includes('marker') || prompt.toLowerCase().includes('anomal');
  const size = 6;
  const result: SimulatedTransaction[] = [];
  
  const senders = ["Jessica Sterling", "Michael Vance", "E-Commerce Refund Agent", "Caleb Smith", "Tanya Jenkins", "Vance Logistics Inc."];
  const receivers = ["Adewale Cole", "Marcus Vance", "Cash Terminals", "Jane Peterson", "Starbucks Store #493", "Apex Services"];

  for (let i = 0; i < size; i++) {
    const channel: PaymentChannel = i % 4 === 0 ? 'Venmo' : i % 4 === 1 ? 'Zelle' : i % 4 === 2 ? 'Cash App' : 'Bank Transfer';
    const amount = isFraud 
      ? (i % 2 === 0 ? 10000.00 : -9500.00) // Huge suspicious sums
      : (i % 2 === 0 ? 25.50 * (i + 1) : -18.90 * (i + 1));
      
    const status: TransactionStatus = isFraud && i % 3 === 0 ? 'Failed' : 'Completed';
    const note = isFraud 
      ? "URGENT Wire Claim Release Attempt" 
      : `Mock transaction sequence #${i + 1}`;

    const mockTx: SimulatedTransaction = {
      id: generateLocalTxId(channel),
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      amount,
      channel,
      sender: senders[i % senders.length],
      receiver: receivers[i % receivers.length],
      status,
      note
    };
    result.push(mockTx);
  }
  return result;
}

// Transparently handle request in Client Storage Fallback
function handleClientFallbackRequest(url: string, options?: RequestInit): any {
  console.log(`[PayFlow Fallback DB] Intercepting: ${url}`);
  
  if (url.includes('/api/transactions/reset')) {
    saveLocalData('payflow_transactions', defaultTransactions);
    saveLocalData('payflow_audit_logs', defaultAuditLogs);
    appendLocalAudit("Reset Simulator (Local)", "Reseeded the initial financial simulation table history.");
    return { success: true, transactions: defaultTransactions };
  }

  if (url.includes('/api/transactions')) {
    const txs = getLocalData<SimulatedTransaction[]>('payflow_transactions', defaultTransactions);
    
    if (options?.method === 'POST') {
      const payload = JSON.parse(options.body as string);
      const newTx: SimulatedTransaction = {
        id: generateLocalTxId(payload.channel || 'Zelle'),
        timestamp: new Date().toISOString(),
        amount: Number(payload.amount) || 0,
        channel: payload.channel || 'Zelle',
        sender: payload.sender || 'Anonymous',
        receiver: payload.receiver || 'Anonymous',
        status: payload.status || 'Completed',
        note: payload.note || ''
      };
      txs.unshift(newTx);
      saveLocalData('payflow_transactions', txs);
      appendLocalAudit(
        "Insert Simulation (Local)", 
        `Simulated new ${newTx.channel} transfer of $${Math.abs(newTx.amount).toFixed(2)} [ID: ${newTx.id}] from ${newTx.sender} to ${newTx.receiver} in Completed state.`
      );
      return newTx;
    }
    
    return { transactions: txs };
  }

  if (url.includes('/api/audit-logs')) {
    const logs = getLocalData<AuditLog[]>('payflow_audit_logs', defaultAuditLogs);
    return { auditLogs: logs };
  }

  if (url.includes('/api/receipts')) {
    const receipts = getLocalData<Receipt[]>('payflow_receipts', defaultReceipts);
    
    if (options?.method === 'POST') {
      const payload = JSON.parse(options.body as string);
      const newReceipt: Receipt = {
        id: `REC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        transactionId: payload.transactionId || null,
        merchantName: payload.merchantName || 'Unnamed Merchant',
        lineItems: payload.lineItems || [],
        subtotal: Number(payload.subtotal) || Number(payload.total) || 0,
        taxAmount: Number(payload.taxAmount) || 0,
        total: Number(payload.total) || 0,
        logoColor: payload.logoColor || 'blue',
        logoInitials: payload.logoInitials || (payload.merchantName || 'U').substring(0, 2).toUpperCase()
      };
      receipts.unshift(newReceipt);
      saveLocalData('payflow_receipts', receipts);
      appendLocalAudit(
        "Compile Receipt Layout (Local)",
        `Saved branded receipt mockup for ${newReceipt.merchantName} [Total: $${newReceipt.total.toFixed(2)}].`
      );
      return newReceipt;
    }
    
    return { receipts };
  }

  if (url.includes('/api/generate-scenario')) {
    const prompt = JSON.parse(options?.body as string || '{}').prompt || '';
    const mockResult = generateClientScenarioTx(prompt);
    
    const txs = getLocalData<SimulatedTransaction[]>('payflow_transactions', defaultTransactions);
    txs.unshift(...mockResult);
    saveLocalData('payflow_transactions', txs);
    
    appendLocalAudit(
      "AI Scenario Engine Injection (Local Fallback)", 
      `Prompt: "${prompt}" - Generated ${mockResult.length} transactions locally inside cache.`
    );
    
    return { transactions: mockResult };
  }

  if (url.includes('/api/chat')) {
    const replies = [
      "I am currently running in our secure local sandbox fallback database. Ask me anything about testing your payment rails!",
      "Zelle, Venmo, Cash App, and Bank Transfer flows are fully supported under the local engine. Feel free to insert more test items!",
      "To inspect the ledger, switch to the 'Audit Ledger' tab. To generate PDFs, click 'Compile Branded Receipt' on any ledger item!"
    ];
    return { reply: replies[Math.floor(Math.random() * replies.length)] };
  }

  return {};
}

// Helper to execute API requests safely with rich, supportive error diagnostics for HTML error pages
async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const separator = url.includes('?') ? '&' : '?';
  const cleanUrl = `${url}${separator}_cb=${Date.now()}`;

  console.log(`[PayFlow Debug] Fetching: ${cleanUrl}`, options);

  try {
    const res = await fetch(cleanUrl, options);
    
    // Check if the response was ok and contains JSON content type
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return data as T;
    }
    
    // If not ok or not JSON, transparently intercept and fallback to LocalStorage
    console.warn(`[PayFlow Debug] Non-JSON or error status ${res.status} returned from server. Triggering local storage fallback.`);
    return handleClientFallbackRequest(url, options) as T;
  } catch (err: any) {
    console.error(`[PayFlow Debug] Network failure on ${url}, falling back to local database. Error:`, err);
    return handleClientFallbackRequest(url, options) as T;
  }
}

// Fetch all simulated transactions from server
export async function fetchTransactions(): Promise<SimulatedTransaction[]> {
  const data = await safeFetchJson<{ transactions: SimulatedTransaction[] }>('/api/transactions');
  return data.transactions;
}

// Fetch read-only simulation audit trails
export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const data = await safeFetchJson<{ auditLogs: AuditLog[] }>('/api/audit-logs');
  return data.auditLogs;
}

// Fetch custom branded receipts
export async function fetchReceipts(): Promise<Receipt[]> {
  const data = await safeFetchJson<{ receipts: Receipt[] }>('/api/receipts');
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
  return await safeFetchJson<SimulatedTransaction>('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

// Trigger standard preset reset
export async function resetTransactionsStore(): Promise<SimulatedTransaction[]> {
  const data = await safeFetchJson<{ transactions: SimulatedTransaction[] }>('/api/transactions/reset', { 
    method: 'POST' 
  });
  return data.transactions;
}

// Post custom receipt spec
export async function createBrandedReceipt(payload: Omit<Receipt, 'id'>): Promise<Receipt> {
  return await safeFetchJson<Receipt>('/api/receipts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

// Prompt Gemini AI to construct a transaction scenario history
export async function generateAIScenario(prompt: string): Promise<SimulatedTransaction[]> {
  const data = await safeFetchJson<{ transactions: SimulatedTransaction[] }>('/api/generate-scenario', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
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
