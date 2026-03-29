import fs from 'fs'
import path from 'path'

const STORE_PATH = path.join(process.cwd(), '.subscription-store.json')

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

interface SubStore {
  subscriptions: Record<string, SubscriptionRecord>
  dailyUsage: Record<string, DailyUsage> // key: `${userId}:${date}`
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

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getSubscription(userId: string): SubscriptionRecord | null {
  return readStore().subscriptions[userId] ?? null
}

export function setSubscription(record: SubscriptionRecord): void {
  const store = readStore()
  store.subscriptions[record.userId] = record
  writeStore(store)
}

export function hasActiveSubscription(userId: string): boolean {
  const sub = getSubscription(userId)
  return sub?.status === 'active'
}

export function getDailyUsage(userId: string): number {
  const store = readStore()
  const key = `${userId}:${todayUTC()}`
  return store.dailyUsage[key]?.count ?? 0
}

export function incrementDailyUsage(userId: string): void {
  const store = readStore()
  const key = `${userId}:${todayUTC()}`
  const existing = store.dailyUsage[key]
  store.dailyUsage[key] = {
    userId,
    date: todayUTC(),
    count: existing ? existing.count + 1 : 1,
  }
  writeStore(store)
}
