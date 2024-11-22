import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../users/users-servicies/auth.service';

export const roleWhitelistGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const authorizedRoles: string[] = route.data['roles'];
  authorizedRoles.push('SuperAdmin');
  
  const userRole = authService.getActualRole() ?? '';

  if (authorizedRoles.includes(userRole))
    return true;

  return router.navigate(['main/home']);
};
