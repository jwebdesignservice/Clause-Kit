/**
 * Payment store — Vercel KV in production, file-based fallback for local dev.
 * Vercel KV requires KV_REST_API_URL + KV_REST_API_TOKEN env vars.
 *
 * Production safety: file-system writes on Vercel are ephemeral and lost on
 * every deploy. KV is the only reliable backing store for payment state.
 */

import fs from 'fs';
import path from 'path';

const USE_KV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const KV_PREFIX = 'payment:';
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

// ── KV helpers ────────────────────────────────────────────────────────────────

async function kvGet(sessionId: string): Promise<PaymentRecord | null> {
  try {
    const { kv } = await import('@vercel/kv');
    return await kv.get<PaymentRecord>(`${KV_PREFIX}${sessionId}`);
  } catch (e) {
    console.error('KV payment get failed:', e);
    return null;
  }
}

async function kvSet(record: PaymentRecord): Promise<void> {
  try {
    const { kv } = await import('@vercel/kv');
    // Keep payment records for 90 days
    await kv.set(`${KV_PREFIX}${record.sessionId}`, record, { ex: 60 * 60 * 24 * 90 });
  } catch (e) {
    console.error('KV payment set failed:', e);
  }
}

// ── File-based fallback (local dev only) ──────────────────────────────────────

function readStore(): PaymentStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
    }
  } catch {}
  return { payments: {} };
}

function writeStore(store: PaymentStore): void {
  try { fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2)); } catch {}
}

// ── Public async API ──────────────────────────────────────────────────────────

export async function setPaymentStatusAsync(
  sessionId: string,
  contractId: string,
  status: 'pending' | 'paid',
): Promise<void> {
  const record: PaymentRecord = {
    sessionId,
    contractId,
    status,
    ...(status === 'paid' ? { paidAt: new Date().toISOString() } : {}),
  };
  if (USE_KV) {
    await kvSet(record);
  } else {
    const store = readStore();
    store.payments[sessionId] = record;
    writeStore(store);
  }
}

export async function getPaymentRecordAsync(sessionId: string): Promise<PaymentRecord | null> {
  if (USE_KV) return kvGet(sessionId);
  return readStore().payments[sessionId] ?? null;
}

export async function markPaidAsync(sessionId: string): Promise<void> {
  if (USE_KV) {
    const existing = await kvGet(sessionId);
    if (!existing) return;
    existing.status = 'paid';
    existing.paidAt = new Date().toISOString();
    await kvSet(existing);
    return;
  }
  const store = readStore();
  if (store.payments[sessionId]) {
    store.payments[sessionId].status = 'paid';
    store.payments[sessionId].paidAt = new Date().toISOString();
    writeStore(store);
  }
}

// ── Sync shims (fire-and-forget writes; reads return null in KV mode) ─────────

export function setPaymentStatus(sessionId: string, contractId: string, status: 'pending' | 'paid'): void {
  setPaymentStatusAsync(sessionId, contractId, status).catch(console.error);
}

export function getPaymentRecord(sessionId: string): PaymentRecord | null {
  if (USE_KV) return null; // caller must use async version
  return readStore().payments[sessionId] ?? null;
}

export function markPaid(sessionId: string): void {
  markPaidAsync(sessionId).catch(console.error);
}
