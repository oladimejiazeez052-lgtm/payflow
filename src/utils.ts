import { SimulatedTransaction, AuditLog, Receipt, PaymentChannel, TransactionStatus } from './types';

// Helper to execute API requests safely with rich, supportive error diagnostics for HTML error pages
async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  let res: Response;
  // Append a dynamic cache buster to prevent browser/proxy-level caching
  const separator = url.includes('?') ? '&' : '?';
  const cleanUrl = `${url}${separator}_cb=${Date.now()}`;

  console.log(`[PayFlow Debug] Fetching: ${cleanUrl}`, options);

  try {
    res = await fetch(cleanUrl, options);
  } catch (err: any) {
    console.error(`[PayFlow Debug] Network failure on ${url}:`, err);
    throw new Error(`Network failure: Unable to communicate with the simulation engine. (${err.message})`);
  }

  const contentType = res.headers.get('content-type') || '';
  console.log(`[PayFlow Debug] Response status: ${res.status}, Type: ${contentType}`);
  
  if (!res.ok) {
    let errorMessage = `Server responded with status code ${res.status}`;
    if (contentType.includes('application/json')) {
      try {
        const errJson = await res.json();
        errorMessage = errJson.error || errorMessage;
      } catch (e) {
        // Fallback
      }
    } else {
      try {
        const text = await res.text();
        console.warn(`[PayFlow Debug] HTML Error Body:`, text.substring(0, 500));
        if (text.includes('<pre>')) {
          const match = text.match(/<pre>([\s\S]*?)<\/pre>/);
          if (match && match[1]) {
            errorMessage = `Backend Error: ${match[1].trim()}`;
          }
        } else if (text.includes('<title>')) {
          const match = text.match(/<title>([\s\S]*?)<\/title>/);
          if (match && match[1]) {
            errorMessage = `Backend Error: ${match[1].trim()}`;
          }
        } else {
          errorMessage = `Server Error (${res.status}): Server returned HTML instead of JSON. Ensure your API server is running on the correct port and endpoints are active.`;
        }
      } catch (e) {
        // Fallback
      }
    }
    throw new Error(errorMessage);
  }

  if (!contentType.includes('application/json')) {
    let textPreview = '';
    try {
      textPreview = (await res.text()).substring(0, 150);
    } catch {}
    console.warn(`[PayFlow Debug] Received non-JSON response style: ${contentType}`);
    throw new Error(`Expected JSON payload from server but received: ${contentType || 'blank content type'}. Preview: ${textPreview}`);
  }

  try {
    const data = await res.json();
    return data as T;
  } catch (err: any) {
    console.error(`[PayFlow Debug] Failed to parse JSON body:`, err);
    throw new Error(`Malformed JSON packet received from simulator: ${err.message}`);
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
