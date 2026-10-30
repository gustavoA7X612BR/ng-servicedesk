import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { Post, PostList } from '../../../core/models/json-placeholder-post.model';

export class InvalidPostPayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPostPayloadError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parsePost(value: unknown, index?: number): Post {
  const location = index === undefined ? 'post response' : `posts[${index}]`;
  if (!isRecord(value)) {
    throw new InvalidPostPayloadError(`Expected ${location} to be an object.`);
  }

  const { userId, id, title, body } = value;
  if (typeof userId !== 'number' || !Number.isFinite(userId)) {
    throw new InvalidPostPayloadError(`Expected ${location}.userId to be a number.`);
  }
  if (typeof id !== 'number' || !Number.isFinite(id)) {
    throw new InvalidPostPayloadError(`Expected ${location}.id to be a number.`);
  }
  if (typeof title !== 'string') {
    throw new InvalidPostPayloadError(`Expected ${location}.title to be a string.`);
  }
  if (typeof body !== 'string') {
    throw new InvalidPostPayloadError(`Expected ${location}.body to be a string.`);
  }

  return { userId, id, title, body };
}

function parsePostList(value: unknown): PostList {
  if (!Array.isArray(value)) {
    throw new InvalidPostPayloadError('Expected the posts response to be an array.');
  }

  return value.map((post: unknown, index: number) => parsePost(post, index));
}

@Injectable({ providedIn: 'root' })
export class PostApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = 'https://jsonplaceholder.typicode.com/posts';

  getPosts(): Observable<PostList> {
    return this.http.get<unknown>(this.endpoint).pipe(map(parsePostList));
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<unknown>(`${this.endpoint}/${id}`).pipe(map((post) => parsePost(post)));
  }
}
