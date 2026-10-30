import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, Subject, of, throwError } from 'rxjs';

import { Post } from '../../../core/models/json-placeholder-post.model';
import { PostApiService } from '../services/post-api.service';
import { PostDetailPage } from './post-detail-page';

describe('PostDetailPage', () => {
  let fixture: ComponentFixture<PostDetailPage>;
  let postApi: { getPostById: ReturnType<typeof vi.fn> };

  const post: Post = {
    userId: 4,
    id: 12,
    title: 'A demo publication',
    body: 'The full body of this publication.',
  };

  function createPage(response: Observable<Post> = of(post), id = String(post.id)): void {
    postApi = { getPostById: vi.fn(() => response) };
    TestBed.configureTestingModule({
      imports: [PostDetailPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of<ParamMap>(convertToParamMap({ id })) } },
        { provide: PostApiService, useValue: postApi },
      ],
    });
    fixture = TestBed.createComponent(PostDetailPage);
    fixture.detectChanges();
  }

  it('shows a loading state while the detail request is pending', () => {
    const response = new Subject<Post>();
    createPage(response);

    expect(fixture.nativeElement.textContent).toContain('Carregando publicação');
    expect(postApi.getPostById).toHaveBeenCalledWith(post.id);

    response.next(post);
    response.complete();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(post.title);
  });

  it('renders the fields returned for a found post', () => {
    createPage();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain(post.title);
    expect(element.textContent).toContain(post.body);
    expect(element.textContent).toContain('Usuário associado: #4');
  });

  it('reports HTTP 404 as a post that was not found', () => {
    createPage(
      throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found' })),
    );

    expect(fixture.nativeElement.textContent).toContain('Publicação não encontrada');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('reports a connection failure separately from a missing post', () => {
    createPage(throwError(() => new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' })));

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Falha de conexão',
    );
    expect(fixture.nativeElement.textContent).not.toContain('Publicação não encontrada');
  });

  it('reports a server error separately from a missing post', () => {
    createPage(throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' })));

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'HTTP 500',
    );
    expect(fixture.nativeElement.textContent).not.toContain('Publicação não encontrada');
  });

  it('does not request an invalid route identifier', () => {
    createPage(of(post), 'invalid');

    expect(postApi.getPostById).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Publicação não encontrada');
  });
});
