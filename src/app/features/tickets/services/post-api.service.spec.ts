import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Post, PostList } from '../../../core/models/json-placeholder-post.model';
import { PostApiService } from './post-api.service';

describe('PostApiService', () => {
  let service: PostApiService;
  let httpTestingController: HttpTestingController;

  const endpoint = 'https://jsonplaceholder.typicode.com/posts';
  const samplePost: Post = {
    userId: 1,
    id: 1,
    title: 'Example post',
    body: 'Example post body',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PostApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('sends GET /posts and returns the typed post list', () => {
    const expectedPosts: PostList = [samplePost];
    let actualPosts: PostList | undefined;

    service.getPosts().subscribe((posts) => (actualPosts = posts));

    const request = httpTestingController.expectOne(endpoint);
    expect(request.request.method).toBe('GET');
    request.flush(expectedPosts);

    expect(actualPosts).toEqual(expectedPosts);
  });

  it('sends GET /posts/:id and returns the typed post', () => {
    let actualPost: Post | undefined;

    service.getPostById(samplePost.id).subscribe((post) => (actualPost = post));

    const request = httpTestingController.expectOne(`${endpoint}/${samplePost.id}`);
    expect(request.request.method).toBe('GET');
    request.flush(samplePost);

    expect(actualPost).toEqual(samplePost);
  });

  it('propagates an HTTP error when the post list request fails', () => {
    let actualError: HttpErrorResponse | undefined;

    service.getPosts().subscribe({ error: (error: HttpErrorResponse) => (actualError = error) });

    const request = httpTestingController.expectOne(endpoint);
    request.flush('Server unavailable', { status: 500, statusText: 'Server Error' });

    expect(actualError?.status).toBe(500);
  });

  it('propagates an HTTP error when a post is not found', () => {
    let actualError: HttpErrorResponse | undefined;

    service.getPostById(999).subscribe({
      error: (error: HttpErrorResponse) => (actualError = error),
    });

    const request = httpTestingController.expectOne(`${endpoint}/999`);
    request.flush('Post not found', { status: 404, statusText: 'Not Found' });

    expect(actualError?.status).toBe(404);
  });
});
