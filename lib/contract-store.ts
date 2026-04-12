/**
 * Contract store — Vercel KV in production, file-based fallback for local dev.
 * Vercel KV requires KV_REST_API_URL + KV_REST_API_TOKEN env vars.
 */

import fs from 'fs'
import path from 'path'

export interface PartyInfo {
  name: string
  email: string
  address: string
  company?: string
}

export interface SignatureRecord {
  dataUrl: string
  printedName: string
  signedAt: string
  ipAddress: string
}

export type ContractStatus = 'draft' | 'sent' | 'completed' | 'expired'

export interface ContractRecord {
  id: string
  contractType: string
  title: string
  content: string
  createdAt: string
  party1?: PartyInfo
  party2?: PartyInfo
  status: ContractStatus
  party1SigningToken?: string
  party2SigningToken?: string
  party1Signature?: SignatureRecord
  party2Signature?: SignatureRecord
  signedPdfPath?: string
  expiresAt?: string
  userId?: string
  docFont?: string
}

// ── Determine storage backend ─────────────────────────────────────────────────

const USE_KV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
const KV_PREFIX = 'contract:'

// ── KV helpers ────────────────────────────────────────────────────────────────

async function kvGet(id: string): Promise<ContractRecord | null> {
  try {
    const { kv } = await import('@vercel/kv')
    return await kv.get<ContractRecord>(`${KV_PREFIX}${id}`)
  } catch {
    return null
  }
}

async function kvSet(record: ContractRecord): Promise<void> {
  try {
    const { kv } = await import('@vercel/kv')
    // Store for 90 days
    await kv.set(`${KV_PREFIX}${record.id}`, record, { ex: 60 * 60 * 24 * 90 })
    // Also add to user's contract list if userId present
    if (record.userId) {
      const listKey = `user:${record.userId}:contracts`
      const existing: string[] = (await kv.get<string[]>(listKey)) ?? []
      if (!existing.includes(record.id)) {
        await kv.set(listKey, [...existing, record.id])
      }
    }
  } catch (e) {
    console.error('KV set failed:', e)
  }
}

async function kvGetUserContracts(userId: string): Promise<ContractRecord[]> {
  try {
    const { kv } = await import('@vercel/kv')
    const ids: string[] = (await kv.get<string[]>(`user:${userId}:contracts`)) ?? []
    const records = await Promise.all(ids.map((id) => kvGet(id)))
    return records.filter(Boolean) as ContractRecord[]
  } catch {
    return []
  }
}

// ── File-based fallback (local dev) ───────────────────────────────────────────

const STORE_PATH = path.join(process.cwd(), '.contract-store.json')

interface FileStore { contracts: Record<string, ContractRecord> }

function readFile(): FileStore {
  try {
    if (fs.existsSync(STORE_PATH)) return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'))
  } catch {}
  return { contracts: {} }
}

function writeFile(store: FileStore): void {
  try { fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2)) } catch {}
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function saveContractAsync(record: ContractRecord): Promise<void> {
  if (USE_KV) {
    await kvSet(record)
  } else {
    const s = readFile(); s.contracts[record.id] = record; writeFile(s)
  }
}

export async function getContractAsync(id: string): Promise<ContractRecord | null> {
  if (USE_KV) return kvGet(id)
  return readFile().contracts[id] ?? null
}

export async function updateContractAsync(id: string, patch: Partial<ContractRecord>): Promise<ContractRecord | null> {
  const existing = await getContractAsync(id)
  if (!existing) return null
  const updated = { ...existing, ...patch }
  await saveContractAsync(updated)
  return updated
}

export async function getContractsByUserAsync(userId: string): Promise<ContractRecord[]> {
  if (USE_KV) return kvGetUserContracts(userId)
  // File fallback: filter by userId
  const all = Object.values(readFile().contracts)
  return all.filter((c) => c.userId === userId)
}

// ── Sync wrappers (for compatibility with existing sync call sites) ────────────

export function saveContract(record: ContractRecord): void {
  saveContractAsync(record).catch(console.error)
}

export function getContract(id: string): ContractRecord | null {
  // Sync only works with file store — in production use getContractAsync
  if (USE_KV) return null // caller must use async version
  return readFile().contracts[id] ?? null
}

export function updateContract(id: string, patch: Partial<ContractRecord>): ContractRecord | null {
  if (USE_KV) return null
  const s = readFile()
  if (!s.contracts[id]) return null
  s.contracts[id] = { ...s.contracts[id], ...patch }
  writeFile(s)
  return s.contracts[id]
}
