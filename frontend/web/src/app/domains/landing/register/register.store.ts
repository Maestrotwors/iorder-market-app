import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { AuthService } from '../../../core/services/auth.service';
import { AppStore } from '../../../core/store/app.store';

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
      appStore = inject(AppStore),
      router = inject(Router),
    ) => ({
      register(name: string, email: string, password: string): void {
        patchState(store, { loading: true, error: '' });

        authService.register(name, email, password).subscribe({
          next: (res) => {
            patchState(store, { loading: false });
            appStore.setUser(res.user);
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
