import { Routes } from '@angular/router';
import { roleGuard } from '@shared';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing').then((m) => m.LandingComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/landing/home').then((m) => m.LandingHomeComponent),
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register').then((m) => m.RegisterComponent),
      },
    ],
  },
  {
    path: 'customer',
    canActivate: [roleGuard('customer')],
    loadComponent: () => import('./pages/customer').then((m) => m.CustomerComponent),
  },
  {
    path: 'supplier',
    canActivate: [roleGuard('supplier')],
    loadComponent: () => import('./pages/supplier').then((m) => m.SupplierComponent),
  },
  {
    path: 'admin',
    canActivate: [roleGuard('admin')],
    loadComponent: () => import('./pages/admin').then((m) => m.AdminComponent),
  },
  { path: '**', redirectTo: '' },
];
