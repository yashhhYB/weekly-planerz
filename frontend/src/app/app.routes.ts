import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: () => import('./home/home.component').then(m => m.HomeComponent),
    data: { title: 'Dashboard' }
  },
  {
    path: 'planning',
    loadChildren: () => import('./features/planning/planning.routes').then(m => m.PLANNING_ROUTES),
    data: { title: 'Planning' }
  },
  {
    path: 'backlog',
    loadChildren: () => import('./features/backlog/backlog.routes').then(m => m.BACKLOG_ROUTES),
    data: { title: 'Backlog' }
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
