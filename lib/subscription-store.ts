/**
 * Subscription store — Vercel KV in production, file-based fallback for local dev.
 * Vercel KV requires KV_REST_API_URL + KV_REST_API_TOKEN env vars.
 */

import fs from 'fs'
import path from 'path'

export interface SubscriptionRecord {
  userId: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  status: 'active' | 'cancelled' | 'past_due'
  currentPeriodEnd?: string
  createdAt: string
}

interface DailyUsage {
  userId: string
  date: string // YYYY-MM-DD UTC
  count: number
}

// ── Determine storage backend ─────────────────────────────────────────────────

const USE_KV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
const SUB_PREFIX = 'sub:'
const USAGE_PREFIX = 'usage:'

// ── KV helpers ────────────────────────────────────────────────────────────────

async function kvGetSub(userId: string): Promise<SubscriptionRecord | null> {
  try {
    const { kv } = await import('@vercel/kv')
    return await kv.get<SubscriptionRecord>(`${SUB_PREFIX}${userId}`)
  } catch {
    return null
  }
}

async function kvSetSub(record: SubscriptionRecord): Promise<void> {
  try {
    const { kv } = await import('@vercel/kv')
    // Store for 400 days (covers annual billing cycles)
    await kv.set(`${SUB_PREFIX}${record.userId}`, record, { ex: 60 * 60 * 24 * 400 })
  } catch (e) {
    console.error('KV sub set failed:', e)
  }
}

async function kvGetUsage(key: string): Promise<DailyUsage | null> {
  try {
    const { kv } = await import('@vercel/kv')
    return await kv.get<DailyUsage>(`${USAGE_PREFIX}${key}`)
  } catch {
    return null
  }
}

async function kvSetUsage(key: string, usage: DailyUsage): Promise<void> {
  try {
    const { kv } = await import('@vercel/kv')
    // Expire after 48 hours — daily usage keys are short-lived
    await kv.set(`${USAGE_PREFIX}${key}`, usage, { ex: 60 * 60 * 48 })
  } catch (e) {
    console.error('KV usage set failed:', e)
  }
}

// ── File-based fallback (local dev) ───────────────────────────────────────────

const STORE_PATH = path.join(process.cwd(), '.subscription-store.json')

interface SubStore {
  subscriptions: Record<string, SubscriptionRecord>
  dailyUsage: Record<string, DailyUsage>
}

function readStore(): SubStore {
  try {
    if (fs.existsSync(STORE_PATH)) return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'))
  } catch {}
  return { subscriptions: {}, dailyUsage: {} }
}

function writeStore(store: SubStore): void {
  try { fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2)) } catch {}
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getSubscriptionAsync(userId: string): Promise<SubscriptionRecord | null> {
  if (USE_KV) return kvGetSub(userId)
  return readStore().subscriptions[userId] ?? null
}

export async function setSubscriptionAsync(record: SubscriptionRecord): Promise<void> {
  if (USE_KV) {
    await kvSetSub(record)
  } else {
    const store = readStore()
    store.subscriptions[record.userId] = record
    writeStore(store)
  }
}

export async function hasActiveSubscriptionAsync(userId: string): Promise<boolean> {
  const sub = await getSubscriptionAsync(userId)
  return sub?.status === 'active'
}

export async function getDailyUsageAsync(userId: string): Promise<number> {
  const key = `${userId}:${todayUTC()}`
  if (USE_KV) {
    const usage = await kvGetUsage(key)
    return usage?.count ?? 0
  }
  const store = readStore()
  return store.dailyUsage[key]?.count ?? 0
}

export async function incrementDailyUsageAsync(userId: string): Promise<void> {
  const key = `${userId}:${todayUTC()}`
  if (USE_KV) {
    const existing = await kvGetUsage(key)
    await kvSetUsage(key, {
      userId,
      date: todayUTC(),
      count: existing ? existing.count + 1 : 1,
    })
  } else {
    const store = readStore()
    const existing = store.dailyUsage[key]
    store.dailyUsage[key] = {
      userId,
      date: todayUTC(),
      count: existing ? existing.count + 1 : 1,
    }
    writeStore(store)
  }
}

// ── Sync shims (keep backwards compat for webhook handler) ───────────────────
// These fire-and-forget to KV; safe for webhook use where we don't await the store

export function getSubscription(userId: string): SubscriptionRecord | null {
  if (USE_KV) return null // caller must use async version in production
  return readStore().subscriptions[userId] ?? null
}

export function setSubscription(record: SubscriptionRecord): void {
  // Always kick off async write — works in both KV and file mode
  setSubscriptionAsync(record).catch(console.error)
}

export function hasActiveSubscription(userId: string): boolean {
  if (USE_KV) return false // caller must use async version in production
  const sub = readStore().subscriptions[userId]
  return sub?.status === 'active'
}

export function getDailyUsage(userId: string): number {
  if (USE_KV) return 0 // caller must use async version in production
  const key = `${userId}:${todayUTC()}`
  return readStore().dailyUsage[key]?.count ?? 0
}

export function incrementDailyUsage(userId: string): void {
  incrementDailyUsageAsync(userId).catch(console.error)
}
