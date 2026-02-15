import { openDB } from 'idb';

export type OutboxItem = {
  id: string;
  table: string;
  action: 'upsert' | 'insert';
  payload: Record<string, unknown>;
  retries: number;
  createdAt: number;
};

const DB_NAME = 'rituals-db';
const STORE = 'outbox';

async function db() {
  return openDB(DB_NAME, 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE, { keyPath: 'id' });
    }
  });
}

export const enqueue = async (item: OutboxItem) => (await db()).put(STORE, item);
export const listOutbox = async (): Promise<OutboxItem[]> => (await db()).getAll(STORE);
export const removeOutbox = async (id: string) => (await db()).delete(STORE, id);
