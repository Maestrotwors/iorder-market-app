import { Routes } from '@angular/router';
import { roleGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.component').then((m) => m.LandingComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/landing/home/landing-home.component').then(
            (m) => m.LandingHomeComponent,
          ),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
    ],
  },
  {
    path: 'customer',
    canActivate: [roleGuard('customer')],
    loadComponent: () =>
      import('./pages/customer/customer.component').then((m) => m.CustomerComponent),
  },
  {
    path: 'supplier',
    canActivate: [roleGuard('supplier')],
    loadComponent: () =>
      import('./pages/supplier/supplier.component').then((m) => m.SupplierComponent),
  },
  {
    path: 'admin',
    canActivate: [roleGuard('admin')],
    loadComponent: () => import('./pages/admin/admin.component').then((m) => m.AdminComponent),
  },
  { path: '**', redirectTo: '' },
];
