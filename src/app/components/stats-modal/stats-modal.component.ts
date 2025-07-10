import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Chart } from 'chart.js';
import { GameStats } from '../../services/game.service';

@Component({
  selector: 'app-stats-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">📊 Estadísticas Detalladas</h5>
      <button type="button" class="btn-close" (click)="close()"></button>
    </div>
    <div class="modal-body">
      <div *ngIf="stats">
        <!-- Gráfica de estadísticas -->
        <div class="row mb-4">
          <div class="col-12">
            <h6>Resumen de Partidas</h6>
            <canvas id="statsChart" width="400" height="200"></canvas>
          </div>
        </div>

        <!-- Lista de partidas -->
        <div class="row">
          <div class="col-md-6">
            <h6>🏆 Juegos Ganados ({{ stats.wonGames }})</h6>
            <div class="list-group">
              <div *ngFor="let game of stats.wonGamesList" class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ game.name }}</strong>
                    <br>
                    <small class="text-muted">vs {{ game.opponent }}</small>
                  </div>
                  <button class="btn btn-sm btn-outline-primary" (click)="viewGameDetails(game.id)">
                    👁️ Ver
                  </button>
                </div>
                <small class="text-muted">{{ game.createdAt | date:'short' }}</small>
              </div>
              <div *ngIf="stats.wonGamesList.length === 0" class="text-center text-muted">
                <p>No hay partidas ganadas</p>
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <h6>😔 Juegos Perdidos ({{ stats.lostGames }})</h6>
            <div class="list-group">
              <div *ngFor="let game of stats.lostGamesList" class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ game.name }}</strong>
                    <br>
                    <small class="text-muted">vs {{ game.opponent }}</small>
                  </div>
                  <button class="btn btn-sm btn-outline-primary" (click)="viewGameDetails(game.id)">
                    👁️ Ver
                  </button>
                </div>
                <small class="text-muted">{{ game.createdAt | date:'short' }}</small>
              </div>
              <div *ngIf="stats.lostGamesList.length === 0" class="text-center text-muted">
                <p>No hay partidas perdidas</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Estadísticas adicionales -->
        <div class="row mt-4">
          <div class="col-12">
            <div class="card">
              <div class="card-body">
                <h6>📈 Estadísticas Generales</h6>
                <div class="row text-center">
                  <div class="col-4">
                    <div class="text-primary">
                      <h4>{{ stats.totalGames }}</h4>
                      <small>Total Partidas</small>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="text-success">
                      <h4>{{ getWinRate() }}%</h4>
                      <small>Porcentaje Victoria</small>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="text-info">
                      <h4>{{ stats.wonGames + stats.lostGames }}</h4>
                      <small>Partidas Jugadas</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .list-group-item {
      border-left: none;
      border-right: none;
      border-radius: 8px !important;
      margin-bottom: 5px;
    }
    
    .list-group-item:first-child {
      border-top: none;
    }
    
    .list-group-item:last-child {
      border-bottom: none;
    }
    
    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }
    
    .card {
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `]
})
export class StatsModalComponent {
  @Input() stats: GameStats | null = null;
  @Input() onViewGameDetails: (gameId: number) => void = () => {};

  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {
    if (this.stats) {
      this.createChart();
    }
  }

  close(): void {
    this.modalService.dismissAll();
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