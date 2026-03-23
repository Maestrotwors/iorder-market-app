import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { AuthService } from '@shared';
import type { BetterAuthUser } from '@shared';

export interface AuthState {
  user: BetterAuthUser | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  initialized: false,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isAuthenticated: computed(() => !!store.user()),
    userRole: computed(() => store.user()?.role ?? null),
    userName: computed(() => store.user()?.name ?? null),
  })),
  withMethods((store, authService = inject(AuthService)) => ({
    init(): void {
      if (store.initialized()) return;

      authService.getSession().subscribe({
        next: (session) => {
          patchState(store, {
            user: session?.user ?? null,
            initialized: true,
          });
        },
        error: () => {
          patchState(store, { user: null, initialized: true });
        },
      });
    },
    setUser(user: BetterAuthUser): void {
      patchState(store, { user, initialized: true });
    },
    clearUser(): void {
      patchState(store, { user: null });
    },
  })),
);
