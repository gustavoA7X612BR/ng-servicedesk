import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Post, PostList } from '../../../core/models/json-placeholder-post.model';
import { PaginationComponent } from '../components/pagination/pagination.component';
import { PostApiService } from '../services/post-api.service';

@Component({
  selector: 'app-posts-list-page',
  imports: [PaginationComponent, RouterLink],
  templateUrl: './posts-list-page.html',
  styleUrl: './posts-list-page.scss',
})
export class PostsListPage implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly postApi = inject(PostApiService);
  private readonly pageSize = 10;

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly posts = signal<PostList>([]);
  readonly searchTerm = signal('');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly currentPage = signal(1);

  readonly filteredPosts = computed(() => {
    const normalizedTerm = this.searchTerm().trim().toLocaleLowerCase();
    const direction = this.sortDirection() === 'asc' ? 1 : -1;

    return [...this.posts()]
      .filter((post) => post.title.toLocaleLowerCase().includes(normalizedTerm))
      .sort((left, right) => (left.id - right.id) * direction);
  });

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filteredPosts().length / this.pageSize)));
  readonly visiblePosts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredPosts().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.postApi
      .getPosts()
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false)))
      .subscribe({
        next: (posts) => {
          this.posts.set(posts);
          this.currentPage.set(1);
        },
        error: () => this.errorMessage.set('Não foi possível carregar as publicações. Tente novamente.'),
      });
  }

  onSearchInput(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) {
      this.searchTerm.set(input.value);
      this.currentPage.set(1);
    }
  }

  toggleSortDirection(): void {
    this.sortDirection.update((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    this.currentPage.set(Math.min(Math.max(page, 1), this.pageCount()));
  }
}
