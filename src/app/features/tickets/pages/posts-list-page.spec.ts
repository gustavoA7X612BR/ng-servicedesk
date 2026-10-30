import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, Subject, finalize, of, throwError } from 'rxjs';

import { Post } from '../../../core/models/json-placeholder-post.model';
import { PostApiService } from '../services/post-api.service';
import { PostsListPage } from './posts-list-page';

describe('PostsListPage', () => {
  let fixture: ComponentFixture<PostsListPage>;
  let postApi: { getPosts: ReturnType<typeof vi.fn> };

  const posts: Post[] = Array.from({ length: 12 }, (_, index) => ({
    userId: index + 1,
    id: index + 1,
    title: index === 0 ? 'Angular fundamentals' : `Demo post ${index + 1}`,
    body: `Body for post ${index + 1}`,
  }));

  function createPage(response: Observable<Post[]> = of(posts)): void {
    postApi = { getPosts: vi.fn(() => response) };
    TestBed.configureTestingModule({
      imports: [PostsListPage],
      providers: [provideRouter([]), { provide: PostApiService, useValue: postApi }],
    });
    fixture = TestBed.createComponent(PostsListPage);
    fixture.detectChanges();
  }

  it('shows a loading status while the list request is pending', () => {
    const response = new Subject<Post[]>();
    createPage(response);

    expect(fixture.nativeElement.textContent).toContain('Carregando publicações');
    expect(postApi.getPosts).toHaveBeenCalledOnce();

    response.next(posts);
    response.complete();
    fixture.detectChanges();
  });

  it('renders posts and reports total and filtered counts', () => {
    createPage();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.post-card').length).toBe(10);
    expect(element.querySelector('.result-count')?.textContent).toContain('12 de 12');
    expect(element.querySelector('.post-card h2')?.textContent).toContain('Angular fundamentals');
  });

  it('filters titles without case sensitivity and resets to the first page', () => {
    createPage();
    const nextButton = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'Próxima',
    ) as HTMLButtonElement;
    nextButton.click();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('#post-search') as HTMLInputElement;
    input.value = 'DEMO';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.post-card').length).toBe(10);
    expect(element.querySelector('.result-count')?.textContent).toContain('11 de 12');
    expect(element.querySelector('.pagination')?.textContent).toContain('Página 1 de 2');
    expect(element.textContent).toContain('Demo post 2');
  });

  it('sorts the list by ID in the opposite direction when requested', () => {
    createPage();
    const originalOrder = posts.map((post) => post.id);
    const sortButton = fixture.nativeElement.querySelector('.sort-button') as HTMLButtonElement;
    sortButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.post-id')?.textContent).toContain('#12');
    expect(posts.map((post) => post.id)).toEqual(originalOrder);
  });

  it('unsubscribes from the list request when the page is destroyed', () => {
    const response = new Subject<Post[]>();
    let sourceFinalized = false;
    createPage(response.pipe(finalize(() => (sourceFinalized = true))));

    fixture.destroy();

    expect(sourceFinalized).toBe(true);
  });

  it('paginates through the filtered results', () => {
    createPage();
    const nextButton = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'Próxima',
    ) as HTMLButtonElement;
    nextButton.click();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('.post-card').length).toBe(2);
    expect(element.querySelector('.pagination')?.textContent).toContain('Página 2 de 2');
  });

  it('reports when the API returns an empty list', () => {
    createPage(of([]));
    expect(fixture.nativeElement.textContent).toContain('não retornou publicações');
  });

  it('reports when a search has no matches', () => {
    createPage();
    const input = fixture.nativeElement.querySelector('#post-search') as HTMLInputElement;
    input.value = 'no match';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nenhuma publicação corresponde à pesquisa');
  });

  it('shows an error message when the API request fails', () => {
    createPage(throwError(() => new Error('network error')));

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Não foi possível carregar as publicações',
    );
  });
});
