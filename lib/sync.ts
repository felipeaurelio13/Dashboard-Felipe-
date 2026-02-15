import { listOutbox, removeOutbox } from './outbox';
import { supabase } from './supabase';

const baseDelay = 800;

export async function flushOutbox() {
  const queue = await listOutbox();
  for (const item of queue) {
    try {
      const op = item.action === 'upsert' ? supabase.from(item.table).upsert(item.payload) : supabase.from(item.table).insert(item.payload);
      const { error } = await op;
      if (error) throw error;
      await removeOutbox(item.id);
    } catch {
      await new Promise((r) => setTimeout(r, baseDelay * (item.retries + 1) ** 2));
    }
  }
}
