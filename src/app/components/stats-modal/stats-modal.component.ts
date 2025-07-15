import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js';
import { GameStats } from '../../services/game.service';

@Component({
  selector: 'app-stats-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h5 class="text-xl font-semibold text-gray-800">📊 Estadísticas Detalladas</h5>
      <button class="text-gray-500 hover:text-gray-700 transition-colors" (click)="close()">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>
    <div class="p-6">
      <div *ngIf="stats">
        <!-- Gráfica de estadísticas -->
        <div class="mb-8">
          <h6 class="text-lg font-semibold text-gray-800 mb-4">Resumen de Partidas</h6>
          <canvas id="statsChart" width="400" height="200"></canvas>
        </div>

        <!-- Lista de partidas -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <h6 class="text-lg font-semibold text-gray-800 mb-4">🏆 Juegos Ganados ({{ stats.wonGames }})</h6>
            <div class="space-y-3">
              <div *ngFor="let game of stats.wonGamesList" class="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                <div class="flex justify-between items-center mb-2">
                  <div>
                    <strong class="text-gray-800">{{ game.name }}</strong>
                    <br>
                    <small class="text-gray-600">vs {{ game.opponent }}</small>
                  </div>
                  <button class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-all duration-200" (click)="viewGameDetails(game.id)">
                    👁️ Ver
                  </button>
                </div>
                <small class="text-gray-500">{{ game.createdAt | date:'short' }}</small>
              </div>
              <div *ngIf="stats.wonGamesList.length === 0" class="text-center text-gray-500 py-4">
                <p>No hay partidas ganadas</p>
              </div>
            </div>
          </div>
          
          <div>
            <h6 class="text-lg font-semibold text-gray-800 mb-4">😔 Juegos Perdidos ({{ stats.lostGames }})</h6>
            <div class="space-y-3">
              <div *ngFor="let game of stats.lostGamesList" class="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                <div class="flex justify-between items-center mb-2">
                  <div>
                    <strong class="text-gray-800">{{ game.name }}</strong>
                    <br>
                    <small class="text-gray-600">vs {{ game.opponent }}</small>
                  </div>
                  <button class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-all duration-200" (click)="viewGameDetails(game.id)">
                    👁️ Ver
                  </button>
                </div>
                <small class="text-gray-500">{{ game.createdAt | date:'short' }}</small>
              </div>
              <div *ngIf="stats.lostGamesList.length === 0" class="text-center text-gray-500 py-4">
                <p>No hay partidas perdidas</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Estadísticas adicionales -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h6 class="text-lg font-semibold text-gray-800 mb-6">📈 Estadísticas Generales</h6>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="text-blue-600">
              <h4 class="text-3xl font-bold">{{ stats.totalGames }}</h4>
              <small class="text-gray-600">Total Partidas</small>
            </div>
            <div class="text-green-600">
              <h4 class="text-3xl font-bold">{{ getWinRate() }}%</h4>
              <small class="text-gray-600">Porcentaje Victoria</small>
            </div>
            <div class="text-indigo-600">
              <h4 class="text-3xl font-bold">{{ stats.wonGames + stats.lostGames }}</h4>
              <small class="text-gray-600">Partidas Jugadas</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Estilos personalizados para el modal de estadísticas */
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
export class StatsModalComponent {
  @Input() stats: GameStats | null = null;
  @Input() onViewGameDetails: (gameId: number) => void = () => {};
  @Output() closeModal = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {
    if (this.stats) {
      this.createChart();
    }
  }

  close(): void {
    this.closeModal.emit();
  }

  viewGameDetails(gameId: number): void {
    this.onViewGameDetails(gameId);
  }

  getWinRate(): number {
    if (!this.stats || this.stats.totalGames === 0) return 0;
    return Math.round((this.stats.wonGames / this.stats.totalGames) * 100);
  }

  private createChart(): void {
    if (!this.stats) return;

    const ctx = document.getElementById('statsChart') as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Ganados', 'Perdidos'],
        datasets: [{
          data: [this.stats.wonGames, this.stats.lostGames],
          backgroundColor: [
            '#28a745',
            '#dc3545'
          ],
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
} 