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

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isTicketHistoryEvent(value: unknown): value is TicketHistoryEvent {
  return (
    isRecord(value) &&
    hasText(value['id']) &&
    isEnumValue(TicketHistoryEventType, value['type']) &&
    hasText(value['description']) &&
    hasText(value['author']) &&
    isValidDate(value['createdAt'])
  );
}

export function isTicket(value: unknown): value is Ticket {
  if (!isRecord(value)) return false;

  return (
    hasText(value['id']) &&
    hasText(value['title']) &&
    hasText(value['description']) &&
    hasText(value['requester']) &&
    typeof value['requesterEmail'] === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value['requesterEmail']) &&
    isEnumValue(TicketCategory, value['category']) &&
    isEnumValue(TicketPriority, value['priority']) &&
    isEnumValue(TicketStatus, value['status']) &&
    (value['assignedAgent'] === undefined || hasText(value['assignedAgent'])) &&
    isValidDate(value['createdAt']) &&
    isValidDate(value['updatedAt']) &&
    Array.isArray(value['history']) &&
    value['history'].every(isTicketHistoryEvent) &&
    isEnumValue(TicketOrigin, value['origin']) &&
    (value['externalPostId'] === undefined || Number.isInteger(value['externalPostId'])) &&
    (value['origin'] === TicketOrigin.Local
      ? value['externalPostId'] === undefined
      : Number.isInteger(value['externalPostId']) && Number(value['externalPostId']) > 0)
  );
}
