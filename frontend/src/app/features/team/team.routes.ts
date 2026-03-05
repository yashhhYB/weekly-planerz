import { Routes } from '@angular/router';

export const TEAM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/team-list/team-list.component').then(m => m.TeamListComponent),
    data: { title: 'Manage Team' }
  },
  {
    path: 'setup',
    loadComponent: () => import('./pages/team-setup/team-setup.component').then(m => m.TeamSetupComponent),
    data: { title: 'Team Setup' }
  }
];
