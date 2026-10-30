import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Post, PostList } from '../../../core/models/json-placeholder-post.model';

@Injectable({ providedIn: 'root' })
export class PostApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = 'https://jsonplaceholder.typicode.com/posts';

  getPosts(): Observable<PostList> {
    return this.http.get<PostList>(this.endpoint);
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.endpoint}/${id}`);
  }
}
