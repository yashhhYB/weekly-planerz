import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'setup',
    loadComponent: () => import('./features/team/pages/team-setup/team-setup.component').then(m => m.TeamSetupComponent),
    data: { title: 'Team Setup' }
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
    data: { title: 'Home' }
  },
  {
    path: 'dashboard',
    redirectTo: 'home',
    pathMatch: 'full'
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
    path: 'team',
    loadChildren: () => import('./features/team/team.routes').then(m => m.TEAM_ROUTES),
    data: { title: 'Team' }
  },
  {
    path: 'weeks',
    loadComponent: () => import('./features/planning/pages/past-weeks/past-weeks.component').then(m => m.PastWeeksComponent),
    data: { title: 'Past Weeks' }
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
