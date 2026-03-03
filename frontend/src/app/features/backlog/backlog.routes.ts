import { Routes } from '@angular/router';

export const BACKLOG_ROUTES: Routes = [
  {
    path: '',
    component: () => import('./pages/backlog-list/backlog-list.component').then(m => m.BacklogListComponent),
    data: { title: 'Backlog Items' }
  },
  {
    path: 'create',
    component: () => import('./pages/backlog-form/backlog-form.component').then(m => m.BacklogFormComponent),
    data: { title: 'Create Backlog Item' }
  },
  {
    path: ':id',
    component: () => import('./pages/backlog-detail/backlog-detail.component').then(m => m.BacklogDetailComponent),
    data: { title: 'Backlog Item Details' }
  },
  {
    path: ':id/edit',
    component: () => import('./pages/backlog-form/backlog-form.component').then(m => m.BacklogFormComponent),
    data: { title: 'Edit Backlog Item' }
  }
];
