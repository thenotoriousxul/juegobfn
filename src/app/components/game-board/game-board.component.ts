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
    <div class="game-board">
      <h5 class="text-center mb-3">{{ title }}</h5>
      <div class="board-container">
        <!-- Column headers -->
        <div class="board-header">
          <div class="cell header"></div>
          <div class="cell header" *ngFor="let col of columns">{{ col }}</div>
        </div>
        
        <!-- Board rows -->
        <div class="board-row" *ngFor="let row of rows; let rowIndex = index">
          <div class="cell header">{{ rowIndex + 1 }}</div>
          <div class="cell" 
               *ngFor="let col of columns; let colIndex = index"
               [class]="getCellClass(rowIndex, colIndex)"
               (click)="onCellClick(rowIndex, colIndex)"
               [title]="getCellTitle(rowIndex, colIndex)">
            {{ getCellDisplay(rowIndex, colIndex) }}
          </div>
        </div>
      </div>
      
      <div class="mt-3">
        <div class="row">
          <div class="col-md-6">
            <div class="legend-item">
              <div class="legend-color water"></div>
              <span>Agua</span>
            </div>
            <div class="legend-item">
              <div class="legend-color ship"></div>
              <span>Barco</span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="legend-item">
              <div class="legend-color hit"></div>
              <span>Impacto</span>
            </div>
            <div class="legend-item">
              <div class="legend-color miss"></div>
              <span>Falló</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .game-board {
      max-width: 500px;
      margin: 0 auto;
    }
    
    .board-container {
      border: 2px solid #333;
      display: inline-block;
    }
    
    .board-header {
      display: flex;
    }
    
    .board-row {
      display: flex;
    }
    
    .cell {
      width: 50px;
      height: 50px;
      border: 1px solid #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-weight: bold;
      transition: background-color 0.2s;
    }
    
    .cell:hover {
      background-color: #f8f9fa;
    }
    
    .cell.header {
      background-color: #e9ecef;
      font-weight: bold;
      cursor: default;
    }
    
    .cell.water {
      background-color: #87ceeb;
    }
    
    .cell.ship {
      background-color: #8b4513;
      color: white;
    }
    
    .cell.hit {
      background-color: #dc3545;
      color: white;
    }
    
    .cell.miss {
      background-color: #6c757d;
      color: white;
    }
    
    .cell.disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
    }
    
    .legend-color {
      width: 20px;
      height: 20px;
      margin-right: 10px;
      border: 1px solid #ccc;
    }
    
    .legend-color.water {
      background-color: #87ceeb;
    }
    
    .legend-color.ship {
      background-color: #8b4513;
    }
    
    .legend-color.hit {
      background-color: #dc3545;
    }
    
    .legend-color.miss {
      background-color: #6c757d;
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