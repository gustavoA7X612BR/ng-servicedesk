import { Routes } from '@angular/router';
import { PostDetailPage } from './features/tickets/pages/post-detail-page';
import { PostsListPage } from './features/tickets/pages/posts-list-page';

export const routes: Routes = [
  { path: '', component: PostsListPage },
  { path: 'posts/:id', component: PostDetailPage },
];
