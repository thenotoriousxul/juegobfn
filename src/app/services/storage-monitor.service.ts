import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageMonitorService {
  private storageChanges = new BehaviorSubject<{ key: string; newValue: any; oldValue: any } | null>(null);
  public storageChanges$ = this.storageChanges.asObservable();

  constructor() {
    this.initializeStorageListener();
  }

  private initializeStorageListener(): void {
    // Escuchar eventos de storage (cambios desde otras pestañas)
    window.addEventListener('storage', (event) => {
      if (event.key === 'currentUser') {
        this.storageChanges.next({
          key: event.key,
          newValue: event.newValue ? JSON.parse(event.newValue) : null,
          oldValue: event.oldValue ? JSON.parse(event.oldValue) : null
        });
      }
    });

    // Monitoreamos cambios locales mediante polling ligero
    this.monitorLocalChanges();
  }

  private monitorLocalChanges(): void {
    let lastValue = localStorage.getItem('currentUser');
    let lastHash = this.generateHash(lastValue);
    
    setInterval(() => {
      const currentValue = localStorage.getItem('currentUser');
      const currentHash = this.generateHash(currentValue);
      
      // Comparar tanto el valor como el hash para detectar cualquier cambio
      if (currentValue !== lastValue || currentHash !== lastHash) {
        console.log('Cambio detectado en localStorage:', {
          old: lastValue,
          new: currentValue
        });
        
        this.storageChanges.next({
          key: 'currentUser',
          newValue: currentValue ? this.safeJsonParse(currentValue) : null,
          oldValue: lastValue ? this.safeJsonParse(lastValue) : null
        });
        
        lastValue = currentValue;
        lastHash = currentHash;
      }
    }, 500); // Verificar cada 500ms para mayor responsividad
  }

  private generateHash(value: string | null): string {
    if (!value) return 'null';
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  private safeJsonParse(value: string): any {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error('Error parsing JSON from localStorage:', error);
      return null;
    }
  }
}