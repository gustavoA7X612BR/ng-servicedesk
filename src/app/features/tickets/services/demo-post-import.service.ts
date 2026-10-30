import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { PostApiService } from './post-api.service';
import { mapPostToDemoTicket } from './demo-post-ticket.mapper';
import { TicketService } from './ticket.service';

@Injectable({ providedIn: 'root' })
export class DemoPostImportService {
  private readonly postApi = inject(PostApiService);
  private readonly ticketService = inject(TicketService);

  importPosts(): Observable<number> {
    return this.postApi.getPosts().pipe(
      map((posts) =>
        this.ticketService.importDemonstrationTickets(posts.map((post) => mapPostToDemoTicket(post))),
      ),
    );
  }
}
