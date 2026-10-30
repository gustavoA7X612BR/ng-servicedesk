import { Post } from '../../../core/models/json-placeholder-post.model';
import { TicketCategory, TicketHistoryEventType, TicketOrigin, TicketStatus } from '../../../core/models/ticket.model';
import { mapPostToDemoTicket } from './demo-post-ticket.mapper';

describe('mapPostToDemoTicket', () => {
  it('maps the JSONPlaceholder fields and labels generated fields as demonstrative', () => {
    const post: Post = { id: 8, userId: 3, title: 'A demo title', body: 'A demo body' };
    const ticket = mapPostToDemoTicket(post, '2026-10-30T12:00:00.000Z');

    expect(ticket).toMatchObject({
      id: 'demo-post-8',
      externalPostId: 8,
      title: post.title,
      description: post.body,
      requester: 'Solicitante demonstrativo #3',
      requesterEmail: 'solicitante-3@example.invalid',
      category: TicketCategory.Access,
      status: TicketStatus.Open,
      origin: TicketOrigin.JsonPlaceholder,
    });
    expect(ticket.history[0].type).toBe(TicketHistoryEventType.Imported);
    expect(ticket.createdAt).toBe('2026-10-30T12:00:00.000Z');
  });
});
