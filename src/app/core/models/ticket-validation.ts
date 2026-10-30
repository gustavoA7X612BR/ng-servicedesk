import {
  Ticket,
  TicketCategory,
  TicketHistoryEvent,
  TicketHistoryEventType,
  TicketOrigin,
  TicketPriority,
  TicketStatus,
} from './ticket.model';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isEnumValue<T extends Record<string, string>>(enumType: T, value: unknown): value is T[keyof T] {
  return Object.values(enumType).includes(value as string);
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

export function isTicketHistoryEvent(value: unknown): value is TicketHistoryEvent {
  return (
    isRecord(value) &&
    typeof value['id'] === 'string' &&
    isEnumValue(TicketHistoryEventType, value['type']) &&
    typeof value['description'] === 'string' &&
    typeof value['author'] === 'string' &&
    isValidDate(value['createdAt'])
  );
}

export function isTicket(value: unknown): value is Ticket {
  if (!isRecord(value)) return false;

  return (
    typeof value['id'] === 'string' &&
    typeof value['title'] === 'string' &&
    typeof value['description'] === 'string' &&
    typeof value['requester'] === 'string' &&
    typeof value['requesterEmail'] === 'string' &&
    isEnumValue(TicketCategory, value['category']) &&
    isEnumValue(TicketPriority, value['priority']) &&
    isEnumValue(TicketStatus, value['status']) &&
    (value['assignedAgent'] === undefined || typeof value['assignedAgent'] === 'string') &&
    isValidDate(value['createdAt']) &&
    isValidDate(value['updatedAt']) &&
    Array.isArray(value['history']) &&
    value['history'].every(isTicketHistoryEvent) &&
    isEnumValue(TicketOrigin, value['origin']) &&
    (value['externalPostId'] === undefined || Number.isFinite(value['externalPostId']))
  );
}
