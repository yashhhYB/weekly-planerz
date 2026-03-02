import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    component: () => import('./home/home.component').then(m => m.HomeComponent)
  }
];
