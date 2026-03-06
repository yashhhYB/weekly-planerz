import { Routes } from '@angular/router';

export const PLANNING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/planning-list/planning-list.component').then(m => m.PlanningListComponent),
    data: { title: 'Planning Weeks' }
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/planning-form/planning-form.component').then(m => m.PlanningFormComponent),
    data: { title: 'Create Planning Week' }
  },
  {
    path: 'past',
    loadComponent: () => import('./pages/past-weeks/past-weeks.component').then(m => m.PastWeeksComponent),
    data: { title: 'Past Weeks' }
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/planning-detail/planning-detail.component').then(m => m.PlanningDetailComponent),
    data: { title: 'Planning Week Details' }
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/planning-form/planning-form.component').then(m => m.PlanningFormComponent),
    data: { title: 'Edit Planning Week' }
  },
  {
    path: ':weekId/board/:weekMemberId',
    loadComponent: () => import('./pages/member-board/member-board.component').then(m => m.MemberBoardComponent),
    data: { title: 'Member Planning Board' }
  },
  {
    path: ':id/dashboard',
    loadComponent: () => import('./pages/lead-dashboard/lead-dashboard.component').then(m => m.LeadDashboardComponent),
    data: { title: 'Lead Dashboard' }
  },
  {
    path: ':weekId/progress/:weekMemberId',
    loadComponent: () => import('./pages/update-progress/update-progress.component').then(m => m.UpdateProgressComponent),
    data: { title: 'Update Progress' }
  },
  {
    path: ':id/review',
    loadComponent: () => import('./pages/review-freeze/review-freeze.component').then(m => m.ReviewFreezeComponent),
    data: { title: 'Review & Freeze' }
  }
];
