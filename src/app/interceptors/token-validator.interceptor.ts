import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export function tokenValidatorInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        console.log('🔒 Token inválido detectado en petición HTTP:', error.status);
        console.log('🧹 Limpiando sesión y redirigiendo a login...');
        authService.logout().subscribe({
          next: () => console.log('✅ Logout exitoso por token inválido'),
          error: (logoutError: any) => console.error('❌ Error en logout:', logoutError)
        });
      }
      
      return throwError(() => error);
    })
  );
}
