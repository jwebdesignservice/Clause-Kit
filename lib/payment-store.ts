// Simple file-based payment store.
// For production, replace with Vercel KV or Supabase.
import fs from 'fs';
import path from 'path';

const STORE_PATH = path.join(process.cwd(), '.payment-store.json');

interface PaymentRecord {
  sessionId: string;
  contractId: string;
  status: 'pending' | 'paid';
  paidAt?: string;
}

interface PaymentStore {
  payments: Record<string, PaymentRecord>;
}

function readStore(): PaymentStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
    }
  } catch {}
  return { payments: {} };
}

function writeStore(store: PaymentStore): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

export function setPaymentStatus(
  sessionId: string,
  contractId: string,
  status: 'pending' | 'paid'
): void {
  const store = readStore();
  store.payments[sessionId] = {
    sessionId,
    contractId,
    status,
    ...(status === 'paid' ? { paidAt: new Date().toISOString() } : {}),
  };
  writeStore(store);
}

export function getPaymentRecord(sessionId: string): PaymentRecord | null {
  const store = readStore();
  return store.payments[sessionId] || null;
}

export function markPaid(sessionId: string): void {
  const store = readStore();
  if (store.payments[sessionId]) {
    store.payments[sessionId].status = 'paid';
    store.payments[sessionId].paidAt = new Date().toISOString();
    writeStore(store);
  }
}
