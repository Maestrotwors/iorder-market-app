import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./domains/landing/landing.component').then((m) => m.LandingComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./domains/landing/home/landing-home.component').then(
            (m) => m.LandingHomeComponent,
          ),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./domains/landing/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./domains/landing/register/register.component').then((m) => m.RegisterComponent),
      },
    ],
  },
  {
    path: 'customer',
    canActivate: [roleGuard('customer')],
    loadComponent: () =>
      import('./domains/customer/customer.component').then((m) => m.CustomerComponent),
  },
  {
    path: 'supplier',
    canActivate: [roleGuard('supplier')],
    loadComponent: () =>
      import('./domains/supplier/supplier.component').then((m) => m.SupplierComponent),
  },
  {
    path: 'admin',
    canActivate: [roleGuard('admin')],
    loadComponent: () => import('./domains/admin/admin.component').then((m) => m.AdminComponent),
  },
  { path: '**', redirectTo: '' },
];
