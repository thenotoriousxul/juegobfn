import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface Game {
  id: number;
  name: string;
  status: 'waiting' | 'active' | 'finished';
  creator: string;
  creatorId: number;
  playerCount: number;
  players: { id: number; username: string }[];
}

export interface GameState {
  game: {
    id: number;
    name: string;
    status: string;
    winnerId: number | null;
  };
  currentPlayer: {
    id: number;
    userId: number;
    username: string;
    board: string[][];
    shipsRemaining: number;
    isCurrentTurn: boolean;
  };
  opponent: {
    id: number;
    userId: number;
    username: string;
    board: string[][];
    shipsRemaining: number;
    isCurrentTurn: boolean;
  } | null;
  waiting?: boolean; // Indica si el juego está esperando jugadores
}

export interface GameMove {
  id: number;
  position: string;
  hit: boolean;
  shipDestroyed: boolean;
  player: string;
  targetPlayer: string;
  createdAt: string;
}

export interface GameStats {
  totalGames: number;
  wonGames: number;
  lostGames: number;
  wonGamesList: GameHistory[];
  lostGamesList: GameHistory[];
}

export interface GameHistory {
  id: number;
  name: string;
  opponent: string;
  createdAt: string;
}

export interface MoveResult {
  hit: boolean;
  shipDestroyed: boolean;
  gameFinished: boolean;
  winner: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://192.168.118.120:3333';

  constructor(private http: HttpClient) {}

  // Obtener lista de juegos disponibles
  getGames(): Observable<{ success: boolean; games: Game[] }> {
    return this.http.get<{ success: boolean; games: Game[] }>(`${this.apiUrl}/games`);
  }

  // Obtener juegos activos de un usuario
  getActiveGames(userId: number): Observable<{ success: boolean; activeGames: Game[] }> {
    return this.http.get<{ success: boolean; activeGames: Game[] }>(`${this.apiUrl}/games/active?userId=${userId}`);
  }

  // Crear un nuevo juego
  createGame(name: string, creatorId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/games`, { name, creatorId });
  }

  // Unirse a un juego
  joinGame(gameId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/games/${gameId}/join`, { userId });
  }

  // Obtener estado del juego
  getGameState(gameId: number, userId: number): Observable<{ success: boolean; gameState: GameState }> {
    return this.http.get<{ success: boolean; gameState: GameState }>(
      `${this.apiUrl}/games/${gameId}?userId=${userId}`
    );
  }

  // Realizar un movimiento
  makeMove(gameId: number, playerId: number, position: string): Observable<{ success: boolean; message: string; result: MoveResult }> {
    return this.http.post<{ success: boolean; message: string; result: MoveResult }>(
      `${this.apiUrl}/games/${gameId}/move`,
      { playerId, position }
    );
  }

  // Obtener movimientos de un juego
  getGameMoves(gameId: number): Observable<{ success: boolean; moves: GameMove[] }> {
    return this.http.get<{ success: boolean; moves: GameMove[] }>(`${this.apiUrl}/games/${gameId}/moves`);
  }

  // Obtener estadísticas de un usuario
  getUserStats(userId: number): Observable<{ success: boolean; stats: GameStats }> {
    return this.http.get<{ success: boolean; stats: GameStats }>(`${this.apiUrl}/users/${userId}/stats`);
  }

  // Obtener detalles de un juego
  getGameDetails(gameId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/games/${gameId}/details`);
  }

  // Polling para actualizar estado del juego (Short polling)
  pollGameState(gameId: number, userId: number, intervalMs: number = 2000): Observable<{ success: boolean; gameState: GameState }> {
    return interval(intervalMs).pipe(
      switchMap(() => this.getGameState(gameId, userId))
    );
  }

  // Polling para verificar nuevos juegos (Long polling simulado)
  pollNewGames(intervalMs: number = 5000): Observable<{ success: boolean; games: Game[] }> {
    return interval(intervalMs).pipe(
      switchMap(() => this.getGames())
    );
  }

  // Rendirse o abandonar una partida
  surrenderGame(gameId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/games/${gameId}/surrender`, { userId });
  }

  // Cancelar un juego en espera (solo creador)
  cancelGame(gameId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/games/${gameId}/cancel`, { body: { userId } });
  }
} 