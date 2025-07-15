import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative">

  <div class="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0">
    
    <!-- Panel izquierdo - Bandera Pirata -->
    <div class="hidden lg:flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-red-900 rounded-l-2xl relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-red-900/90 to-black/50"></div>
      
      <!-- Bandera principal -->
      <div class="relative z-10 text-center">
        <div class="mb-8 relative">
          <div class="text-8xl mb-4 animate-pulse">🏴‍☠️</div>
          <div class="w-32 h-1 bg-red-500 mx-auto rounded-full"></div>
        </div>
        
        <h1 class="text-4xl font-bold text-white mb-2 tracking-wide">
          Batalla Naval
        </h1>
        <p class="text-red-200 text-lg font-medium mb-8">
          Reglas del juego
        </p>
        
        <!-- Reglas del juego -->
        <div class="space-y-4 text-red-300">
          <div class="flex items-center justify-center gap-4">
            <span class="text-2xl">🚢</span>
            <span class="text-sm">Coloca tus barcos estratégicamente</span>
          </div>
          <div class="flex items-center justify-center gap-4">
            <span class="text-2xl">🎯</span>
            <span class="text-sm">Adivina la posición del enemigo</span>
          </div>
          <div class="flex items-center justify-center gap-4">
            <span class="text-2xl">💥</span>
            <span class="text-sm">Hunde todos los barcos para ganar</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel derecho - Formulario -->
    <div class="bg-gray-800/50 backdrop-blur-sm rounded-r-2xl lg:rounded-l-none rounded-2xl p-8 border border-gray-700/50">
      
      <!-- Tabs -->
      <div class="flex bg-transparent rounded-none p-0 mb-8 gap-2 border-b border-gray-600">
          <button 
          class="flex-1 py-2 px-1 bg-transparent shadow-none rounded-none text-lg font-semibold transition-all duration-200 border-b-4"
          [class]="activeTab === 'login' ? 'border-red-500 text-red-300' : 'border-transparent text-gray-400 hover:text-white'"
            (click)="setActiveTab('login')" 
            type="button">
          Iniciar Sesión
          </button>
          <button 
          class="flex-1 py-2 px-1 bg-transparent shadow-none rounded-none text-lg font-semibold transition-all duration-200 border-b-4"
          [class]="activeTab === 'register' ? 'border-red-500 text-red-300' : 'border-transparent text-gray-400 hover:text-white'"
            (click)="setActiveTab('register')" 
            type="button">
          Registrarse
          </button>
      </div>

      <!-- Formulario de Login -->
      <div *ngIf="activeTab === 'login'" class="space-y-6">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-white mb-2">Bienvenido de vuelta</h2>
          <p class="text-gray-400">Ingresa tus credenciales para continuar</p>
        </div>
        
        <!-- Mensajes -->
        <div *ngIf="message" class="mb-4">
          <div class="p-4 rounded-lg border"
               [class]="messageType === 'success' ? 'bg-green-900/50 border-green-500/50 text-green-300' : 'bg-red-900/50 border-red-500/50 text-red-300'">
            <div class="flex items-center">
              <span class="mr-2">{{ messageType === 'success' ? '✓' : '✗' }}</span>
              <span class="text-sm">{{ message }}</span>
            </div>
        </div>
      </div>

          <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-300">Email</label>
            <input 
              type="email" 
              [(ngModel)]="loginData.email" 
              name="email" 
              required
              class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              placeholder="tu@email.com">
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-300">Contraseña</label>
            <input 
              type="password" 
              [(ngModel)]="loginData.password" 
              name="password" 
              required
              class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              placeholder="Tu contraseña">
          </div>
          
          <button 
            type="submit" 
            [disabled]="loading"
            class="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-full font-medium hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
            <span *ngIf="!loading">Ingresar</span>
            <span *ngIf="loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Ingresando...
            </span>
            </button>
          </form>
        </div>

      <!-- Formulario de Registro -->
      <div *ngIf="activeTab === 'register'" class="space-y-6">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-white mb-2">Crear cuenta</h2>
          <p class="text-gray-400">Únete a la aventura pirata</p>
        </div>

        <!-- Mensajes -->
        <div *ngIf="message" class="mb-4">
          <div class="p-4 rounded-lg border"
               [class]="messageType === 'success' ? 'bg-green-900/50 border-green-500/50 text-green-300' : 'bg-red-900/50 border-red-500/50 text-red-300'">
            <div class="flex items-center">
              <span class="mr-2">{{ messageType === 'success' ? '✓' : '✗' }}</span>
              <span class="text-sm">{{ message }}</span>
            </div>
          </div>
        </div>
        
        <form (ngSubmit)="onRegister()" #registerForm="ngForm" class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-300">Nombre de usuario</label>
            <input 
              type="text" 
              [(ngModel)]="registerData.username" 
              name="username" 
              required
              class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              placeholder="Tu nombre de pirata">
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-300">Email</label>
            <input 
              type="email" 
              [(ngModel)]="registerData.email" 
              name="email" 
              required
              class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              placeholder="tu@email.com">
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-300">Contraseña</label>
            <input 
              type="password" 
              [(ngModel)]="registerData.password" 
              name="password" 
              required
              class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              placeholder="Crea tu contraseña">
          </div>
          
          <button 
            type="submit" 
            [disabled]="loading"
            class="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-full font-medium hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
            <span *ngIf="!loading">Crear cuenta</span>
            <span *ngIf="loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registrando...
            </span>
          </button>
        </form>
      </div>
    </div>
  </div>
</div>
`,
  styles: [`
/* Estilos personalizados mínimos */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:host {
  font-family: 'Inter', sans-serif;
}

/* Animaciones suaves */
.transition-all {
  transition: all 0.2s ease-in-out;
}

/* Efectos de glassmorphism */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}
`]
})
export class AuthComponent {
  activeTab: 'login' | 'register' = 'login';
  loading = false;
  message = '';
  messageType: 'success' | 'danger' = 'success';

  loginData = {
    email: '',
    password: ''
  };

  registerData = {
    username: '',
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  setActiveTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.message = '';
  }

  onLogin(): void {
    this.loading = true;
    this.message = '';
    
    this.authService.login(this.loginData.email, this.loginData.password).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.message = 'Inicio de sesión exitoso';
          this.messageType = 'success';
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        } else {
          this.message = response.message || 'Credenciales incorrectas';
          this.messageType = 'danger';
        }
      },
      error: () => {
        this.loading = false;
        this.message = 'Error al iniciar sesión';
        this.messageType = 'danger';
      }
    });
  }

  onRegister(): void {
    this.loading = true;
    this.message = '';
    
    this.authService.register(
      this.registerData.username,
      this.registerData.email,
      this.registerData.password
    ).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.message = 'Cuenta creada exitosamente. Puedes iniciar sesión ahora.';
          this.messageType = 'success';
          setTimeout(() => {
            this.activeTab = 'login';
            this.message = '';
            this.registerData = { username: '', email: '', password: '' };
          }, 2000);
        } else {
          this.message = response.message || 'Error al crear la cuenta';
          this.messageType = 'danger';
        }
      },
      error: () => {
        this.loading = false;
        this.message = 'Error al crear la cuenta';
        this.messageType = 'danger';
      }
    });
  }
}
