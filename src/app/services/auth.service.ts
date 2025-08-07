import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { StorageMonitorService } from './storage-monitor.service';

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
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://192.168.118.120:3333';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private originalUserHash: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageMonitor: StorageMonitorService
  ) {
    // Recuperar usuario del localStorage al inicializar
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        
        // Validar estructura básica del usuario guardado
        if (this.isValidUserStructure(parsedUser)) {
          // Generar hash para la sesión actual basado en el usuario guardado
          this.originalUserHash = this.generateUserHash(parsedUser);
          this.currentUserSubject.next(parsedUser);
        } else {
          console.log('Usuario guardado tiene estructura inválida, limpiando...');
          localStorage.removeItem('currentUser');
        }
      } catch (error) {
        console.log('Error al parsear usuario guardado, limpiando localStorage...');
        localStorage.removeItem('currentUser');
      }
    }

    // Escuchar cambios en localStorage
    this.storageMonitor.storageChanges$.subscribe(change => {
      if (change && change.key === 'currentUser') {
        if (change.newValue === null && change.oldValue !== null) {
          // Usuario fue eliminado del localStorage
          this.handleUserRemoval();
        } else if (change.newValue) {
          // Verificar si el usuario fue modificado maliciosamente
          if (!this.validateUserIntegrity(change.newValue)) {
            console.log('Datos de usuario manipulados detectados, cerrando sesión...');
            this.handleUserRemoval();
          } else {
            // Usuario fue actualizado legítimamente
            this.currentUserSubject.next(change.newValue);
          }
        }
      }
    });
  }

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    const url = `${this.apiUrl}/auth/register`;
    console.log('Register URL:', url);
    console.log('Register data:', { username, email, password: '***' });
    return this.http.post<AuthResponse>(url, {
      username,
      email,
      password
    });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const url = `${this.apiUrl}/auth/login`;
    console.log('Login URL:', url);
    console.log('Login data:', { email, password: '***' });
    return this.http.post<AuthResponse>(url, {
      email,
      password
    }).pipe(
      map(response => {
        if (response.success && response.user) {
          // Generar hash del usuario original
          this.originalUserHash = this.generateUserHash(response.user);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
        return response;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.originalUserHash = null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Maneja cuando el usuario es eliminado del localStorage
   */
  private handleUserRemoval(): void {
    console.log('Usuario eliminado del localStorage, redirigiendo al login...');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth']);
  }

  /**
   * Verifica si la sesión es válida comparando con localStorage
   */
  validateSession(): boolean {
    const currentUser = this.getCurrentUser();
    const savedUser = localStorage.getItem('currentUser');
    
    if (currentUser && !savedUser) {
      // El usuario está en memoria pero no en localStorage
      this.handleUserRemoval();
      return false;
    }
    
    if (!currentUser && savedUser) {
      // El usuario está en localStorage pero no en memoria
      try {
        const parsedUser = JSON.parse(savedUser);
        
        // Validar integridad del usuario guardado
        if (!this.validateUserIntegrity(parsedUser)) {
          console.log('Usuario en localStorage fue manipulado, cerrando sesión...');
          this.handleUserRemoval();
          return false;
        }
        
        this.currentUserSubject.next(parsedUser);
        return true;
      } catch (error) {
        // localStorage contiene datos inválidos
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth']);
        return false;
      }
    }

    // Si hay usuario en memoria, verificar también su integridad
    if (currentUser) {
      const savedUserStr = localStorage.getItem('currentUser');
      if (savedUserStr) {
        try {
          const parsedUser = JSON.parse(savedUserStr);
          if (!this.validateUserIntegrity(parsedUser)) {
            this.handleUserRemoval();
            return false;
          }
        } catch (error) {
          this.handleUserRemoval();
          return false;
        }
      }
    }

    return currentUser !== null;
  }

  /**
   * Genera un hash simple del usuario para validar integridad
   */
  private generateUserHash(user: User): string {
    const userString = `${user.id}-${user.username}-${user.email}`;
    let hash = 0;
    for (let i = 0; i < userString.length; i++) {
      const char = userString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  /**
   * Valida si los datos del usuario no han sido manipulados
   */
  private validateUserIntegrity(user: User): boolean {
    if (!user || !user.id || !user.username || !user.email) {
      return false;
    }

    // Verificar estructura básica
    if (!this.isValidUserStructure(user)) {
      return false;
    }

    // Si no tenemos hash original (primera carga), verificar contra servidor
    if (!this.originalUserHash) {
      // Para casos de recarga de página, verificamos contra el servidor
      this.verifyUserWithServer(user);
      return true; // Permitimos temporalmente mientras verificamos
    }

    // Verificar que el hash coincida con el original
    const currentHash = this.generateUserHash(user);
    if (currentHash !== this.originalUserHash) {
      console.log('Hash no coincide:', {
        original: this.originalUserHash,
        current: currentHash,
        user: user
      });
      return false;
    }

    return true;
  }

  /**
   * Verifica el usuario contra el servidor
   */
  private verifyUserWithServer(user: User): void {
    const url = `${this.apiUrl}/auth/profile/${user.id}`;
    
    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (!response.success || !response.user) {
          console.log('Usuario no válido en servidor, cerrando sesión...');
          this.handleUserRemoval();
        } else {
          // Actualizar hash con datos del servidor
          this.originalUserHash = this.generateUserHash(response.user);
          
          // Verificar si los datos locales coinciden con los del servidor
          const localHash = this.generateUserHash(user);
          const serverHash = this.generateUserHash(response.user);
          
          if (localHash !== serverHash) {
            console.log('Datos locales no coinciden con servidor, cerrando sesión...');
            this.handleUserRemoval();
          }
        }
      },
      error: (error) => {
        console.error('Error verificando usuario con servidor:', error);
        // En caso de error de red, mantener la sesión pero marcar como no verificada
        // Podrías decidir cerrar la sesión aquí si prefieres ser más estricto
      }
    });
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
} 