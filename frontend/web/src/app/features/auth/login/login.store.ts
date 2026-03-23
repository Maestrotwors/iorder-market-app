import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { AuthService } from '@shared/api/auth.service';
import { AuthStore } from '../auth.store';

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
      authStore = inject(AuthStore),
      router = inject(Router),
    ) => ({
      async login(email: string, password: string): Promise<void> {
        patchState(store, { loading: true, error: '' });

        authService.login(email, password).subscribe({
          next: (res) => {
            patchState(store, { loading: false });
            authStore.setUser(res.user);
            const route = ROLE_ROUTE_MAP[res.user.role] ?? '/customer';
            setTimeout(() => router.navigateByUrl(route));
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
