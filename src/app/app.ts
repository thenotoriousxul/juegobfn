import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService, User } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected title = 'Juego Naval';
  protected currentUser: User | null = null;
  protected isAuthenticated = false;
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios en el usuario actual
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = user !== null;
      
      // Si el usuario se vuelve null y estamos en una ruta protegida, 
      // ya el AuthService se encarga de la redirección
      if (!user) {
        console.log('Usuario deslogueado, ocultando componentes protegidos');
      }
    });

    // Verificar sesión al inicializar
    this.authService.validateSession();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
