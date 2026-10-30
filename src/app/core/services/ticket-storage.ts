import { InjectionToken } from '@angular/core';

export interface TicketStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const TICKET_STORAGE = new InjectionToken<TicketStorageAdapter>('TICKET_STORAGE', {
  providedIn: 'root',
  factory: () => ({
    getItem: (key: string) => globalThis.localStorage.getItem(key),
    setItem: (key: string, value: string) => globalThis.localStorage.setItem(key, value),
    removeItem: (key: string) => globalThis.localStorage.removeItem(key),
  }),
});
