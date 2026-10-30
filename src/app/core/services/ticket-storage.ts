import { InjectionToken } from '@angular/core';

export interface TicketStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const TICKET_STORAGE = new InjectionToken<TicketStorageAdapter>('TICKET_STORAGE', {
  providedIn: 'root',
  factory: () => globalThis.localStorage,
});
