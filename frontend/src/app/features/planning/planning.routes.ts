import { Routes } from '@angular/router';

export const PLANNING_ROUTES: Routes = [
  {
    path: '',
    component: () => import('./pages/planning-list/planning-list.component').then(m => m.PlanningListComponent),
    data: { title: 'Planning Weeks' }
  },
  {
    path: 'create',
    component: () => import('./pages/planning-form/planning-form.component').then(m => m.PlanningFormComponent),
    data: { title: 'Create Planning Week' }
  },
  {
    path: ':id',
    component: () => import('./pages/planning-detail/planning-detail.component').then(m => m.PlanningDetailComponent),
    data: { title: 'Planning Week Details' }
  },
  {
    path: ':id/edit',
    component: () => import('./pages/planning-form/planning-form.component').then(m => m.PlanningFormComponent),
    data: { title: 'Edit Planning Week' }
  }
];
