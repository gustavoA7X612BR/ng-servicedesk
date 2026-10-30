/**
 * Representation returned by JSONPlaceholder's /posts and /posts/:id endpoints.
 * These records are demo posts, not persisted support tickets.
 */
export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

/** Response shape returned by GET /posts. */
export type PostList = Post[];
