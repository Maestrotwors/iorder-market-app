import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./domains/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'customer',
    loadComponent: () =>
      import('./domains/customer/customer.component').then((m) => m.CustomerComponent),
  },
  {
    path: 'supplier',
    loadComponent: () =>
      import('./domains/supplier/supplier.component').then((m) => m.SupplierComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./domains/admin/admin.component').then((m) => m.AdminComponent),
  },
  { path: '**', redirectTo: '' },
];
