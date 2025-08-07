import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Verificar la validez de la sesión antes de permitir acceso
    const isSessionValid = this.authService.validateSession();
    
    if (isSessionValid) {
      return true;
    } else {
      // La sesión no es válida, el AuthService ya maneja la redirección
      return false;
    }
  }
} 