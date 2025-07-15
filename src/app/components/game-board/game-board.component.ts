import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BoardCell {
  row: number;
  col: number;
  value: string;
  position: string;
}

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-xl mx-auto flex flex-col items-center justify-center">
      <h5 class="text-center text-2xl font-bold text-white mb-6 drop-shadow">{{ title }}</h5>
      <div class="inline-block border-4 border-gray-700 bg-gray-900/90 rounded-2xl p-4 shadow-2xl">
        <!-- Column headers -->
        <div class="flex">
          <div class="w-14 h-14 flex items-center justify-center font-bold text-white bg-gray-800 border border-gray-700 rounded-tl-2xl"></div>
          <div class="w-14 h-14 flex items-center justify-center font-bold text-white bg-gray-800 border border-gray-700" *ngFor="let col of columns">{{ col }}</div>
        </div>
        <!-- Board rows -->
        <div class="flex" *ngFor="let row of rows; let rowIndex = index">
          <div class="w-14 h-14 flex items-center justify-center font-bold text-white bg-gray-800 border border-gray-700">{{ rowIndex + 1 }}</div>
          <div class="w-14 h-14 flex items-center justify-center border border-gray-700 transition-all duration-200 text-2xl"
               *ngFor="let col of columns; let colIndex = index"
               [class]="getCellClass(rowIndex, colIndex)"
               (click)="onCellClick(rowIndex, colIndex)"
               [title]="getCellTitle(rowIndex, colIndex)">
            {{ getCellDisplay(rowIndex, colIndex) }}
          </div>
        </div>
      </div>
      <div class="mt-8 w-full max-w-md">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 bg-blue-400 border border-gray-700 rounded"></div>
              <span class="text-base text-white">Agua</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 bg-brown-600 border border-gray-700 rounded"></div>
              <span class="text-base text-white">Barco</span>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 bg-red-500 border border-gray-700 rounded"></div>
              <span class="text-base text-white">Impacto</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 bg-gray-500 border border-gray-700 rounded"></div>
              <span class="text-base text-white">Falló</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Estilos personalizados para el tablero de juego */
    .water {
      background-color: #60a5fa;
      color: white;
    }
    
    .ship {
      background-color: #92400e;
      color: white;
    }
    
    .hit {
      background-color: #ef4444;
      color: white;
    }
    
    .miss {
      background-color: #6b7280;
      color: white;
    }
    
    .disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }
    
    /* Hover effect para celdas clickeables */
    .w-10.h-10:not(.disabled):hover {
      background-color: #f3f4f6;
      transform: scale(1.05);
    }
    
    /* Animaciones */
    .fade-in {
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class GameBoardComponent {
  @Input() board: string[][] = [];
  @Input() title: string = 'Tablero';
  @Input() isOpponent: boolean = false;
  @Input() disabled: boolean = false;
  @Output() cellClick = new EventEmitter<{row: number, col: number, position: string}>();

  columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  rows = Array(8).fill(0);

  getCellClass(row: number, col: number): string {
    if (this.disabled) return 'disabled';
    
    const cellValue = this.board[row]?.[col];
    if (!cellValue) return '';
    
    return cellValue;
  }

  getCellDisplay(row: number, col: number): string {
    const cellValue = this.board[row]?.[col];
    
    if (this.isOpponent && cellValue === 'ship') {
      return ''; // No mostrar barcos del oponente
    }
    
    switch (cellValue) {
      case 'hit':
        return '💥';
      case 'miss':
        return '💧';
      case 'ship':
        return '🚢';
      default:
        return '';
    }
  }

  getCellTitle(row: number, col: number): string {
    const position = this.getPosition(row, col);
    const cellValue = this.board[row]?.[col];
    
    if (this.disabled) return `${position} - No disponible`;
    
    switch (cellValue) {
      case 'hit':
        return `${position} - Impacto`;
      case 'miss':
        return `${position} - Falló`;
      case 'ship':
        return this.isOpponent ? `${position} - Agua` : `${position} - Barco`;
      default:
        return `${position} - Agua`;
    }
  }

  onCellClick(row: number, col: number): void {
    if (this.disabled) return;
    
    const position = this.getPosition(row, col);
    this.cellClick.emit({ row, col, position });
  }

  private getPosition(row: number, col: number): string {
    const letter = this.columns[col];
    const number = row + 1;
    return `${letter}${number}`;
  }
} 