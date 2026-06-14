export type PaymentChannel = 'Zelle' | 'Venmo' | 'Cash App' | 'Bank Transfer' | 'Apple Pay';
export type TransactionStatus = 'Completed' | 'Pending' | 'Failed';

export interface SimulatedTransaction {
  id: string;
  amount: number;
  channel: PaymentChannel;
  sender: string;
  receiver: string;
  status: TransactionStatus;
  timestamp: string;
  note?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  actionType: string;
  details: string;
  ipHash: string;
}

export interface ReceiptLineItem {
  id: string;
  item: string;
  price: number;
}

export interface Receipt {
  id: string;
  transactionId: string | null;
  merchantName: string;
  lineItems: ReceiptLineItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  logoColor: string;
  logoInitials: string;
}

export interface DashboardMetrics {
  balances: {
    checking: number;
    zelle: number;
    cashApp: number;
    venmo: number;
  };
  totalVolume: number;
  successRate: number;
  simulationCount: number;
}
