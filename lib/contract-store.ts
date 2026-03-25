// Simple file-based contract store.
// For production, replace with Vercel KV or Supabase.
import fs from 'fs';
import path from 'path';

const STORE_PATH = path.join(process.cwd(), '.contract-store.json');

export interface ContractRecord {
  id: string;
  contractType: string;
  title: string;
  content: string;
  createdAt: string;
}

interface ContractStore {
  contracts: Record<string, ContractRecord>;
}

function readStore(): ContractStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
    }
  } catch {}
  return { contracts: {} };
}

function writeStore(store: ContractStore): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

export function saveContract(record: ContractRecord): void {
  const store = readStore();
  store.contracts[record.id] = record;
  writeStore(store);
}

export function getContract(id: string): ContractRecord | null {
  const store = readStore();
  return store.contracts[id] || null;
}
