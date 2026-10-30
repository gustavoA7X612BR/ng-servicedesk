import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';

import { Post } from '../../../core/models/json-placeholder-post.model';
import { PostApiService } from '../services/post-api.service';

type PostDetailState =
  | { kind: 'loading' }
  | { kind: 'found'; post: Post }
  | { kind: 'not-found' }
  | { kind: 'error'; message: string };

@Component({
  selector: 'app-post-detail-page',
  imports: [RouterLink],
  templateUrl: './post-detail-page.html',
  styleUrl: './post-detail-page.scss',
})
export class PostDetailPage implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly postApi = inject(PostApiService);

  readonly state = signal<PostDetailState>({ kind: 'loading' });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => params.get('id')),
        distinctUntilChanged(),
        tap(() => this.state.set({ kind: 'loading' })),
        switchMap((id) => {
          const postId = Number(id);
          if (!id || !Number.isInteger(postId) || postId < 1) {
            return of<PostDetailState>({ kind: 'not-found' });
          }

          return this.postApi.getPostById(postId).pipe(
            map((post): PostDetailState => ({ kind: 'found', post })),
            catchError((error: unknown) => of(this.toErrorState(error))),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((state) => this.state.set(state));
  }

  private toErrorState(error: unknown): PostDetailState {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      return { kind: 'not-found' };
    }

    if (error instanceof HttpErrorResponse && error.status === 0) {
      return {
        kind: 'error',
        message: 'Falha de conexão ao consultar a publicação. Verifique sua conexão e tente novamente.',
      };
    }

    if (error instanceof HttpErrorResponse && error.status >= 500) {
      return {
        kind: 'error',
        message: `O servidor falhou ao consultar a publicação (HTTP ${error.status}). Tente novamente.`,
      };
    }

    return { kind: 'error', message: 'Ocorreu uma falha ao consultar a publicação.' };
  }
}
