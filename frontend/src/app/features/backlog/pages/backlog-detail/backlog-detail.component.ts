import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { BacklogItem, BacklogCategoryLabels } from '../../../../models';
import { AppStoreState } from '../../../../store';
import * as BacklogSelectors from '../../../../store/backlog/backlog.selectors';
import * as BacklogActions from '../../../../store/backlog/backlog.actions';

@Component({
  selector: 'app-backlog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <div class="header-actions">
        <button class="btn-back" (click)="goBack()">← Back to list</button>
        <div class="actions">
          <button class="btn-edit" (click)="navigateToEdit()" [disabled]="(backlogItem$ | async)?.isArchived">Edit</button>
          <button *ngIf="!(backlogItem$ | async)?.isArchived" class="btn-archive" (click)="archiveItem()">Archive</button>
          <button class="btn-danger" (click)="deleteItem()">Delete</button>
        </div>
      </div>

      <div *ngIf="loading$ | async" class="loading">Loading backlog item details...</div>

      <div *ngIf="(loading$ | async) === false && (backlogItem$ | async) as backlogItem" class="detail-content">
        <h1>{{ backlogItem.title }}</h1>

        <div class="meta-row">
          <span class="cat-badge" [ngClass]="'c-' + backlogItem.category">{{ getCategoryLabel(backlogItem.category) }}</span>
          <span *ngIf="backlogItem.isArchived" class="status-badge archived">Archived</span>
          <span *ngIf="!backlogItem.isArchived" class="status-badge active">Active</span>
        </div>

        <div *ngIf="backlogItem.description" class="desc-section">
          <h2>Description</h2>
          <p>{{ backlogItem.description }}</p>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon" style="background:rgba(31,111,235,0.15);color:#58a6ff;">📊</div>
            <span class="metric-label">Category</span>
            <span class="metric-value">{{ getCategoryLabel(backlogItem.category) }}</span>
          </div>
          <div class="metric-card">
            <div class="metric-icon" style="background:rgba(210,153,34,0.15);color:#d29922;">⏱</div>
            <span class="metric-label">Estimated Hours</span>
            <span class="metric-value">{{ backlogItem.estimatedHours }}h</span>
          </div>
          <div class="metric-card">
            <div class="metric-icon" style="background:rgba(35,134,54,0.15);color:#3fb950;">📋</div>
            <span class="metric-label">Status</span>
            <span class="metric-value">{{ backlogItem.isArchived ? 'Archived' : 'Active' }}</span>
          </div>
        </div>

        <div class="meta"><span>Created: {{ formatDateTime(backlogItem.createdAt) }}</span></div>
      </div>

      <div *ngIf="error$ | async as error" class="error-bar">{{ error }}</div>
    </div>
  `,
  styles: [`
    .page { padding: 32px 0; max-width: 800px; margin: 0 auto; }

    .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .actions { display: flex; gap: 8px; }

    .btn-back {
      padding: 8px 16px; background: #21262d; color: #e1e4e8;
      border: 1px solid #30363d; border-radius: 6px; cursor: pointer; font-size: 13px;
      transition: all 0.2s;
    }
    .btn-back:hover { background: #30363d; border-color: #58a6ff; }

    .btn-edit {
      padding: 8px 16px; background: #1f6feb; color: white;
      border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;
      transition: background 0.2s;
    }
    .btn-edit:hover:not(:disabled) { background: #388bfd; }
    .btn-edit:disabled { opacity: 0.4; cursor: not-allowed; }

    .btn-archive {
      padding: 8px 16px; background: rgba(139,148,158,0.1); color: #8b949e;
      border: 1px solid rgba(139,148,158,0.3); border-radius: 6px; cursor: pointer; font-size: 13px;
      transition: all 0.2s;
    }
    .btn-archive:hover { background: rgba(139,148,158,0.2); }

    .btn-danger {
      padding: 8px 16px; background: rgba(248,81,73,0.1); color: #f85149;
      border: 1px solid rgba(248,81,73,0.3); border-radius: 6px; cursor: pointer; font-size: 13px;
      transition: all 0.2s;
    }
    .btn-danger:hover { background: rgba(248,81,73,0.2); }

    .loading { text-align: center; padding: 60px; color: #8b949e; }

    .detail-content h1 { margin: 0 0 12px 0; font-size: 28px; color: #f0f6fc; }

    .meta-row { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }

    .cat-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .c-1 { background: rgba(31,111,235,0.15); color: #58a6ff; }
    .c-2 { background: rgba(218,54,51,0.15); color: #f85149; }
    .c-3 { background: rgba(35,134,54,0.15); color: #3fb950; }

    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-badge.active { background: rgba(35,134,54,0.2); color: #3fb950; }
    .status-badge.archived { background: rgba(139,148,158,0.2); color: #8b949e; }

    .desc-section {
      margin-bottom: 20px; padding: 16px;
      background: #161b22; border: 1px solid #30363d; border-left: 4px solid #1f6feb;
      border-radius: 8px;
    }
    .desc-section h2 { margin: 0 0 8px 0; font-size: 15px; color: #f0f6fc; }
    .desc-section p { margin: 0; line-height: 1.6; color: #e1e4e8; }

    .metrics-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0;
    }

    .metric-card {
      background: #161b22; border: 1px solid #30363d; border-radius: 8px;
      padding: 16px; display: flex; flex-direction: column; gap: 8px;
    }
    .metric-icon {
      width: 36px; height: 36px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center; font-size: 18px;
    }
    .metric-label { font-size: 12px; color: #8b949e; }
    .metric-value { font-size: 20px; font-weight: 700; color: #f0f6fc; }

    .meta { color: #484f58; font-size: 12px; margin-top: 12px; }

    .error-bar { background: rgba(248,81,73,0.1); color: #f85149; padding: 12px 16px; border-radius: 6px; margin-top: 16px; border: 1px solid rgba(248,81,73,0.4); }

    @media (max-width: 768px) {
      .metrics-grid { grid-template-columns: 1fr; }
      .header-actions { flex-direction: column; gap: 12px; align-items: flex-start; }
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
      this.store.dispatch(BacklogActions.loadBacklogItemById({ id: this.backlogId }));
      this.backlogItem$ = this.store.select(BacklogSelectors.selectBacklogItemById(this.backlogId));
    });
  }

  getCategoryLabel(category: number): string {
    return BacklogCategoryLabels[category] || 'Unknown';
  }

  navigateToEdit(): void {
    this.router.navigate(['/backlog', this.backlogId, 'edit']);
  }

  deleteItem(): void {
    if (confirm('Are you sure you want to delete this backlog item?')) {
      this.store.dispatch(BacklogActions.deleteBacklogItem({ id: this.backlogId }));
      this.router.navigate(['/backlog']);
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
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
