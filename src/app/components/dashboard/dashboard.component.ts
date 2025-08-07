import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { GameService, Game, GameStats } from '../../services/game.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative">
      <div class="w-full max-w-7xl">
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
          <!-- Header -->
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 class="text-2xl font-bold text-white mb-2">🚢 Juego Naval</h2>
              <p class="text-white">Bienvenido, {{ currentUser?.username }}</p>
            </div>
            <div class="flex space-x-3 mt-4 md:mt-0">
              <button class="bg-red-700/80 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow" (click)="showStats()">
                <span>📊</span>
                <span>Estadísticas</span>
              </button>
              <button class="bg-gray-700/80 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow" (click)="logout()">
                <span>🚪</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
          <!-- Contenido -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <!-- Sidebar -->
            <div class="md:col-span-1 space-y-6">
              <!-- Menú -->
              <div class="bg-gray-900/70 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-800">
                  <h5 class="text-lg font-semibold text-white">Menú</h5>
                </div>
                <div class="p-4">
                  <div class="space-y-2">
                    <button class="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3"
                            [class]="activeSection === 'games' ? 'bg-red-900/60 text-red-300 border-l-4 border-red-500' : 'text-white hover:bg-gray-800'"
                            (click)="setActiveSection('games')">
                      <span>🎮</span>
                      <span>Juegos Disponibles</span>
                    </button>
                    <button class="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3"
                            [class]="activeSection === 'create' ? 'bg-red-900/60 text-red-300 border-l-4 border-red-500' : 'text-white hover:bg-gray-800'"
                            (click)="setActiveSection('create')">
                      <span>➕</span>
                      <span>Crear Juego</span>
                    </button>
                    <button class="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3"
                            [class]="activeSection === 'active' ? 'bg-red-900/60 text-red-300 border-l-4 border-red-500' : 'text-white hover:bg-gray-800'"
                            (click)="setActiveSection('active')">
                      <span>⚡</span>
                      <span>Juegos Activos</span>
                    </button>
                  </div>
                </div>
              </div>
              <!-- Estadísticas Rápidas -->
              <div class="bg-gray-900/70 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-800">
                  <h6 class="text-lg font-semibold text-white">📈 Estadísticas Rápidas</h6>
                </div>
                <div class="p-6">
                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="text-center">
                      <div class="text-green-400">
                        <h4 class="text-2xl font-bold">{{ stats?.wonGames || 0 }}</h4>
                        <small class="text-white">Ganados</small>
                      </div>
                    </div>
                    <div class="text-center">
                      <div class="text-red-400">
                        <h4 class="text-2xl font-bold">{{ stats?.lostGames || 0 }}</h4>
                        <small class="text-white">Perdidos</small>
                      </div>
                    </div>
                  </div>
                  <div class="mt-4">
                    <canvas #statsChart width="200" height="100"></canvas>
                  </div>
                </div>
              </div>
            </div>
            <!-- Main Content -->
            <div class="md:col-span-3">
              <!-- Juegos Disponibles -->
              <div *ngIf="activeSection === 'games'">
                <div class="bg-gray-900/70 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                  <div class="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                    <h5 class="text-lg font-semibold text-white">🎮 Juegos Disponibles</h5>
                    <button class="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2" (click)="refreshGames()">
                      <span>🔄</span>
                      <span>Actualizar</span>
                    </button>
                  </div>
                  <div class="p-6">
                    <div *ngIf="loading" class="text-center py-8">
                      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      <p class="mt-2 text-white">Cargando juegos...</p>
                    </div>
                    <div *ngIf="!loading && games.length === 0" class="text-center py-8">
                      <p class="text-white mb-4">No hay juegos disponibles</p>
                      <button class="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-lg transition-all duration-200" (click)="setActiveSection('create')">
                        Crear un nuevo juego
                      </button>
                    </div>
                    <div *ngIf="!loading && games.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div *ngFor="let game of games" class="bg-gray-800/70 rounded-xl p-6 hover:shadow-xl transition-all duration-200 border border-gray-700">
                        <h6 class="text-lg font-semibold text-white mb-3">{{ game.name }}</h6>
                        <div class="space-y-2 mb-4">
                          <p class="text-sm text-white">
                            <span class="font-medium">Creado por:</span> {{ game.creator }}
                          </p>
                          <p class="text-sm text-white">
                            <span class="font-medium">Jugadores:</span> {{ game.playerCount }}/2
                          </p>
                          <p class="text-sm text-white">
                            <span class="font-medium">Estado:</span> {{ getStatusText(game.status) }}
                          </p>
                        </div>
                        <!-- Botones dinámicos según el estado del juego -->
                        
                        <!-- Si soy el creador y está 1/2 (esperando otro jugador) -->
                        <div class="flex space-x-2" *ngIf="isGameCreator(game) && game.playerCount === 1">
                          <button class="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2">
                            <span>⏳</span>
                            <span>Esperando...</span>
                          </button>
                          <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center" 
                                  (click)="cancelGame(game.id)" 
                                  title="Cancelar juego">
                            <span>❌</span>
                          </button>
                        </div>
                        
                        <!-- Si no soy el creador y puedo unirme (1/2) -->
                        <div *ngIf="!isGameCreator(game) && canUserJoinGame(game)">
                          <button class="w-full bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2" 
                                  (click)="joinGame(game.id)">
                            <span>🚀</span>
                            <span>Unirse</span>
                          </button>
                        </div>
                        
                        <!-- Si ya estoy en el juego y está lleno (2/2) - puedo continuar -->
                        <div *ngIf="canJoinFullGame(game)">
                          <button class="w-full bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2" 
                                  (click)="joinGame(game.id)">
                            <span>🎮</span>
                            <span>Continuar Juego</span>
                          </button>
                        </div>
                        
                        <!-- Si el juego está lleno y no estoy en él -->
                        <div *ngIf="game.playerCount >= 2 && !isUserInGame(game)">
                          <button class="w-full bg-gray-600 text-white px-4 py-2 rounded-lg cursor-not-allowed flex items-center justify-center space-x-2" 
                                  disabled>
                            <span>🔒</span>
                            <span>Juego Lleno</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Crear Juego -->
              <div *ngIf="activeSection === 'create'">
                <div class="bg-gray-900/70 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                  <div class="px-6 py-4 border-b border-gray-800">
                    <h5 class="text-lg font-semibold text-white">➕ Crear Nuevo Juego</h5>
                  </div>
                  <div class="p-6">
                    <form (ngSubmit)="createGame()" #createForm="ngForm" class="space-y-6">
                      <div>
                        <label for="gameName" class="block text-sm font-medium text-white mb-2">Nombre del Juego</label>
                        <input type="text" 
                               class="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200" 
                               id="gameName" 
                               [(ngModel)]="newGameName" 
                               name="gameName" 
                               required
                               placeholder="Ingresa el nombre del juego">
                      </div>
                      <button type="submit" 
                              class="bg-red-700 hover:bg-red-800 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2" 
                              [disabled]="creating">
                        <span *ngIf="creating" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        <span>{{ creating ? 'Creando...' : 'Crear Juego' }}</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
              <!-- Juegos Activos -->
              <div *ngIf="activeSection === 'active'">
                <div class="bg-gray-900/70 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                  <div class="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                    <h5 class="text-lg font-semibold text-white">⚡ Juegos Activos</h5>
                    <button class="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2" (click)="loadActiveGames()">
                      <span>🔄</span>
                      <span>Actualizar</span>
                    </button>
                  </div>
                  <div class="p-6">
                    <div *ngIf="loading" class="text-center py-8">
                      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      <p class="mt-2 text-white">Cargando juegos activos...</p>
                    </div>
                    <div *ngIf="!loading && activeGames.length === 0" class="text-center py-8">
                      <p class="text-white mb-4">No tienes juegos activos</p>
                      <p class="text-gray-400 text-sm">Los juegos activos son aquellos en los que ya estás participando</p>
                    </div>
                    <div *ngIf="!loading && activeGames.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div *ngFor="let game of activeGames" class="bg-gray-800/70 rounded-xl p-6 hover:shadow-xl transition-all duration-200 border border-gray-700">
                        <h6 class="text-lg font-semibold text-white mb-3">{{ game.name }}</h6>
                        <div class="space-y-2 mb-4">
                          <p class="text-sm text-white">
                            <span class="font-medium">Creado por:</span> {{ game.creator }}
                          </p>
                          <p class="text-sm text-white">
                            <span class="font-medium">Jugadores:</span> {{ game.players.length || 0 }}/2
                          </p>
                          <p class="text-sm text-white">
                            <span class="font-medium">Estado:</span> {{ getStatusText(game.status) }}
                          </p>
                        </div>
                        <div class="flex space-x-3">
                          <button class="flex-1 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2" (click)="continueGame(game.id)">
                            <span>🎮</span>
                            <span>Continuar Juego</span>
                          </button>
                          <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center" (click)="abandonGame(game.id)" title="Abandonar juego">
                            <span>🚪</span>
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
      </div>
    </div>
    <!-- Modal de Estadísticas (sin cambios, pero puedes ajustar colores si lo deseas) -->
    <div *ngIf="showStatsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-gray-900 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div class="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
          <h5 class="text-xl font-semibold text-white">📊 Estadísticas Detalladas</h5>
          <button class="text-white hover:text-white transition-colors" (click)="closeStatsModal()">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
        <div class="p-6">
          <div *ngIf="stats">
            <!-- Resumen General -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div class="bg-red-700 text-white rounded-xl p-6 text-center">
                <h3 class="text-3xl font-bold">{{ stats.totalGames }}</h3>
                <p class="text-red-100">Total Juegos</p>
              </div>
              <div class="bg-green-700 text-white rounded-xl p-6 text-center">
                <h3 class="text-3xl font-bold">{{ stats.wonGames }}</h3>
                <p class="text-green-100">Ganados</p>
              </div>
              <div class="bg-red-800 text-white rounded-xl p-6 text-center">
                <h3 class="text-3xl font-bold">{{ stats.lostGames }}</h3>
                <p class="text-red-100">Perdidos</p>
              </div>
              <div class="bg-gray-800 text-white rounded-xl p-6 text-center">
                <h3 class="text-3xl font-bold">{{ getWinRate() }}%</h3>
                <p class="text-gray-100">% Victoria</p>
              </div>
            </div>
           
            <!-- Tablas de Juegos -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                  <h6 class="text-lg font-semibold text-white">🏆 Juegos Ganados ({{ stats.wonGames }})</h6>
                  <button class="bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded-lg text-sm transition-all duration-200" (click)="showWonGamesDetails()">
                    Ver Detalles
                  </button>
                </div>
                <div class="p-6">
                  <div *ngFor="let game of stats.wonGamesList.slice(0, 3)" class="mb-4 p-3 bg-gray-800/70 rounded-lg text-white">
                    {{ game.name }}
                  </div>
                </div>
              </div>
              <div class="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                  <h6 class="text-lg font-semibold text-white">💔 Juegos Perdidos ({{ stats.lostGames }})</h6>
                  <button class="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded-lg text-sm transition-all duration-200" (click)="showLostGamesDetails()">
                    Ver Detalles
                  </button>
                </div>
                <div class="p-6">
                  <div *ngFor="let game of stats.lostGamesList.slice(0, 3)" class="mb-4 p-3 bg-gray-800/70 rounded-lg text-white">
                    {{ game.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalles de Juegos -->
    <div *ngIf="showGameDetailsModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div class="bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-700">
        <div class="bg-gradient-to-r from-gray-800 via-gray-900 to-black px-6 py-4 border-b border-gray-700 flex justify-between items-center rounded-t-2xl">
          <h5 class="text-xl font-bold text-white drop-shadow flex items-center gap-2">{{ gameDetailsTitle }}</h5>
          <button class="text-white hover:text-red-400 transition-colors rounded-full p-1" (click)="closeGameDetailsModal()">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
        <div class="p-6">
          <div *ngIf="gameDetailsList.length > 0">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-800">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Juego</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Oponente</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody class="bg-gray-900 divide-y divide-gray-800">
                  <tr *ngFor="let game of gameDetailsList" class="hover:bg-gray-800">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{{ game.name }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{{ game.opponent }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{{ game.createdAt | date:'short' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button class="bg-blue-600 hover:bg-blue-400 text-white px-4 py-2 rounded-full shadow transition-all duration-200 text-base font-semibold" (click)="viewGameBoard(game.id)">
                        Ver Tablero
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

    <!-- Modal de Tablero Final -->
    <div *ngIf="showBoardModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div class="bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-700">
        <div class="bg-gradient-to-r from-gray-800 via-gray-900 to-black px-6 py-4 border-b border-gray-700 flex justify-between items-center rounded-t-2xl">
          <h5 class="text-xl font-bold text-white drop-shadow flex items-center gap-2">🎯 Tablero Final - {{ selectedGame?.name }}</h5>
          <button class="text-white hover:text-red-400 transition-colors rounded-full p-1" (click)="closeBoardModal()">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
        <div class="p-6">
          <div *ngIf="selectedGame && gameBoardState">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h6 class="text-lg font-semibold text-white mb-4">Tablero de {{ gameBoardState.player1Username }}</h6>
                <div class="inline-block border-4 border-gray-700 bg-gray-900/90 rounded-2xl p-4 shadow-2xl">
                  <div class="flex">
                    <div class="w-10 h-10 flex items-center justify-center font-bold text-white bg-gray-800 border border-gray-700"></div>
                    <div class="w-10 h-10 flex items-center justify-center font-bold text-white bg-gray-800 border border-gray-700" *ngFor="let col of gameBoardState.columns">{{ col }}</div>
                  </div>
                  <div class="flex" *ngFor="let row of gameBoardState.player1Board; let i = index">
                    <div class="w-10 h-10 flex items-center justify-center font-bold text-white bg-gray-800 border border-gray-700">{{ i + 1 }}</div>
                    <div class="w-10 h-10 flex items-center justify-center border border-gray-700 text-2xl"
                         *ngFor="let cell of row"
                         [ngClass]="{
                           'bg-blue-400 text-white': cell === 'water',
                           'bg-brown-600 text-white': cell === 'ship',
                           'bg-red-500 text-white': cell === 'hit',
                           'bg-gray-500 text-white': cell === 'miss'
                         }">
                      {{ getCellDisplay(cell) }}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h6 class="text-lg font-semibold text-white mb-4">Tablero de {{ gameBoardState.player2Username }}</h6>
                <div class="inline-block border-4 border-gray-700 bg-gray-900/90 rounded-2xl p-4 shadow-2xl">
                  <div class="flex">
                    <div class="w-10 h-10 flex items-center justify-center font-bold text-white bg-gray-800 border border-gray-700"></div>
                    <div class="w-10 h-10 flex items-center justify-center font-bold text-white bg-gray-800 border border-gray-700" *ngFor="let col of gameBoardState.columns">{{ col }}</div>
                  </div>
                  <div class="flex" *ngFor="let row of gameBoardState.player2Board; let i = index">
                    <div class="w-10 h-10 flex items-center justify-center font-bold text-white bg-gray-800 border border-gray-700">{{ i + 1 }}</div>
                    <div class="w-10 h-10 flex items-center justify-center border border-gray-700 text-2xl"
                         *ngFor="let cell of row"
                         [ngClass]="{
                           'bg-blue-400 text-white': cell === 'water',
                           'bg-brown-600 text-white': cell === 'ship',
                           'bg-red-500 text-white': cell === 'hit',
                           'bg-gray-500 text-white': cell === 'miss'
                         }">
                      {{ getCellDisplay(cell) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Leyenda -->
            <div class="bg-gray-900 rounded-xl shadow-lg p-6 mb-8 border border-gray-700">
              <h6 class="text-lg font-semibold text-white mb-4">📋 Leyenda</h6>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <span class="inline-block bg-brown-600 text-white p-2 rounded-lg text-lg">🚢</span>
                  <small class="block text-gray-300 mt-1">Barco</small>
                </div>
                <div>
                  <span class="inline-block bg-red-500 text-white p-2 rounded-lg text-lg">🎯</span>
                  <small class="block text-gray-300 mt-1">Impacto</small>
                </div>
                <div>
                  <span class="inline-block bg-gray-500 text-white p-2 rounded-lg text-lg">💧</span>
                  <small class="block text-gray-300 mt-1">Agua</small>
                </div>
                <div>
                  <span class="inline-block bg-blue-400 text-white p-2 rounded-lg text-lg">🌊</span>
                  <small class="block text-gray-300 mt-1">Mar</small>
                </div>
              </div>
            </div>
            <!-- Movimientos -->
            <div class="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-700">
              <h6 class="text-lg font-semibold text-white mb-4">📋 Historial de Movimientos</h6>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-800">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Jugador</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Posición</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Resultado</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Hora</th>
                    </tr>
                  </thead>
                  <tbody class="bg-gray-900 divide-y divide-gray-800">
                    <tr *ngFor="let move of gameMoves.slice().reverse()" class="hover:bg-gray-800">
                      <td class="px-4 py-2 whitespace-nowrap text-sm text-white">{{ move.player }}</td>
                      <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{{ move.position }}</td>
                      <td class="px-4 py-2 whitespace-nowrap text-sm">
                        <span [class]="move.hit ? 'text-green-400 font-bold' : 'text-blue-400 font-bold'">
                          {{ move.hit ? '🎯 Impacto' : '💧 Agua' }}
                        </span>
                      </td>
                      <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-400">{{ move.createdAt | date:'short' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
:host {
  font-family: 'Inter', sans-serif;
}
.transition-all {
  transition: all 0.2s ease-in-out;
}
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}
@keyframes waveUpDown {
  0% { transform: translateY(0); }
  50% { transform: translateY(20px); }
  100% { transform: translateY(0); }
}
.animate-wave-updown {
  animation: waveUpDown 4s ease-in-out infinite;
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
  showStatsModal = false;
  showGameDetailsModal = false;
  showBoardModal = false;

  private subscriptions: Subscription[] = [];
  private waitingGamePolling: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private gameService: GameService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/auth']);
      return;
    }

    this.loadGames();
    this.loadActiveGames();
    this.loadStats();
    this.setupPolling();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.waitingGamePolling) this.waitingGamePolling.unsubscribe();
  }

  setActiveSection(section: 'games' | 'create' | 'active'): void {
    this.activeSection = section;
    if (section === 'games') {
      this.loadGames();
    } else if (section === 'active') {
      this.loadActiveGames();
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

  loadActiveGames(): void {
    if (!this.currentUser) return;
    
    this.loading = true;
    this.gameService.getActiveGames(this.currentUser.id).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.activeGames = response.activeGames;
          console.log('Active games loaded:', this.activeGames);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading active games:', error);
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
          
          // Si el backend indica que debe redirigir (creador se unió automáticamente)
          if (response.shouldRedirect && response.game) {
            this.router.navigate(['/game', response.game.id]);
          } else {
            // Fallback: volver a la lista de juegos
            this.setActiveSection('games');
            this.loadGames();
          }
        } else {
          alert('Error al crear el juego: ' + response.message);
        }
      },
      error: (error) => {
        this.creating = false;
        console.error('Error creating game:', error);
        
        // Mostrar el mensaje de error específico si está disponible
        if (error.error && error.error.message) {
          alert('Error: ' + error.error.message);
        } else {
          alert('Error al crear el juego');
        }
      }
    });
  }

  joinGame(gameId: number): void {
    if (!this.currentUser) return;
    this.gameService.joinGame(gameId, this.currentUser.id).subscribe({
      next: (response) => {
        if (response.success) {
          // Si el juego ya está activo, navegar de inmediato
          if (response.shouldRedirect || response.gamePlayer?.isCurrentTurn !== undefined) {
            this.router.navigate(['/game', gameId]);
          } else {
            // Si el juego está en espera, iniciar polling para detectar cuando se active
            this.startWaitingGamePolling(gameId);
          }
        }
      },
      error: (error) => {
        console.error('Error joining game:', error);
      }
    });
  }

  private startWaitingGamePolling(gameId: number): void {
    if (this.waitingGamePolling) this.waitingGamePolling.unsubscribe();
    this.waitingGamePolling = this.gameService.pollGameState(gameId, this.currentUser!.id, 2000).subscribe({
      next: (response) => {
        if (response.success && response.gameState.game.status === 'active') {
          this.waitingGamePolling?.unsubscribe();
          this.router.navigate(['/game', gameId]);
        }
      },
      error: (error) => {
        console.error('Error polling waiting game:', error);
      }
    });
  }

  continueGame(gameId: number): void {
    this.router.navigate(['/game', gameId]);
  }

  abandonGame(gameId: number): void {
    if (!this.currentUser) return;
    
    if (confirm('¿Estás seguro de que quieres abandonar este juego? Esta acción no se puede deshacer.')) {
      this.gameService.surrenderGame(gameId, this.currentUser.id).subscribe({
        next: (response) => {
          if (response.success) {
            // Recargar la lista de juegos activos
            this.loadActiveGames();
            alert('Has abandonado el juego exitosamente');
          } else {
            alert('Error al abandonar el juego: ' + response.message);
          }
        },
        error: (error) => {
          console.error('Error abandoning game:', error);
          alert('Error al abandonar el juego');
        }
      });
    }
  }

  cancelGame(gameId: number): void {
    if (!this.currentUser) return;
    
    if (confirm('¿Estás seguro de que quieres cancelar este juego? Se eliminará permanentemente.')) {
      this.gameService.cancelGame(gameId, this.currentUser.id).subscribe({
        next: (response) => {
          if (response.success) {
            // Recargar la lista de juegos disponibles
            this.loadGames();
            alert('Juego cancelado exitosamente');
          } else {
            alert('Error al cancelar el juego: ' + response.message);
          }
        },
        error: (error) => {
          console.error('Error canceling game:', error);
          alert('Error al cancelar el juego');
        }
      });
    }
  }

  // Verificar si el usuario es el creador del juego
  isGameCreator(game: Game): boolean {
    return this.currentUser?.id === game.creatorId;
  }

  // Verificar si el usuario ya está en el juego
  isUserInGame(game: Game): boolean {
    return game.players?.some(p => p.id === this.currentUser?.id) || false;
  }

  // Verificar si el usuario puede unirse al juego
  canUserJoinGame(game: Game): boolean {
    return game.playerCount < 2 && !this.isUserInGame(game);
  }

  // Verificar si el usuario puede unirse a un juego lleno (2/2) para continuar
  canJoinFullGame(game: Game): boolean {
    return game.playerCount >= 2 && this.isUserInGame(game);
  }

  refreshGames(): void {
    this.loadGames();
  }

  showStats(): void {
    this.loadStats();
    this.showStatsModal = true;
    // Crear gráfica después de que el modal se abra
    setTimeout(() => this.createStatsChart(), 100);
  }

  closeStatsModal(): void {
    this.showStatsModal = false;
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
    this.showGameDetailsModal = true;
  }

  closeGameDetailsModal(): void {
    this.showGameDetailsModal = false;
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
    this.showBoardModal = true;
  }

  closeBoardModal(): void {
    this.showBoardModal = false;
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