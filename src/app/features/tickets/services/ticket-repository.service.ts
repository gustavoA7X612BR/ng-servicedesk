import { Injectable, inject } from '@angular/core';

import { Ticket, TicketList } from '../../../core/models/ticket.model';
import { isTicket } from '../../../core/models/ticket-validation';
import { TICKET_STORAGE } from '../../../core/services/ticket-storage';

interface TicketStorageEnvelope {
  version: number;
  tickets: TicketList;
}

export type TicketStorageErrorKind = 'unavailable' | 'corrupt' | 'incompatible' | 'invalid';

export class TicketStorageError extends Error {
  constructor(
    readonly kind: TicketStorageErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'TicketStorageError';
  }
}

const STORAGE_KEY = 'ng-servicedesk.tickets';
const STORAGE_VERSION = 1;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidTicketCollection(value: unknown[]): value is TicketList {
  if (!value.every(isTicket)) return false;
  const ids = value.map((ticket) => ticket.id);
  const externalReferences = value
    .map((ticket) => ticket.externalPostId)
    .filter((id): id is number => id !== undefined);
  return new Set(ids).size === ids.length && new Set(externalReferences).size === externalReferences.length;
}

@Injectable({ providedIn: 'root' })
export class TicketRepositoryService {
  private readonly storage = inject(TICKET_STORAGE);

  load(): TicketList {
    let serialized: string | null;
    try {
      serialized = this.storage.getItem(STORAGE_KEY);
    } catch {
      throw new TicketStorageError('unavailable', 'O armazenamento local não está disponível.');
    }

    if (serialized === null) return [];

    let payload: unknown;
    try {
      payload = JSON.parse(serialized) as unknown;
    } catch {
      throw new TicketStorageError('corrupt', 'Os dados locais estão corrompidos. O conteúdo foi preservado.');
    }

    if (!isRecord(payload) || typeof payload['version'] !== 'number') {
      throw new TicketStorageError('corrupt', 'O formato dos dados locais não é válido. O conteúdo foi preservado.');
    }
    if (payload['version'] !== STORAGE_VERSION) {
      throw new TicketStorageError(
        'incompatible',
        'Os dados locais foram criados por uma versão incompatível. O conteúdo foi preservado.',
      );
    }
    if (!Array.isArray(payload['tickets']) || !isValidTicketCollection(payload['tickets'])) {
      throw new TicketStorageError('corrupt', 'Há tickets locais inválidos. O conteúdo foi preservado.');
    }

    return payload['tickets'] as TicketList;
  }

  save(tickets: TicketList): void {
    if (!isValidTicketCollection(tickets)) {
      throw new TicketStorageError('invalid', 'Não foi possível salvar tickets com dados inválidos.');
    }

    const envelope: TicketStorageEnvelope = { version: STORAGE_VERSION, tickets };
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    } catch {
      throw new TicketStorageError('unavailable', 'Não foi possível gravar no armazenamento local.');
    }
  }

  clear(): void {
    try {
      this.storage.removeItem(STORAGE_KEY);
    } catch {
      throw new TicketStorageError('unavailable', 'Não foi possível limpar o armazenamento local.');
    }
  }
}
