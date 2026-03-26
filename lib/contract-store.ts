import fs from 'fs'
import path from 'path'

const STORE_PATH = path.join(process.cwd(), '.contract-store.json')

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
}

interface ContractStore {
  contracts: Record<string, ContractRecord>
}

function readStore(): ContractStore {
  try {
    if (fs.existsSync(STORE_PATH)) return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'))
  } catch {}
  return { contracts: {} }
}

function writeStore(store: ContractStore): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2))
}

export function saveContract(record: ContractRecord): void {
  const store = readStore()
  store.contracts[record.id] = record
  writeStore(store)
}

export function getContract(id: string): ContractRecord | null {
  return readStore().contracts[id] ?? null
}

export function updateContract(id: string, patch: Partial<ContractRecord>): ContractRecord | null {
  const store = readStore()
  if (!store.contracts[id]) return null
  store.contracts[id] = { ...store.contracts[id], ...patch }
  writeStore(store)
  return store.contracts[id]
}

export function getAllContracts(): ContractRecord[] {
  return Object.values(readStore().contracts)
}
