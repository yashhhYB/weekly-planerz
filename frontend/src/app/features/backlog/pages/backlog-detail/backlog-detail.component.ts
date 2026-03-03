import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { BacklogItem } from '../../../../models';
import { AppStoreState } from '../../../../store';
import * as BacklogSelectors from '../../../../store/backlog/backlog.selectors';
import * as BacklogActions from '../../../../store/backlog/backlog.actions';

@Component({
  selector: 'app-backlog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="backlog-detail-container">
      <div class="header-actions">
        <button class="btn btn-back" (click)="goBack()">← Back</button>
        <div class="actions">
          <button class="btn btn-primary" (click)="navigateToEdit()">Edit</button>
          <button class="btn btn-danger" (click)="deleteItem()">Delete</button>
          <button class="btn btn-secondary" (click)="archiveItem()">Archive</button>
        </div>
      </div>

      <div *ngIf="loading$ | async" class="loading">
        <p>Loading backlog item details...</p>
      </div>

      <div *ngIf="(loading$ | async) === false && (backlogItem$ | async) as backlogItem" class="item-details">
        <h1>{{ backlogItem.title }}</h1>
        
        <div class="item-meta">
          <span class="badge" [ngClass]="'category-' + backlogItem.category.toLowerCase()">
            {{ backlogItem.category }}
          </span>
          <span class="badge" [ngClass]="'status-' + backlogItem.status.toLowerCase()">
            {{ backlogItem.status }}
          </span>
          <span *ngIf="backlogItem.isArchived" class="badge badge-archived">
            Archived
          </span>
        </div>

        <div *ngIf="backlogItem.description" class="content-section">
          <h2>Description</h2>
          <p>{{ backlogItem.description }}</p>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <h3>Priority</h3>
            <div class="priority-display">
              <span *ngFor="let i of [1,2,3,4,5]" class="star" [class.filled]="i <= backlogItem.priority">★</span>
            </div>
            <p class="metric-value">{{ backlogItem.priority }}/5</p>
          </div>

          <div class="metric-card">
            <h3>Estimated Hours</h3>
            <p class="metric-value">{{ backlogItem.estimatedHours }}h</p>
          </div>

          <div class="metric-card">
            <h3>Status</h3>
            <p class="metric-value" [ngClass]="'status-color-' + backlogItem.status.toLowerCase()">
              {{ backlogItem.status }}
            </p>
          </div>
        </div>

        <div class="timestamps">
          <p><small>Created: {{ formatDateTime(backlogItem.createdAt) }}</small></p>
          <p><small>Last Updated: {{ formatDateTime(backlogItem.updatedAt) }}</small></p>
        </div>
      </div>

      <div *ngIf="error$ | async as error" class="error-message">
        <p>{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .backlog-detail-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .actions {
      display: flex;
      gap: 10px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.3s;
    }

    .btn-back {
      background: #f0f0f0;
      color: #333;
      border: 1px solid #ddd;
    }

    .btn-back:hover {
      background: #e0e0e0;
    }

    .btn-primary {
      background: #1976d2;
      color: white;
    }

    .btn-primary:hover {
      background: #1565c0;
    }

    .btn-secondary {
      background: #4caf50;
      color: white;
    }

    .btn-secondary:hover {
      background: #45a049;
    }

    .btn-danger {
      background: #f44336;
      color: white;
    }

    .btn-danger:hover {
      background: #da190b;
    }

    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    h1 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 28px;
    }

    h2 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #1976d2;
      border-bottom: 2px solid #1976d2;
      padding-bottom: 5px;
    }

    .item-meta {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .badge {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
    }

    .category-work { background: #e3f2fd; color: #1976d2; }
    .category-personal { background: #f3e5f5; color: #7b1fa2; }
    .category-learning { background: #e8f5e9; color: #388e3c; }
    .category-health { background: #fff3e0; color: #f57c00; }
    .category-finance { background: #fce4ec; color: #c2185b; }
    .category-relationships { background: #e0f2f1; color: #00796b; }

    .status-pending { background: #fff3cd; color: #856404; }
    .status-inprogress { background: #cfe2ff; color: #084298; }
    .status-completed { background: #d1e7dd; color: #0f5132; }
    .status-archived { background: #e2e3e5; color: #383d41; }

    .badge-archived { background: #e2e3e5; color: #383d41; }

    .content-section {
      margin-bottom: 20px;
      padding: 15px;
      background: #fafafa;
      border-left: 4px solid #1976d2;
      border-radius: 4px;
    }

    .content-section p {
      margin: 0;
      line-height: 1.6;
      color: #333;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }

    .metric-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }

    .metric-card h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      opacity: 0.9;
    }

    .metric-value {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }

    .priority-display {
      font-size: 20px;
      letter-spacing: 2px;
      margin-bottom: 5px;
    }

    .star {
      color: rgba(255, 255, 255, 0.3);
    }

    .star.filled {
      color: #ffd700;
      text-shadow: 0 0 4px rgba(255, 215, 0, 0.8);
    }

    .status-color-pending { color: #f57c00; }
    .status-color-inprogress { color: #1976d2; }
    .status-color-completed { color: #388e3c; }
    .status-color-archived { color: #9e9e9e; }

    .timestamps {
      background: #f0f0f0;
      padding: 10px;
      border-radius: 4px;
      margin-top: 30px;
    }

    .timestamps p {
      margin: 5px 0;
      color: #999;
    }

    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 15px;
      border-radius: 4px;
      margin-top: 20px;
    }
  `]
})
export class BacklogDetailComponent implements OnInit {
  backlogItem$: Observable<BacklogItem | undefined>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  private backlogId: string = '';

  constructor(
    private store: Store<AppStoreState>,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.backlogItem$ = new Observable();
    this.loading$ = this.store.select(BacklogSelectors.selectBacklogLoading);
    this.error$ = this.store.select(BacklogSelectors.selectBacklogError);
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.backlogId = params['id'];
      this.backlogItem$ = this.store.select(BacklogSelectors.selectBacklogItemById(this.backlogId));
    });
  }

  navigateToEdit(): void {
    this.router.navigate(['/backlog', this.backlogId, 'edit']);
  }

  deleteItem(): void {
    if (confirm('Are you sure you want to delete this backlog item?')) {
      this.store.dispatch(BacklogActions.deleteBacklogItem({ id: this.backlogId }));
    }
  }

  archiveItem(): void {
    if (confirm('Archive this backlog item?')) {
      this.store.dispatch(BacklogActions.archiveBacklogItem({ id: this.backlogId }));
    }
  }

  goBack(): void {
    this.router.navigate(['/backlog']);
  }

  formatDateTime(date: Date): string {
    return date ? date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : '';
  }
}
