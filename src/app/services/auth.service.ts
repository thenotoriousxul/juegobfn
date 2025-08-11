import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  id: number;
  username: string;
  email: string;
  gamesWon: number;
  gamesLost: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: {
    type: string;
    value: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://192.168.253.190:3333';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'auth_token';
  private userKey = 'currentUser';
  private lastToken: string | null = null;
  private tokenWatchTimerId: any = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.cleanupOldTokens();
    this.validateSession();
    this.startTokenWatch();

    // Detectar cambios en otras pestañas/ventanas
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === this.tokenKey) {
        this.handleTokenChange(event.newValue);
      }
    });
  }

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    const url = `${this.apiUrl}/auth/register`;
    return this.http.post<AuthResponse>(url, {
      username,
      email,
      password
    });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const url = `${this.apiUrl}/auth/login`;
    
    return this.http.post<AuthResponse>(url, { email, password }).pipe(
      map(response => {
        if (response.success && response.user && response.token) {
          // Guardar token y usuario en localStorage
          localStorage.setItem(this.tokenKey, response.token.value);
          localStorage.setItem(this.userKey, JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          this.lastToken = response.token.value;
        }
        return response;
      })
    );
  }

  logout(): Observable<any> {
    const token = this.getToken();
    
    if (!token) {
      // Si no hay token, simplemente limpiar y redirigir
      this.clearSession();
      return new Observable(observer => {
        observer.next({ success: true });
        observer.complete();
      });
    }

    // Si hay token, hacer logout en el servidor
    const url = `${this.apiUrl}/auth/logout`;
    
    return this.http.post<any>(url, {}).pipe(
      map(response => {
        this.clearSession();
        return response;
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Obtiene el token de autenticación
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Verifica si el token tiene formato válido
   */
  private isValidToken(token: string | null): boolean {
    return token !== null && token.startsWith('oat_');
  }

  /**
   * Verifica si la sesión es válida
   */
  validateSession(): boolean {
    const token = this.getToken();
    const savedUser = localStorage.getItem(this.userKey);
    
    if (!token || !savedUser) {
      this.clearSession();
      return false;
    }

    if (!this.isValidToken(token)) {
      this.clearSession();
      return false;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      
      // Validar estructura básica del usuario guardado
      if (this.isValidUserStructure(parsedUser)) {
        this.currentUserSubject.next(parsedUser);
        return true;
      } else {
        this.clearSession();
        return false;
      }
    } catch (error) {
      this.clearSession();
      return false;
    }
  }

  /**
   * Verifica la validez del token con el servidor
   * Útil para detectar modificaciones manuales del token
   */
  checkTokenValidity(): Observable<boolean> {
    const token = this.getToken();
    
    if (!token || !this.isValidToken(token)) {
      this.clearSession();
      return new Observable<boolean>(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    // Hacer una petición al perfil para validar el token
    const url = `${this.apiUrl}/auth/profile`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response.success && response.user) {
          // Token válido, actualizar usuario si es necesario
          this.currentUserSubject.next(response.user);
          localStorage.setItem(this.userKey, JSON.stringify(response.user));
          return true;
        } else {
          // Token inválido
          this.clearSession();
          return false;
        }
      }),
      // En caso de error HTTP (401, 403, etc.) considerarlo como token inválido
      catchError((error: any) => {
        console.log('Token inválido detectado:', error.status);
        this.clearSession();
        return new Observable<boolean>(observer => {
          observer.next(false);
          observer.complete();
        });
      })
    );
  }

  /**
   * Limpia tokens antiguos de otros sistemas
   */
  private cleanupOldTokens(): void {
    // Limpiar tokens antiguos
    localStorage.removeItem('blackjack_token');
    localStorage.removeItem('playerId');
    localStorage.removeItem('playerName');
    
    // Limpiar tokens JWT de otros sistemas que empiecen con 'accessToken'
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('accessToken') && key !== this.tokenKey) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Limpia la sesión local
   */
  private clearSession(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.lastToken = null;
    this.router.navigate(['/auth']);
  }

  /**
   * Verifica que el usuario tenga la estructura correcta
   */
  private isValidUserStructure(user: any): boolean {
    return (
      user &&
      typeof user.id === 'number' &&
      typeof user.username === 'string' &&
      typeof user.email === 'string' &&
      user.username.length > 0 &&
      user.email.includes('@') &&
      (user.gamesWon === undefined || typeof user.gamesWon === 'number') &&
      (user.gamesLost === undefined || typeof user.gamesLost === 'number')
    );
  }

  /**
   * Inicia un watcher para detectar cambios locales en el token
   */
  private startTokenWatch(): void {
    this.lastToken = this.getToken();
    if (this.tokenWatchTimerId) {
      clearInterval(this.tokenWatchTimerId);
    }
    this.tokenWatchTimerId = setInterval(() => {
      const currentToken = this.getToken();
      if (currentToken !== this.lastToken) {
        this.handleTokenChange(currentToken);
      }
    }, 1000);
  }

  /**
   * Maneja un cambio de token: si es inválido o diferente al previo, cerrar sesión
   */
  private handleTokenChange(newToken: string | null): void {
    const previousToken = this.lastToken;
    this.lastToken = newToken;

    // Si se eliminó o es inválido, cerrar sesión
    if (!newToken || !this.isValidToken(newToken)) {
      this.clearSession();
      return;
    }

    // Si cambió respecto al anterior (manipulación), cerrar sesión
    if (previousToken !== null && newToken !== previousToken) {
      this.clearSession();
    }
  }

  /**
   * Detiene el watcher del token
   */
  private stopTokenWatch(): void {
    if (this.tokenWatchTimerId) {
      clearInterval(this.tokenWatchTimerId);
      this.tokenWatchTimerId = null;
    }
  }
} 