import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService, User } from '../../services/auth.service';
import { GameService, Game, GameStats } from '../../services/game.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="row bg-primary text-white p-3">
        <div class="col-md-8">
          <h2>🚢 Juego Naval</h2>
          <p class="mb-0">Bienvenido, {{ currentUser?.username }}</p>
        </div>
        <div class="col-md-4 text-end">
          <button class="btn btn-outline-light me-2" (click)="showStats()">
            📊 Estadísticas
          </button>
          <button class="btn btn-outline-light" (click)="logout()">
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>

      <div class="row mt-4">
        <!-- Sidebar -->
        <div class="col-md-3">
          <div class="card">
            <div class="card-header">
              <h5>Menú</h5>
            </div>
            <div class="card-body">
              <div class="list-group">
                <button class="list-group-item list-group-item-action" 
                        [class.active]="activeSection === 'games'"
                        (click)="setActiveSection('games')">
                  🎮 Juegos Disponibles
                </button>
                <button class="list-group-item list-group-item-action" 
                        [class.active]="activeSection === 'create'"
                        (click)="setActiveSection('create')">
                  ➕ Crear Juego
                </button>
                <button class="list-group-item list-group-item-action" 
                        [class.active]="activeSection === 'active'"
                        (click)="setActiveSection('active')">
                  ⚡ Juegos Activos
                </button>
              </div>
            </div>
          </div>

          <!-- Estadísticas Rápidas -->
          <div class="card mt-3">
            <div class="card-header">
              <h6>📈 Estadísticas Rápidas</h6>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-6">
                  <div class="text-success">
                    <h4>{{ stats?.wonGames || 0 }}</h4>
                    <small>Ganados</small>
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-danger">
                    <h4>{{ stats?.lostGames || 0 }}</h4>
                    <small>Perdidos</small>
                  </div>
                </div>
              </div>
              <div class="mt-2">
                <canvas #statsChart width="200" height="100"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-9">
          <!-- Juegos Disponibles -->
          <div *ngIf="activeSection === 'games'">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5>🎮 Juegos Disponibles</h5>
                <button class="btn btn-primary btn-sm" (click)="refreshGames()">
                  🔄 Actualizar
                </button>
              </div>
              <div class="card-body">
                <div *ngIf="loading" class="text-center">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Cargando...</span>
                  </div>
                </div>
                
                <div *ngIf="!loading && games.length === 0" class="text-center">
                  <p>No hay juegos disponibles</p>
                  <button class="btn btn-primary" (click)="setActiveSection('create')">
                    Crear un nuevo juego
                  </button>
                </div>

                <div *ngIf="!loading && games.length > 0" class="row">
                  <div *ngFor="let game of games" class="col-md-6 mb-3">
                    <div class="card h-100">
                      <div class="card-body">
                        <h6 class="card-title">{{ game.name }}</h6>
                        <p class="card-text">
                          <small class="text-muted">
                            Creado por: {{ game.creator }}<br>
                            Jugadores: {{ game.playerCount }}/2<br>
                            Estado: {{ getStatusText(game.status) }}
                          </small>
                        </p>
                        <button class="btn btn-success btn-sm" 
                                [disabled]="game.playerCount >= 2"
                                (click)="joinGame(game.id)">
                          {{ game.playerCount >= 2 ? 'Lleno' : 'Unirse' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Crear Juego -->
          <div *ngIf="activeSection === 'create'">
            <div class="card">
              <div class="card-header">
                <h5>➕ Crear Nuevo Juego</h5>
              </div>
              <div class="card-body">
                <form (ngSubmit)="createGame()" #createForm="ngForm">
                  <div class="mb-3">
                    <label for="gameName" class="form-label">Nombre del Juego</label>
                    <input type="text" class="form-control" id="gameName" 
                           [(ngModel)]="newGameName" name="gameName" required>
                  </div>
                  <button type="submit" class="btn btn-primary" [disabled]="creating">
                    {{ creating ? 'Creando...' : 'Crear Juego' }}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <!-- Juegos Activos -->
          <div *ngIf="activeSection === 'active'">
            <div class="card">
              <div class="card-header">
                <h5>⚡ Juegos Activos</h5>
              </div>
              <div class="card-body">
                <div *ngIf="activeGames.length === 0" class="text-center">
                  <p>No tienes juegos activos</p>
                </div>
                <div *ngFor="let game of activeGames" class="mb-3">
                  <div class="card">
                    <div class="card-body">
                      <h6>{{ game.name }}</h6>
                      <p>Estado: {{ game.status }}</p>
                      <button class="btn btn-primary" (click)="continueGame(game.id)">
                        Continuar Juego
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Estadísticas -->
    <div class="modal fade" id="statsModal" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">📊 Estadísticas Detalladas</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div *ngIf="stats">
              <!-- Resumen General -->
              <div class="row mb-4">
                <div class="col-md-3 text-center">
                  <div class="card bg-primary text-white">
                    <div class="card-body">
                      <h3>{{ stats.totalGames }}</h3>
                      <p class="mb-0">Total Juegos</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 text-center">
                  <div class="card bg-success text-white">
                    <div class="card-body">
                      <h3>{{ stats.wonGames }}</h3>
                      <p class="mb-0">Ganados</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 text-center">
                  <div class="card bg-danger text-white">
                    <div class="card-body">
                      <h3>{{ stats.lostGames }}</h3>
                      <p class="mb-0">Perdidos</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 text-center">
                  <div class="card bg-info text-white">
                    <div class="card-body">
                      <h3>{{ getWinRate() }}%</h3>
                      <p class="mb-0">% Victoria</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Gráfica -->
              <div class="row mb-4">
                <div class="col-12">
                  <div class="card">
                    <div class="card-header">
                      <h6>📈 Distribución de Resultados</h6>
                    </div>
                    <div class="card-body">
                      <canvas id="statsChart" width="400" height="200"></canvas>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tablas de Juegos -->
              <div class="row">
                <div class="col-md-6">
                  <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                      <h6 class="mb-0">🏆 Juegos Ganados ({{ stats.wonGames }})</h6>
                      <button class="btn btn-sm btn-outline-success" (click)="showWonGamesDetails()">
                        Ver Detalles
                      </button>
                    </div>
                    <div class="card-body">
                      <div *ngFor="let game of stats.wonGamesList.slice(0, 3)" class="mb-2">
                        <div class="d-flex justify-content-between align-items-center">
                          <span>{{ game.name }}</span>
                          <small class="text-muted">vs {{ game.opponent }}</small>
                        </div>
                        <small class="text-muted">{{ game.createdAt | date:'short' }}</small>
                      </div>
                      <div *ngIf="stats.wonGamesList.length === 0" class="text-center text-muted">
                        <p>No hay juegos ganados</p>
                      </div>
                      <div *ngIf="stats.wonGamesList.length > 3" class="text-center">
                        <small class="text-muted">Y {{ stats.wonGamesList.length - 3 }} más...</small>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                      <h6 class="mb-0">😔 Juegos Perdidos ({{ stats.lostGames }})</h6>
                      <button class="btn btn-sm btn-outline-danger" (click)="showLostGamesDetails()">
                        Ver Detalles
                      </button>
                    </div>
                    <div class="card-body">
                      <div *ngFor="let game of stats.lostGamesList.slice(0, 3)" class="mb-2">
                        <div class="d-flex justify-content-between align-items-center">
                          <span>{{ game.name }}</span>
                          <small class="text-muted">vs {{ game.opponent }}</small>
                        </div>
                        <small class="text-muted">{{ game.createdAt | date:'short' }}</small>
                      </div>
                      <div *ngIf="stats.lostGamesList.length === 0" class="text-center text-muted">
                        <p>No hay juegos perdidos</p>
                      </div>
                      <div *ngIf="stats.lostGamesList.length > 3" class="text-center">
                        <small class="text-muted">Y {{ stats.lostGamesList.length - 3 }} más...</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalles de Juegos -->
    <div class="modal fade" id="gameDetailsModal" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ gameDetailsTitle }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div *ngIf="gameDetailsList.length > 0">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Juego</th>
                      <th>Oponente</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let game of gameDetailsList">
                      <td>{{ game.name }}</td>
                      <td>{{ game.opponent }}</td>
                      <td>{{ game.createdAt | date:'short' }}</td>
                      <td>
                        <button class="btn btn-sm btn-primary" (click)="viewGameBoard(game.id)">
                          👁️ Ver Tablero
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Tablero Final -->
    <div class="modal fade" id="boardModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">🎯 Tablero Final - {{ selectedGame?.name }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
                         <div *ngIf="selectedGame && gameBoardState">
               <div class="row">
                 <div class="col-md-6">
                   <h6>Tablero de {{ gameBoardState.player1Username }}</h6>
                   <div class="board-container">
                     <div class="board-row" *ngFor="let row of gameBoardState.player1Board; let i = index">
                       <div class="board-cell" 
                            *ngFor="let cell of row; let j = index"
                            [class.hit]="cell === 'hit'"
                            [class.miss]="cell === 'miss'"
                            [class.ship]="cell === 'ship'">
                         {{ getCellDisplay(cell) }}
                       </div>
                     </div>
                   </div>
                 </div>
                 <div class="col-md-6">
                   <h6>Tablero de {{ gameBoardState.player2Username }}</h6>
                   <div class="board-container">
                     <div class="board-row" *ngFor="let row of gameBoardState.player2Board; let i = index">
                       <div class="board-cell" 
                            *ngFor="let cell of row; let j = index"
                            [class.hit]="cell === 'hit'"
                            [class.miss]="cell === 'miss'"
                            [class.ship]="cell === 'ship'">
                         {{ getCellDisplay(cell) }}
                       </div>
                     </div>
                   </div>
                 </div>
                              </div>
               
               <!-- Leyenda -->
               <div class="row mt-3">
                 <div class="col-12">
                   <div class="card">
                     <div class="card-header">
                       <h6>📋 Leyenda</h6>
                     </div>
                     <div class="card-body">
                       <div class="row text-center">
                         <div class="col-md-3">
                           <span class="badge bg-success p-2">🚢</span>
                           <small class="d-block">Barco</small>
                         </div>
                         <div class="col-md-3">
                           <span class="badge bg-danger p-2">🎯</span>
                           <small class="d-block">Impacto</small>
                         </div>
                         <div class="col-md-3">
                           <span class="badge bg-secondary p-2">💧</span>
                           <small class="d-block">Agua</small>
                         </div>
                         <div class="col-md-3">
                           <span class="badge bg-info p-2">🌊</span>
                           <small class="d-block">Mar</small>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
               
               <!-- Movimientos -->
               <div class="mt-4">
                <h6>📋 Historial de Movimientos</h6>
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Jugador</th>
                        <th>Posición</th>
                        <th>Resultado</th>
                        <th>Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let move of gameMoves">
                        <td>{{ move.player }}</td>
                        <td>{{ move.position }}</td>
                        <td>
                          <span [class]="move.hit ? 'text-success' : 'text-muted'">
                            {{ move.hit ? '🎯 Impacto' : '💧 Agua' }}
                          </span>
                        </td>
                        <td>{{ move.createdAt | date:'short' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .list-group-item.active {
      background-color: #007bff;
      border-color: #007bff;
    }
    
    .card {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .stats-chart {
      max-height: 150px;
    }

    .board-container {
      display: inline-block;
      border: 2px solid #333;
      background-color: #f8f9fa;
      margin: 10px;
    }

    .board-row {
      display: flex;
    }

    .board-cell {
      width: 35px;
      height: 35px;
      border: 1px solid #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      cursor: default;
      background-color: #e9ecef;
    }

    .board-cell.hit {
      background-color: #dc3545;
      color: white;
      border-color: #c82333;
    }

    .board-cell.miss {
      background-color: #6c757d;
      color: white;
      border-color: #545b62;
    }

    .board-cell.ship {
      background-color: #28a745;
      color: white;
      border-color: #1e7e34;
    }

    .board-cell.water {
      background-color: #17a2b8;
      color: white;
      border-color: #138496;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  activeSection: 'games' | 'create' | 'active' = 'games';
  games: Game[] = [];
  activeGames: Game[] = [];
  stats: GameStats | null = null;
  loading = false;
  creating = false;
  newGameName = '';
  gameDetailsTitle = '';
  gameDetailsList: any[] = [];
  selectedGame: any = null;
  gameBoardState: any = null;
  gameMoves: any[] = [];
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private gameService: GameService,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/auth']);
      return;
    }

    this.loadGames();
    this.loadStats();
    this.setupPolling();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setActiveSection(section: 'games' | 'create' | 'active'): void {
    this.activeSection = section;
    if (section === 'games') {
      this.loadGames();
    }
  }

  loadGames(): void {
    this.loading = true;
    this.gameService.getGames().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.games = response.games;
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading games:', error);
      }
    });
  }

  loadStats(): void {
    console.log('loadStats() called, currentUser:', this.currentUser);
    if (!this.currentUser) return;
    
    console.log('Calling getUserStats for userId:', this.currentUser.id);
    this.gameService.getUserStats(this.currentUser.id).subscribe({
      next: (response) => {
        console.log('Stats response:', response);
        if (response.success) {
          this.stats = response.stats;
          console.log('Stats loaded:', this.stats);
        }
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  createGame(): void {
    if (!this.currentUser || !this.newGameName.trim()) return;
    
    this.creating = true;
    this.gameService.createGame(this.newGameName, this.currentUser.id).subscribe({
      next: (response) => {
        this.creating = false;
        if (response.success) {
          this.newGameName = '';
          this.setActiveSection('games');
          this.loadGames();
        }
      },
      error: (error) => {
        this.creating = false;
        console.error('Error creating game:', error);
      }
    });
  }

  joinGame(gameId: number): void {
    if (!this.currentUser) return;
    
    this.gameService.joinGame(gameId, this.currentUser.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/game', gameId]);
        }
      },
      error: (error) => {
        console.error('Error joining game:', error);
      }
    });
  }

  continueGame(gameId: number): void {
    this.router.navigate(['/game', gameId]);
  }

  refreshGames(): void {
    this.loadGames();
  }

  showStats(): void {
    console.log('showStats() called');
    this.loadStats();
    // Abrir modal de estadísticas usando Bootstrap
    const modal = document.getElementById('statsModal');
    console.log('Modal element:', modal);
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      console.log('Bootstrap modal instance:', bootstrapModal);
      bootstrapModal.show();
      // Crear gráfica después de que el modal se abra
      setTimeout(() => this.createStatsChart(), 100);
    } else {
      console.error('Modal element not found');
    }
  }

  getWinRate(): number {
    if (!this.stats || this.stats.totalGames === 0) return 0;
    return Math.round((this.stats.wonGames / this.stats.totalGames) * 100);
  }

  createStatsChart(): void {
    if (!this.stats) return;

    const ctx = document.getElementById('statsChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Limpiar canvas anterior
    const existingChart = (window as any).statsChart;
    if (existingChart) {
      existingChart.destroy();
    }

    (window as any).statsChart = new (window as any).Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Ganados', 'Perdidos'],
        datasets: [{
          data: [this.stats.wonGames, this.stats.lostGames],
          backgroundColor: ['#28a745', '#dc3545'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  showWonGamesDetails(): void {
    this.gameDetailsTitle = '🏆 Juegos Ganados';
    this.gameDetailsList = this.stats?.wonGamesList || [];
    this.openGameDetailsModal();
  }

  showLostGamesDetails(): void {
    this.gameDetailsTitle = '😔 Juegos Perdidos';
    this.gameDetailsList = this.stats?.lostGamesList || [];
    this.openGameDetailsModal();
  }

  openGameDetailsModal(): void {
    const modal = document.getElementById('gameDetailsModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  viewGameBoard(gameId: number): void {
    this.gameService.getGameDetails(gameId).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedGame = response.game;
          this.gameBoardState = response.game.finalBoardState;
          this.gameMoves = response.game.moves || [];
          this.openBoardModal();
        }
      },
      error: (error) => {
        console.error('Error loading game details:', error);
      }
    });
  }

  loadGameMoves(gameId: number): void {
    this.gameService.getGameMoves(gameId).subscribe({
      next: (response) => {
        if (response.success) {
          this.gameMoves = response.moves;
        }
      },
      error: (error) => {
        console.error('Error loading game moves:', error);
      }
    });
  }

  openBoardModal(): void {
    const modal = document.getElementById('boardModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  getCellDisplay(cell: string): string {
    switch (cell) {
      case 'hit': return '🎯';
      case 'miss': return '💧';
      case 'ship': return '🚢';
      case 'water': return '';
      default: return '';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'waiting': return 'Esperando jugadores';
      case 'active': return 'En progreso';
      case 'finished': return 'Terminado';
      default: return status;
    }
  }

  private setupPolling(): void {
    // Polling para actualizar la lista de juegos cada 5 segundos
    const gamesPolling = this.gameService.pollNewGames(5000).subscribe({
      next: (response) => {
        if (response.success && this.activeSection === 'games') {
          this.games = response.games;
        }
      }
    });
    
    this.subscriptions.push(gamesPolling);
  }
} 