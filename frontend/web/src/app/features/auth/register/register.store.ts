import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { AuthService } from '@shared/api/auth.service';
import { AuthStore } from '../auth.store';

export interface RegisterState {
  loading: boolean;
  error: string;
}

const initialState: RegisterState = {
  loading: false,
  error: '',
};

export const RegisterStore = signalStore(
  withState(initialState),
  withMethods(
    (
      store,
      authService = inject(AuthService),
      authStore = inject(AuthStore),
      router = inject(Router),
    ) => ({
      register(name: string, email: string, password: string): void {
        patchState(store, { loading: true, error: '' });

        authService.register(name, email, password).subscribe({
          next: (res) => {
            patchState(store, { loading: false });
            authStore.setUser(res.user);
            router.navigateByUrl('/customer');
          },
          error: (err) => {
            patchState(store, {
              loading: false,
              error: err.error?.message ?? 'Registration failed. Please try again.',
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
