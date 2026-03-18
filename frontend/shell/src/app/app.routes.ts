import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

export const routes: Routes = [
  // Admin panel — loaded from admin remote
  {
    path: 'admin',
    loadChildren: () =>
      loadRemoteModule('admin', './Routes').then((m) => m.routes),
  },

  // Supplier cabinet — loaded from supplier remote
  {
    path: 'supplier',
    loadChildren: () =>
      loadRemoteModule('supplier', './Routes').then((m) => m.routes),
  },

  // Customer (default) — loaded from customer remote
  // Must be last so /admin and /supplier take priority
  {
    path: '',
    loadChildren: () =>
      loadRemoteModule('customer', './Routes').then((m) => m.routes),
  },

  { path: '**', redirectTo: '' },
];
