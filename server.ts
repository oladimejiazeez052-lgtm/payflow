import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { SimulatedTransaction, AuditLog, Receipt, PaymentChannel, TransactionStatus } from './src/types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Request logging middleware to diagnose 404s and errors
app.use((req, res, next) => {
  const logMsg = `[${new Date().toISOString()}] ${req.method} ${req.url} - Headers: ${JSON.stringify(req.headers)}\n`;
  console.log(logMsg.trim());
  try {
    fs.appendFileSync(path.join(DATA_DIR, 'server_logs.txt'), logMsg, 'utf8');
  } catch (err) {}
  next();
});

// Local File Database Store for persistent simulations
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
const AUDIT_LOGS_FILE = path.join(DATA_DIR, 'audit_logs.json');
const RECEIPTS_FILE = path.join(DATA_DIR, 'receipts.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadData<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content) as T;
    } else {
      // Persist the default values immediately on startup so files exist on disk to be inspected/edited
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
    }
  } catch (err) {
    console.error(`Failed to load persistent data from ${filePath}:`, err);
  }
  return defaultValue;
}

function saveData<T>(filePath: string, data: T) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Failed to persist data to ${filePath}:`, err);
  }
}

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

let transactions: SimulatedTransaction[] = loadData(TRANSACTIONS_FILE, defaultTransactions);
let auditLogs: AuditLog[] = loadData(AUDIT_LOGS_FILE, defaultAuditLogs);
let receipts: Receipt[] = loadData(RECEIPTS_FILE, defaultReceipts);

// Helper to write to audit log
function writeAuditLog(actionType: string, details: string, email = "oladimejiazeez052@gmail.com", ip = "127.0.0.1") {
  const log: AuditLog = {
    id: `AUD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    userEmail: email,
    actionType,
    details,
    ipHash: ip
  };
  auditLogs.unshift(log);
  saveData(AUDIT_LOGS_FILE, auditLogs);
}

// Helper to generate transaction ID matching blueprint conventions
function generateTransactionId(channel: PaymentChannel): string {
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

// REST APIs
app.get('/api/transactions', (req, res) => {
  res.json({ transactions });
});

app.post('/api/transactions', (req, res) => {
  const { amount, channel, sender, receiver, status, note } = req.body;
  
  if (!amount || !channel || !sender || !receiver || !status) {
    return res.status(400).json({ error: 'Missing required transaction properties.' });
  }

  const newTx: SimulatedTransaction = {
    id: generateTransactionId(channel),
    timestamp: new Date().toISOString(),
    amount: Number(amount),
    channel,
    sender,
    receiver,
    status,
    note: note || ''
  };

  transactions.unshift(newTx);
  saveData(TRANSACTIONS_FILE, transactions);
  
  writeAuditLog(
    "Insert Simulation", 
    `Simulated new ${channel} transfer of $${Math.abs(amount).toFixed(2)} [ID: ${newTx.id}] from ${sender} to ${receiver} in Completed state.`
  );

  res.status(201).json(newTx);
});

app.delete('/api/transactions', (req, res) => {
  transactions = [];
  saveData(TRANSACTIONS_FILE, transactions);
  writeAuditLog("Clear Simulator Local State", "Cleared all simulated payments array storage.");
  res.json({ success: true, transactions });
});

app.post('/api/transactions/reset', (req, res) => {
  transactions = [
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
    }
  ];
  saveData(TRANSACTIONS_FILE, transactions);
  writeAuditLog("Reset Simulator", "Reseeded the initial financial simulation table history.");
  res.json({ success: true, transactions });
});

app.get('/api/audit-logs', (req, res) => {
  res.json({ auditLogs });
});

app.get('/api/receipts', (req, res) => {
  res.json({ receipts });
});

app.post('/api/receipts', (req, res) => {
  const { transactionId, merchantName, lineItems, subtotal, taxAmount, total, logoColor, logoInitials } = req.body;
  
  if (!merchantName || !lineItems || total === undefined) {
    return res.status(400).json({ error: 'Missing required receipt specifications.' });
  }

  const newReceipt: Receipt = {
    id: `REC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    transactionId: transactionId || null,
    merchantName,
    lineItems,
    subtotal: Number(subtotal) || Number(total),
    taxAmount: Number(taxAmount) || 0,
    total: Number(total),
    logoColor: logoColor || 'blue',
    logoInitials: logoInitials || merchantName.substring(0, 2).toUpperCase()
  };

  receipts.unshift(newReceipt);
  saveData(RECEIPTS_FILE, receipts);
  
  writeAuditLog(
    "Compile Receipt Layout",
    `Saved branded receipt mockup for ${merchantName} [Total: $${Number(total).toFixed(2)}].`
  );

  res.status(201).json(newReceipt);
});

// Gemini AI Scenario Generation Engine
app.post('/api/generate-scenario', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Please submit a scenario prompt.' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // Graceful local generator if key is placeholder or missing
      const mockResult = generateLocalMockFallback(prompt);
      transactions.unshift(...mockResult);
      saveData(TRANSACTIONS_FILE, transactions);
      writeAuditLog("System AI Generated Fallback", `Prompt: "${prompt}" - Generated ${mockResult.length} transactions locally. (No Gemini API Key specified)`);
      return res.json({ transactions: mockResult, note: "Generated using pre-designed fallback matching scenario prompts because no Gemini API Key is configured." });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const completionPrompt = `Generate a realistic JSON list of ${12} simulated financial transactions for a software demo based on the following training scenario description:
"${prompt}"

Each transaction object in the array MUST contain:
- id: a correct string representing a mock reference ID matching our channel formats:
  * Zelle: starts with "ZEL-" followed by 8 random uppercase alphanumeric characters (e.g., ZEL-F8D21E5C)
  * Venmo: starts with "VEN-" followed by 8 random uppercase alphanumeric characters (e.g., VEN-9A8C1B7D)
  * Cash App: starts with "CAS-" followed by 8 random uppercase alphanumeric characters (e.g., CAS-E9A2C1B4)
  * Bank Transfer: starts with "BNK-" followed by 12 random digits (e.g., BNK-002837461823)
- amount: any real float numeric value (representing dollars). Set it as negative if paying/buying something, or positive if receiving income.
- channel: MUST be exactly one of 'Zelle', 'Venmo', 'Cash App', or 'Bank Transfer'.
- sender: human name or company name representing the payer.
- receiver: human name or company name representing the receiver.
- status: exactly one of 'Completed', 'Pending', 'Failed'.
- timestamp: consecutive ISO 8601 string dates representing realistic timestamps (concluding in near recent June 2026 times).
- note: a short realistic note, e.g., "Dinner split", "Office rentals", "Refund", "Consulting invoice".

Provide your response strictly in JSON format as per the schema specification. No extra commentary.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: completionPrompt,
      config: {
        systemInstruction: "You are an expert financial simulation assistant for fintech applications. You always return highly structured, valid numeric transaction sequences exactly satisfying the responseSchema request.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Channel transaction ID following the prefix format" },
              amount: { type: Type.NUMBER, description: "Transfer amount in dollars (negative for outgoing, positive for incoming)" },
              channel: { type: Type.STRING, description: "Must be Zelle, Venmo, Cash App, or Bank Transfer" },
              sender: { type: Type.STRING },
              receiver: { type: Type.STRING },
              status: { type: Type.STRING, description: "Must be Completed, Pending, or Failed" },
              timestamp: { type: Type.STRING, description: "ISO 8601 format string" },
              note: { type: Type.STRING, description: "Brief description note of the financial transfer" }
            },
            required: ["id", "amount", "channel", "sender", "receiver", "status", "timestamp"]
          }
        }
      }
    });

    const returnedText = response.text || "";
    const parsedData = JSON.parse(returnedText) as SimulatedTransaction[];

    // Validate structured shapes
    const filteredList = parsedData.map(tx => {
      // Validate payment channel
      let validChannel: PaymentChannel = 'Zelle';
      if (tx.channel === 'Venmo' || tx.channel === 'Cash App' || tx.channel === 'Bank Transfer') {
        validChannel = tx.channel;
      }
      
      // Validate status
      let validStatus: TransactionStatus = 'Completed';
      if (tx.status === 'Pending' || tx.status === 'Failed') {
        validStatus = tx.status;
      }

      return {
        id: tx.id || generateTransactionId(validChannel),
        amount: Number(tx.amount) || 0,
        channel: validChannel,
        sender: tx.sender || 'Unknown Sender',
        receiver: tx.receiver || 'Unknown Receiver',
        status: validStatus,
        timestamp: tx.timestamp || new Date().toISOString(),
        note: tx.note || ''
      };
    });

    transactions.unshift(...filteredList);
    saveData(TRANSACTIONS_FILE, transactions);
    
    writeAuditLog(
      "AI Scenario Engine Injection", 
      `Prompt: "${prompt}" successfully generated and injected ${filteredList.length} AI-synthesized simulated records into the live ledger.`
    );

    res.json({ transactions: filteredList });

  } catch (error: any) {
    console.error("AI Generation Error: ", error);
    res.status(500).json({ error: 'AI generation failed: ' + error.message });
  }
});

// AI Chatbot Assistant Help Route
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Please supply a message.' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // Local smart response fallback
      const fallbackReplies = [
        "I'm online and ready! In this simulated fintech workspace, we support generating multi-rail payment patterns: Zelle (instant peer-to-peer), Venmo (social fees/splits), Cash App (cash tags), and Bank Transfers (high-volume ACH/Wires). What specific scenario would you like to construct?",
        "To test high-risk compliance controls, try prompting: 'Mock 5 Cash App failures' or select any transaction in the ledger list to Flag it for potential Fraud. The transaction details pane will immediately highlight compliance notices and security latencies!",
        "You can also select any transaction in the list and click 'Compile Branded Receipt' to generate fully detailed and customized PDF-style invoice templates for audits and customer logs.",
        "To run simulations, just enter a command like 'Generate 15 transfers from Sarah and Marcus under $100' or use the suggestion chips to build standard financial scenarios."
      ];
      const reply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      return res.json({ reply });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = `You are a helpful and knowledgeable Fintech Simulator Assistant inside the PayFlow Demo application.
The application is a sandbox environment for testing and staging API rails, consumer and merchant transaction histories, compliance audit trails, and customizable branded receipts.

Core Product Rails:
1. Zelle (Prefixed with ZEL-): instant peer-to-peer transfers, typically for personal fees.
2. Venmo (Prefixed with VEN-): social splits, food, shared rides.
3. Cash App (Prefixed with CAS-): casual quick payments with tags.
4. Bank Transfer (Prefixed with BNK-): high-volume ACH/Wires, corporate salaries.

Key Application Screens:
- Dashboard: Overview of account balances (simulated), quick manual scenario trigger forms, transaction table feeds, and transaction details inspector containing latency times, ISO formats, topographical geolocations, and mock alert email previewers.
- Transactions List: Full searchable, filterable simulation database where users can click individual records to view detailed technical meta specs or FLAG/CLEAR fraud suspicion alerts.
- Receipt Builder: Customized retail recipe structures with line-items, subtotal taxes, colors, logos, and print-ready options.
- Audit Ledger: Compliance trail displaying real-time simulation history for security officers.
- AI Assistant: Generate bulk simulated datasets and ask testing questions.

Answer the user clearly, helpfully, and professionally. Keep your answers concise, structured (using markdown if needed), and focused on financial simulation design. Raise alerts when appropriate, and suggest simulation prompts they can copy/paste.`;

    const contents = [];
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        contents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.content }]
        });
      }
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
      }
    });

    res.json({ reply: response.text || "I was unable to formulate a response. Please check your simulation prompt and try again." });
  } catch (err: any) {
    console.error("AI Chat error:", err);
    res.status(500).json({ error: "AI Chat failed to reply: " + err.message });
  }
});

// Mock generating function fallback in cases where Gemini Key isn't provided
function generateLocalMockFallback(prompt: string): SimulatedTransaction[] {
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
      id: generateTransactionId(channel),
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

// Start Server Setup with Express + Vite (Development vs Production)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Integrate Vite middleware in dev
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in prod
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PayFlow Demo] Running on http://localhost:${PORT}`);
  });
}

startServer();
