import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { GameService, GameState, MoveResult } from '../../services/game.service';
import { GameBoardComponent } from '../game-board/game-board.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule, GameBoardComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <!-- Header del Juego -->
      <div class="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 shadow-lg">
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h3 class="text-2xl font-bold mb-2">🎮 {{ gameState?.game?.name || 'Juego Naval' }}</h3>
              <p class="text-gray-300">
                Estado: {{ getGameStatusText() }} | 
                {{ currentUser?.username }} vs {{ gameState?.opponent?.username }}
              </p>
            </div>
            <div class="flex space-x-3 mt-4 md:mt-0">
              <button class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full transition-all duration-200 flex items-center space-x-2" (click)="showGameHistory()">
                <span>📋</span>
                <span>Historial</span>
              </button>
              <button class="bg-white/20 hover:bg-red-700 text-white px-4 py-2 rounded-full transition-all duration-200 flex items-center space-x-2" (click)="abandonarPartida()">
                <span>🚪</span>
                <span>Abandonar partida</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto p-6">
        <!-- Estado del Juego -->
        <div class="mb-6">
          <div [class]="isMyTurn ? 'bg-green-900/60 border-green-400 text-green-200' : 'bg-blue-900/60 border-blue-400 text-blue-200'" 
               class="border rounded-xl p-4 shadow-sm">
            <div class="flex items-center space-x-2">
              <span class="text-lg">{{ isMyTurn ? '🎯' : '⏳' }}</span>
              <div>
                <strong class="text-lg">{{ getTurnMessage() }}</strong>
                <span *ngIf="gameState" class="block text-sm mt-1">
                  Barcos restantes: Tú ({{ gameState.currentPlayer.shipsRemaining }}) - 
                  {{ gameState.opponent.username }} ({{ gameState.opponent.shipsRemaining }})
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tableros -->
        <div *ngIf="gameState" class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
          <!-- Tablero del Jugador -->
          <div class="bg-gray-900/80 rounded-xl shadow-lg p-6">
            <app-game-board
              [board]="gameState.currentPlayer.board"
              [title]="'Tu Tablero - ' + currentUser?.username"
              [isOpponent]="false"
              [disabled]="true">
            </app-game-board>
          </div>

          <!-- Tablero del Oponente -->
          <div class="bg-gray-900/80 rounded-xl shadow-lg p-6">
            <app-game-board
              [board]="gameState.opponent.board"
              [title]="'Tablero de ' + gameState.opponent.username"
              [isOpponent]="true"
              [disabled]="!isMyTurn || gameState.game.status === 'finished'"
              (cellClick)="onOpponentCellClick($event)">
            </app-game-board>
          </div>
        </div>

        <!-- Mensajes de Resultado -->
        <div *ngIf="lastMoveResult" class="mb-6">
          <div [class]="lastMoveResult.hit ? 'bg-green-900/60 border-green-400 text-green-200' : 'bg-blue-900/60 border-blue-400 text-blue-200'" 
               class="border rounded-xl p-4 shadow-sm">
            <div class="flex justify-between items-center">
              <div class="flex items-center space-x-2">
                <span class="text-xl">{{ lastMoveResult.hit ? '🎯' : '💧' }}</span>
                <div>
                  <strong class="text-lg">{{ lastMoveResult.hit ? '¡Impacto!' : 'Agua' }}</strong>
                  <span *ngIf="lastMoveResult.shipDestroyed" class="block text-sm">¡Barco destruido!</span>
                </div>
              </div>
              <button class="text-gray-400 hover:text-white transition-colors" (click)="lastMoveResult = null">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Resultado Final -->
        <div *ngIf="gameState?.game?.status === 'finished'" class="mb-6">
          <div [class]="isWinner ? 'bg-green-900/60 border-green-400 text-green-200' : 'bg-red-900/60 border-red-400 text-red-200'" 
               class="border rounded-xl p-6 shadow-lg">
            <div class="text-center">
              <div class="text-4xl mb-4">{{ isWinner ? '🏆' : '😔' }}</div>
              <h4 class="text-2xl font-bold mb-4">
                {{ isWinner ? '¡Victoria!' : 'Derrota' }}
              </h4>
              <p class="text-lg mb-6">
                {{ isWinner ? getVictoryMessage() : 'Tu oponente ha hundido todos tus barcos.' }}
              </p>
              <button #dashboardBtn class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-all duration-200 text-lg font-medium" (click)="backToDashboard()">
                Volver al Dashboard
              </button>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-white text-lg">Cargando juego...</p>
        </div>
      </div>
    </div>

    <!-- Modal de Historial -->
    <div *ngIf="showHistoryModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div class="bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-700">
        <div class="bg-gradient-to-r from-gray-800 via-gray-900 to-black px-6 py-4 border-b border-gray-700 flex justify-between items-center rounded-t-2xl">
          <h5 class="text-xl font-bold text-white drop-shadow flex items-center gap-2">📋 Historial de Movimientos</h5>
          <button class="text-white hover:text-red-400 transition-colors rounded-full p-1" (click)="closeHistoryModal()">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
        <div class="p-6">
          <div *ngIf="gameMoves.length === 0" class="text-center py-8">
            <p class="text-gray-300 text-lg">No hay movimientos registrados</p>
          </div>
          <div *ngFor="let move of gameMoves" class="mb-4">
            <div class="bg-gray-800 rounded-xl p-4 hover:shadow-lg transition-all duration-200 border border-gray-700">
              <div class="flex justify-between items-center mb-2">
                <span class="text-white">
                  <strong>{{ move.player }}</strong> disparó a 
                  <strong>{{ move.position }}</strong>
                </span>
                <span [class]="move.hit ? 'text-green-400 font-bold' : 'text-blue-400 font-bold'" class="font-medium">
                  {{ move.hit ? '🎯 Impacto' : '💧 Agua' }}
                </span>
              </div>
              <small class="text-gray-400">{{ move.createdAt | date:'short' }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Estilos personalizados para el juego */
    .fade-in {
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Transiciones suaves */
    .transition-all {
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 200ms;
    }
  `]
})
export class GameComponent implements OnInit, OnDestroy, AfterViewChecked {
  gameId: number = 0;
  currentUser: User | null = null;
  gameState: GameState | null = null;
  gameMoves: any[] = [];
  lastMoveResult: { hit: boolean; shipDestroyed: boolean } | null = null;
  loading = true;
  isMyTurn = false;
  isWinner = false;
  showHistoryModal = false;
  
  private subscriptions: Subscription[] = [];
  private pollingSubscription: Subscription | null = null;
  @ViewChild('dashboardBtn') dashboardBtn!: ElementRef<HTMLButtonElement>;
  private shouldFocusDashboardBtn = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/auth']);
      return;
    }

    this.gameId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.gameId) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadGameState();
    this.loadGameMoves();
    this.setupPolling();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldFocusDashboardBtn && this.dashboardBtn) {
      this.dashboardBtn.nativeElement.focus();
      this.shouldFocusDashboardBtn = false;
    }
  }

  loadGameState(): void {
    this.loading = true;
    this.gameService.getGameState(this.gameId, this.currentUser!.id).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.gameState = response.gameState;
          this.isMyTurn = this.gameState.currentPlayer.isCurrentTurn;
          this.checkGameEnd();
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading game state:', error);
      }
    });
  }

  loadGameMoves(): void {
    this.gameService.getGameMoves(this.gameId).subscribe({
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

  onOpponentCellClick(event: { row: number; col: number; position: string }): void {
    if (!this.isMyTurn || !this.currentUser) return;

    this.gameService.makeMove(this.gameId, this.currentUser.id, event.position).subscribe({
      next: (response) => {
        if (response.success) {
          this.lastMoveResult = {
            hit: response.result.hit,
            shipDestroyed: response.result.shipDestroyed
          };

          // Recargar estado del juego
          setTimeout(() => {
            this.loadGameState();
            this.loadGameMoves();
          }, 1000);

          // Limpiar resultado después de 3 segundos
          setTimeout(() => {
            this.lastMoveResult = null;
          }, 3000);
        }
      },
      error: (error) => {
        console.error('Error making move:', error);
      }
    });
  }

  setupPolling(): void {
    // Polling cada 2 segundos para actualizar el estado del juego
    this.pollingSubscription = this.gameService.pollGameState(
      this.gameId, 
      this.currentUser!.id, 
      2000
    ).subscribe({
      next: (response) => {
        if (response.success) {
          const previousTurn = this.isMyTurn;
          this.gameState = response.gameState;
          this.isMyTurn = this.gameState.currentPlayer.isCurrentTurn;
          
          // Si cambió el turno, recargar movimientos
          if (previousTurn !== this.isMyTurn) {
            this.loadGameMoves();
          }
          
          this.checkGameEnd();
        }
      },
      error: (error) => {
        console.error('Error in polling:', error);
      }
    });
  }

  checkGameEnd(): void {
    if (this.gameState?.game.status === 'finished') {
      this.isWinner = this.gameState.game.winnerId === this.currentUser?.id;
      // Detener polling cuando el juego termina
      if (this.pollingSubscription) {
        this.pollingSubscription.unsubscribe();
        this.pollingSubscription = null;
      }
      this.shouldFocusDashboardBtn = true;
    }
  }

  showGameHistory(): void {
    this.loadGameMoves();
    this.showHistoryModal = true;
  }

  closeHistoryModal(): void {
    this.showHistoryModal = false;
  }

  backToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  abandonarPartida(): void {
    if (!confirm('¿Seguro que quieres abandonar la partida? Esto contará como derrota y tu rival será notificado.')) return;
    if (!this.currentUser) return;
    this.gameService.surrenderGame(this.gameId, this.currentUser.id).subscribe({
      next: (response) => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        alert('Error al abandonar la partida.');
        console.error('Error al rendirse:', error);
      }
    });
  }

  getGameStatusText(): string {
    if (!this.gameState) return 'Cargando...';
    
    switch (this.gameState.game.status) {
      case 'waiting': return 'Esperando jugadores';
      case 'active': return 'En progreso';
      case 'finished': return 'Terminado';
      default: return this.gameState.game.status;
    }
  }

  getTurnMessage(): string {
    if (!this.gameState) return 'Cargando...';
    
    if (this.gameState.game.status === 'finished') {
      return this.isWinner ? '¡Juego terminado! ¡Has ganado!' : '¡Juego terminado! Has perdido.';
    }
    
    return this.isMyTurn ? '🎯 Es tu turno - Haz clic en el tablero del oponente' : '⏳ Esperando turno del oponente';
  }

  getVictoryMessage(): string {
    if (!this.gameState) return '';
    // Buscar si el último movimiento fue una rendición
    const surrenderMove = this.gameMoves.find(m => m.position === 'SUR' && m.player !== this.currentUser?.username);
    if (surrenderMove) {
      return '¡El rival abandonó la partida!';
    }
    return '¡Felicidades! Has ganado la partida.';
  }
} 