import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStore } from '../store/app.store';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export function roleGuard(allowedRole: string): CanActivateFn {
  return () => {
    const appStore = inject(AppStore);
    const authService = inject(AuthService);
    const router = inject(Router);

    if (appStore.initialized()) {
      return appStore.userRole() === allowedRole || router.createUrlTree(['/login']);
    }

    // Session not yet restored — fetch it, update store, then check
    return authService.getSession().pipe(
      map((session) => {
        if (session?.user) {
          appStore.setUser(session.user);
        }

        if (session?.user.role === allowedRole) return true;
        return router.createUrlTree(['/login']);
      }),
    );
  };
}
