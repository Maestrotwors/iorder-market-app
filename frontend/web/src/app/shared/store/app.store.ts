import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { AuthService } from '../api/auth.service';
import { BetterAuthUser } from '../types/auth.types';

export interface AppState {
  user: BetterAuthUser | null;
  theme: 'light' | 'dark';
  initialized: boolean;
}

const initialState: AppState = {
  user: null,
  theme: 'light',
  initialized: false,
};

export const AppStore = signalStore(
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
    toggleTheme(): void {
      patchState(store, { theme: store.theme() === 'light' ? 'dark' : 'light' });
    },
  })),
);
