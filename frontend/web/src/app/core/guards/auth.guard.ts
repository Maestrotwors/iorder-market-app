import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export function roleGuard(allowedRole: string): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.currentUser()) {
      return auth.userRole() === allowedRole || router.createUrlTree(['/login']);
    }

    return auth.getSession().pipe(
      map((session) => {
        if (session?.user.role === allowedRole) return true;
        return router.createUrlTree(['/login']);
      }),
    );
  };
}
