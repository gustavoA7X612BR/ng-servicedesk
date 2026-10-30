import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { Post } from '../../../core/models/json-placeholder-post.model';
import { PostApiService } from '../services/post-api.service';
import { routes } from '../../../app.routes';
import { PostsListPage } from './posts-list-page';

describe('Posts routes', () => {
  const post: Post = {
    userId: 1,
    id: 1,
    title: 'First demo post',
    body: 'Post details from the API.',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: PostApiService, useValue: { getPosts: () => of([post]), getPostById: () => of(post) } },
      ],
    });
  });

  it('navigates from a post title in the list to its details page', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/', PostsListPage);

    const postLink = harness.routeNativeElement?.querySelector(
      'a[aria-label="Ver publicação 1"]',
    ) as HTMLAnchorElement;
    expect(postLink).toBeTruthy();
    postLink.click();
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    expect(TestBed.inject(Router).url).toBe('/posts/1');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(post.title);
  });
});
