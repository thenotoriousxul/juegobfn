import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbAlert],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <ul class="nav nav-tabs card-header-tabs" id="authTabs" role="tablist">
                <li class="nav-item" role="presentation">
                  <button class="nav-link" [class.active]="activeTab === 'login'" 
                          (click)="setActiveTab('login')" type="button">
                    Iniciar Sesión
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" [class.active]="activeTab === 'register'" 
                          (click)="setActiveTab('register')" type="button">
                    Registrarse
                  </button>
                </li>
              </ul>
            </div>
            <div class="card-body">
              <!-- Login Form -->
              <div *ngIf="activeTab === 'login'">
                <h5 class="card-title">Iniciar Sesión</h5>
                <form (ngSubmit)="onLogin()" #loginForm="ngForm">
                  <div class="mb-3">
                    <label for="loginEmail" class="form-label">Email</label>
                    <input type="email" class="form-control" id="loginEmail" 
                           [(ngModel)]="loginData.email" name="email" required>
                  </div>
                  <div class="mb-3">
                    <label for="loginPassword" class="form-label">Contraseña</label>
                    <input type="password" class="form-control" id="loginPassword" 
                           [(ngModel)]="loginData.password" name="password" required>
                  </div>
                  <button type="submit" class="btn btn-primary" [disabled]="loading">
                    {{ loading ? 'Iniciando...' : 'Iniciar Sesión' }}
                  </button>
                </form>
              </div>

              <!-- Register Form -->
              <div *ngIf="activeTab === 'register'">
                <h5 class="card-title">Registrarse</h5>
                <form (ngSubmit)="onRegister()" #registerForm="ngForm">
                  <div class="mb-3">
                    <label for="registerUsername" class="form-label">Nombre de Usuario</label>
                    <input type="text" class="form-control" id="registerUsername" 
                           [(ngModel)]="registerData.username" name="username" required>
                  </div>
                  <div class="mb-3">
                    <label for="registerEmail" class="form-label">Email</label>
                    <input type="email" class="form-control" id="registerEmail" 
                           [(ngModel)]="registerData.email" name="email" required>
                  </div>
                  <div class="mb-3">
                    <label for="registerPassword" class="form-label">Contraseña</label>
                    <input type="password" class="form-control" id="registerPassword" 
                           [(ngModel)]="registerData.password" name="password" required>
                  </div>
                  <button type="submit" class="btn btn-success" [disabled]="loading">
                    {{ loading ? 'Registrando...' : 'Registrarse' }}
                  </button>
                </form>
              </div>

              <!-- Alert Messages -->
              <div *ngIf="message" class="mt-3">
                <ngb-alert [type]="messageType" (closed)="message = ''">
                  {{ message }}
                </ngb-alert>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .nav-tabs .nav-link {
      color: #6c757d;
    }
    .nav-tabs .nav-link.active {
      color: #495057;
      font-weight: 500;
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
    this.authService.login(this.loginData.email, this.loginData.password).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.message = response.message;
          this.messageType = 'success';
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        } else {
          this.message = response.message;
          this.messageType = 'danger';
        }
      },
      error: (error) => {
        this.loading = false;
        this.message = 'Error al iniciar sesión';
        this.messageType = 'danger';
      }
    });
  }

  onRegister(): void {
    this.loading = true;
    this.authService.register(
      this.registerData.username,
      this.registerData.email,
      this.registerData.password
    ).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.message = response.message;
          this.messageType = 'success';
          // Cambiar a login después del registro exitoso
          setTimeout(() => {
            this.activeTab = 'login';
            this.message = '';
          }, 2000);
        } else {
          this.message = response.message;
          this.messageType = 'danger';
        }
      },
      error: (error) => {
        this.loading = false;
        this.message = 'Error al registrar usuario';
        this.messageType = 'danger';
      }
    });
  }
} 