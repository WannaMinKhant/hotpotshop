// Supabase Realtime hook factory
import { useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

/**
 * Subscribe to realtime changes on a table.
 * Returns cleanup function.
 */
export function useRealtime(
  tableName: string,
  onInsert: (payload: Record<string, unknown>) => void,
  onUpdate: (payload: Record<string, unknown>) => void,
  onDelete: (payload: Record<string, unknown>) => void,
  filter?: string,
): RealtimeChannel | null {
  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const setup = async () => {
      // Subscribe to inserts, updates, and deletes
      channel = supabase
        .channel(`realtime-${tableName}-${Math.random().toString(36).slice(2, 8)}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: tableName, ...(filter ? { filter } : {}) },
          (payload) => onInsert(payload.new as Record<string, unknown>),
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: tableName, ...(filter ? { filter } : {}) },
          (payload) => onUpdate(payload.new as Record<string, unknown>),
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: tableName, ...(filter ? { filter } : {}) },
          (payload) => onDelete(payload.old as Record<string, unknown>),
        )
        .subscribe();
    };

    setup();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [tableName, onInsert, onUpdate, onDelete, filter]);

  return null;
}
