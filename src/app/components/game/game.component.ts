import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService, User } from '../../services/auth.service';
import { GameService, GameState, MoveResult } from '../../services/game.service';
import { GameBoardComponent } from '../game-board/game-board.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbAlert, GameBoardComponent],
  template: `
    <div class="container-fluid">
      <!-- Header del Juego -->
      <div class="row bg-dark text-white p-3">
        <div class="col-md-8">
          <h3>🎮 {{ gameState?.game?.name || 'Juego Naval' }}</h3>
          <p class="mb-0">
            Estado: {{ getGameStatusText() }} | 
            {{ currentUser?.username }} vs {{ gameState?.opponent?.username }}
          </p>
        </div>
        <div class="col-md-4 text-end">
          <button class="btn btn-outline-light me-2" (click)="showGameHistory()">
            📋 Historial
          </button>
          <button class="btn btn-outline-light" (click)="backToDashboard()">
            🏠 Dashboard
          </button>
        </div>
      </div>

      <!-- Estado del Juego -->
      <div class="row mt-3">
        <div class="col-12">
          <div class="alert" [class.alert-info]="!isMyTurn" [class.alert-success]="isMyTurn">
            <strong>{{ getTurnMessage() }}</strong>
            <span *ngIf="gameState">
              | Barcos restantes: Tú ({{ gameState.currentPlayer.shipsRemaining }}) - 
              {{ gameState.opponent.username }} ({{ gameState.opponent.shipsRemaining }})
            </span>
          </div>
        </div>
      </div>

      <!-- Tableros -->
      <div class="row mt-4" *ngIf="gameState">
        <!-- Tablero del Jugador -->
        <div class="col-md-6">
          <app-game-board
            [board]="gameState.currentPlayer.board"
            [title]="'Tu Tablero - ' + currentUser?.username"
            [isOpponent]="false"
            [disabled]="true">
          </app-game-board>
        </div>

        <!-- Tablero del Oponente -->
        <div class="col-md-6">
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
      <div class="row mt-3" *ngIf="lastMoveResult">
        <div class="col-12">
          <ngb-alert [type]="lastMoveResult.hit ? 'success' : 'info'" (closed)="lastMoveResult = null">
            <strong>{{ lastMoveResult.hit ? '🎯 ¡Impacto!' : '💧 Agua' }}</strong>
            <span *ngIf="lastMoveResult.shipDestroyed"> - ¡Barco destruido!</span>
          </ngb-alert>
        </div>
      </div>

      <!-- Resultado Final -->
      <div class="row mt-3" *ngIf="gameState?.game?.status === 'finished'">
        <div class="col-12">
          <div class="alert" [class.alert-success]="isWinner" [class.alert-danger]="!isWinner">
            <h4 class="alert-heading">
              {{ isWinner ? '🏆 ¡Victoria!' : '😔 Derrota' }}
            </h4>
            <p>
              {{ isWinner ? '¡Felicidades! Has hundido todos los barcos de tu oponente.' : 
                         'Tu oponente ha hundido todos tus barcos.' }}
            </p>
            <button class="btn btn-primary" (click)="backToDashboard()">
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div class="row mt-4" *ngIf="loading">
        <div class="col-12 text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2">Cargando juego...</p>
        </div>
      </div>
    </div>

    <!-- Modal de Historial -->
    <div class="modal fade" id="historyModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">📋 Historial de Movimientos</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div *ngIf="gameMoves.length === 0" class="text-center">
              <p>No hay movimientos registrados</p>
            </div>
            <div *ngFor="let move of gameMoves" class="mb-2">
              <div class="card">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <span>
                      <strong>{{ move.player }}</strong> disparó a 
                      <strong>{{ move.position }}</strong>
                    </span>
                    <span [class]="move.hit ? 'text-success' : 'text-muted'">
                      {{ move.hit ? '🎯 Impacto' : '💧 Agua' }}
                    </span>
                  </div>
                  <small class="text-muted">{{ move.createdAt | date:'short' }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .alert {
      border-radius: 8px;
    }
    
    .card {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .spinner-border {
      width: 3rem;
      height: 3rem;
    }
  `]
})
export class GameComponent implements OnInit, OnDestroy {
  gameId: number = 0;
  currentUser: User | null = null;
  gameState: GameState | null = null;
  gameMoves: any[] = [];
  lastMoveResult: { hit: boolean; shipDestroyed: boolean } | null = null;
  loading = true;
  isMyTurn = false;
  isWinner = false;
  
  private subscriptions: Subscription[] = [];
  private pollingSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private gameService: GameService,
    private modalService: NgbModal
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
    }
  }

  showGameHistory(): void {
    this.loadGameMoves();
    // Aquí podrías abrir un modal con el historial detallado
  }

  backToDashboard(): void {
    this.router.navigate(['/dashboard']);
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
} 