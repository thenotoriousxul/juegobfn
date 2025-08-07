import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const authGuard = (): Observable<boolean> => {
  const authService = inject(AuthService);
  
  // Primero validación rápida local
  const isSessionValid = authService.validateSession();
  
  if (!isSessionValid) {
    return of(false);
  }
  
  // Luego validación con el servidor para detectar tokens modificados
  return authService.checkTokenValidity().pipe(
    map(isValid => {
      if (!isValid) {
        console.log('🔒 Token inválido o modificado, redirigiendo a login');
      }
      return isValid;
    }),
    catchError(() => {
      console.log('🔒 Error validando token, redirigiendo a login');
      return of(false);
    })
  );
}; 