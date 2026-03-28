import { signalStore, withState, withMethods } from '@ngrx/signals';

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
  withMethods(() => ({})),
);
