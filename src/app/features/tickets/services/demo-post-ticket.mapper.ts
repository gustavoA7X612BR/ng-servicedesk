import { createHistoryEvent } from '../../../core/models/ticket-factory';
import {
  Post,
} from '../../../core/models/json-placeholder-post.model';
import {
  Ticket,
  TicketCategory,
  TicketHistoryEventType,
  TicketOrigin,
  TicketPriority,
  TicketStatus,
} from '../../../core/models/ticket.model';

const categories = Object.values(TicketCategory);
const priorities = Object.values(TicketPriority);

export function mapPostToDemoTicket(post: Post, importedAt = new Date().toISOString()): Ticket {
  const id = `demo-post-${post.id}`;
  return {
    id,
    title: post.title,
    description: post.body,
    requester: `Solicitante demonstrativo #${post.userId}`,
    requesterEmail: `solicitante-${post.userId}@example.invalid`,
    category: categories[post.id % categories.length],
    priority: priorities[post.id % priorities.length],
    status: TicketStatus.Open,
    createdAt: importedAt,
    updatedAt: importedAt,
    history: [
      createHistoryEvent(
        TicketHistoryEventType.Imported,
        `Importado como dado demonstrativo do post #${post.id}.`,
        'Sistema de demonstração',
        importedAt,
        (prefix) => `${prefix}-${post.id}`,
      ),
    ],
    origin: TicketOrigin.JsonPlaceholder,
    externalPostId: post.id,
  };
}
