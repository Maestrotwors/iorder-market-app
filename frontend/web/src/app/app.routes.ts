import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'customer',
    loadComponent: () => import('./pages/customer/customer.component').then(m => m.CustomerComponent),
  },
  {
    path: 'supplier',
    loadComponent: () => import('./pages/supplier/supplier.component').then(m => m.SupplierComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
  },
  { path: '', redirectTo: 'customer', pathMatch: 'full' },
  { path: '**', redirectTo: 'customer' },
];
