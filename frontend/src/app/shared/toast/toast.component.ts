import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts; let i = index"
           class="toast" [ngClass]="'toast-' + toast.type"
           (click)="removeToast(i)">
        <span class="toast-icon">{{ getIcon(toast.type) }}</span>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" (click)="removeToast(i)">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed; top: 20px; right: 20px; z-index: 10000;
      display: flex; flex-direction: column; gap: 10px; max-width: 400px;
    }
    .toast {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      animation: slideIn 0.3s ease-out;
      cursor: pointer; color: white; font-size: 14px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .toast-success { background: #238636; }
    .toast-error { background: #da3633; }
    .toast-info { background: #1f6feb; }
    .toast-warning { background: #d29922; }
    .toast-icon { font-size: 18px; min-width: 20px; }
    .toast-message { flex: 1; }
    .toast-close {
      background: none; border: none; color: white; font-size: 18px;
      cursor: pointer; opacity: 0.7; padding: 0; line-height: 1;
    }
    .toast-close:hover { opacity: 1; }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription?: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toast$.subscribe(toast => {
      this.toasts.push(toast);
      setTimeout(() => {
        const idx = this.toasts.indexOf(toast);
        if (idx >= 0) this.toasts.splice(idx, 1);
      }, toast.duration || 3000);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  removeToast(index: number): void {
    this.toasts.splice(index, 1);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '';
    }
  }
}
