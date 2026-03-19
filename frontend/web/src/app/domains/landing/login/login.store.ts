import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { AuthService } from '../../../core/services/auth.service';
import { AppStore } from '../../../core/store/app.store';

export interface LoginState {
  loading: boolean;
  error: string;
}

const initialState: LoginState = {
  loading: false,
  error: '',
};

const ROLE_ROUTE_MAP: Record<string, string> = {
  customer: '/customer',
  supplier: '/supplier',
  admin: '/admin',
};

export const LoginStore = signalStore(
  withState(initialState),
  withMethods(
    (
      store,
      authService = inject(AuthService),
      appStore = inject(AppStore),
      router = inject(Router),
    ) => ({
      login(email: string, password: string): void {
        patchState(store, { loading: true, error: '' });

        authService.login(email, password).subscribe({
          next: (res) => {
            patchState(store, { loading: false });
            appStore.setUser(res.user);
            router.navigateByUrl(ROLE_ROUTE_MAP[res.user.role] ?? '/customer');
          },
          error: (err) => {
            patchState(store, {
              loading: false,
              error: err.error?.message ?? 'Login failed. Please try again.',
            });
          },
        });
      },
      clearError(): void {
        patchState(store, { error: '' });
      },
    }),
  ),
);
