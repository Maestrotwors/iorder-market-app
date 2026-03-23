import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@features';
import { AuthService } from '@shared';
import { map } from 'rxjs';

export function roleGuard(allowedRole: string): CanActivateFn {
  return () => {
    const authStore = inject(AuthStore);
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authStore.initialized()) {
      return authStore.userRole() === allowedRole || router.createUrlTree(['/login']);
    }

    return authService.getSession().pipe(
      map((session) => {
        if (session?.user) {
          authStore.setUser(session.user);
        }

        if (session?.user.role === allowedRole) return true;
        return router.createUrlTree(['/login']);
      }),
    );
  };
}
