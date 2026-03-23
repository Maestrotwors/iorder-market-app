import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

export interface AppState {
  theme: 'light' | 'dark';
  initialized: boolean;
}

const initialState: AppState = {
  theme: 'light',
  initialized: false,
};

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    markInitialized(): void {
      patchState(store, { initialized: true });
    },
    toggleTheme(): void {
      patchState(store, { theme: store.theme() === 'light' ? 'dark' : 'light' });
    },
  })),
);
