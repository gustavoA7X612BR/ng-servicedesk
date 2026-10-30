import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { TICKET_STORAGE, TicketStorageAdapter } from '../../../core/services/ticket-storage';
import { Post } from '../../../core/models/json-placeholder-post.model';
import { PostApiService } from './post-api.service';
import { DemoPostImportService } from './demo-post-import.service';
import { TicketService } from './ticket.service';

describe('DemoPostImportService', () => {
  it('imports API posts once and does not use API write methods', async () => {
    const post: Post = { id: 1, userId: 2, title: 'Post de exemplo', body: 'Descrição demonstrativa.' };
    const storageValues = new Map<string, string>();
    const storage: TicketStorageAdapter = {
      getItem: (key) => storageValues.get(key) ?? null,
      setItem: (key, value) => storageValues.set(key, value),
      removeItem: (key) => storageValues.delete(key),
    };
    const api = { getPosts: vi.fn(() => of([post])) };
    TestBed.configureTestingModule({
      providers: [
        { provide: TICKET_STORAGE, useValue: storage },
        { provide: PostApiService, useValue: api },
      ],
    });

    const importer = TestBed.inject(DemoPostImportService);
    const ticketService = TestBed.inject(TicketService);
    expect(await firstValueFrom(importer.importPosts())).toBe(1);
    expect(await firstValueFrom(importer.importPosts())).toBe(0);

    expect(api.getPosts).toHaveBeenCalledTimes(2);
    expect(ticketService.tickets()).toHaveLength(1);
    expect(ticketService.tickets()[0].title).toBe(post.title);
  });
});
