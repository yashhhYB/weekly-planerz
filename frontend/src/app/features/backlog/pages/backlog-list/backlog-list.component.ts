import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BacklogItem, BacklogCategory, BacklogCategoryLabels, UserRole } from '../../../../models';
import { AppStoreState } from '../../../../store';
import * as BacklogSelectors from '../../../../store/backlog/backlog.selectors';
import * as BacklogActions from '../../../../store/backlog/backlog.actions';
import { UserContextService } from '../../../../core/services/user-context.service';

@Component({
  selector: 'app-backlog-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Backlog Items</h1>
          <p class="page-desc">Manage and organize your tasks</p>
        </div>
        <button (click)="navigateToCreate()" class="btn-create"><span>+</span> New Item</button>
      </div>

      <div class="toolbar">
        <div class="filters">
          <button *ngFor="let cat of categoryFilters" [class.active]="selectedCategory === cat.value" (click)="filterByCategory(cat.value)" class="filter-btn">{{ cat.label }}</button>
          <button [class.active]="showArchived" (click)="toggleArchived()" class="filter-btn archive-filter">{{ showArchived ? 'Hide Archived' : 'Show Archived' }}</button>
        </div>
        <div class="search-box">
          <input type="text" placeholder="Search items..." (input)="onSearch($event)" />
        </div>
      </div>

      <div *ngIf="loading$ | async" class="loading">Loading backlog items...</div>

      <div *ngIf="(loading$ | async) === false && (filteredItems$ | async)?.length === 0" class="empty">
        <div class="empty-icon">📝</div>
        <p>No backlog items found</p>
        <small>Create your first item to get started</small>
      </div>

      <div *ngIf="(loading$ | async) === false && (filteredItems$ | async)?.length! > 0" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Est. Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredItems$ | async" [class.archived]="item.isArchived">
              <td class="title-cell" (click)="navigateToDetail(item.id)">{{ item.title }}</td>
              <td><span class="cat-badge" [ngClass]="'c-' + item.category">{{ getCategoryLabel(item.category) }}</span></td>
              <td>{{ item.estimatedHours }}h</td>
              <td>
                <span *ngIf="item.isArchived" class="status-badge archived">Archived</span>
                <span *ngIf="!item.isArchived" class="status-badge active">Active</span>
              </td>
              <td class="actions">
                <button class="btn-sm" (click)="navigateToEdit(item.id)" [disabled]="item.isArchived">Edit</button>
                <button *ngIf="!item.isArchived && isLead" class="btn-sm danger" (click)="archiveItem(item.id)">Archive</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="error$ | async as error" class="error-bar">{{ error }}</div>
    </div>
  `,
  styles: [`
    .page { padding: 32px 0; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-header h1 { margin: 0 0 4px 0; font-size: 28px; color: var(--text-heading); }
    .page-desc { margin: 0; color: var(--text-secondary); font-size: 14px; }

    .btn-create {
      display: flex; align-items: center; gap: 6px;
      padding: 10px 20px; background: var(--success); color: white;
      border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;
      transition: all 0.2s;
    }
    .btn-create:hover { filter: brightness(1.15); }
    .btn-create span { font-size: 18px; }

    .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
    .filters { display: flex; gap: 8px; flex-wrap: wrap; }

    .filter-btn {
      padding: 6px 14px; background: var(--bg-tertiary); color: var(--text-primary);
      border: 1px solid var(--border); border-radius: 20px; cursor: pointer; font-size: 13px;
      transition: all 0.2s;
    }
    .filter-btn:hover { border-color: var(--border-hover); }
    .filter-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
    .archive-filter.active { background: var(--text-muted); border-color: var(--text-muted); }

    .search-box input {
      padding: 8px 14px; background: var(--bg-input); color: var(--text-primary);
      border: 1px solid var(--border); border-radius: 6px; font-size: 13px; width: 220px;
      transition: border-color 0.2s;
    }
    .search-box input:focus { outline: none; border-color: var(--border-hover); }
    .search-box input::placeholder { color: var(--text-muted); }

    .loading { text-align: center; padding: 60px; color: var(--text-secondary); }

    .empty { text-align: center; padding: 80px 20px; color: var(--text-secondary); }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }
    .empty p { margin: 0 0 4px 0; font-size: 18px; color: var(--text-primary); }
    .empty small { color: var(--text-secondary); }

    .table-wrap {
      overflow-x: auto; border-radius: 8px;
      border: 1px solid var(--border);
    }

    table { width: 100%; border-collapse: collapse; background: var(--bg-card); }
    thead { background: var(--bg-tertiary); }
    th { padding: 12px 16px; text-align: left; font-weight: 600; color: var(--text-secondary); font-size: 13px; border-bottom: 1px solid var(--border); }
    td { padding: 12px 16px; border-bottom: 1px solid var(--bg-tertiary); color: var(--text-primary); font-size: 14px; }

    .title-cell { color: var(--accent); cursor: pointer; font-weight: 500; }
    .title-cell:hover { text-decoration: underline; }

    tr.archived { opacity: 0.5; }

    .cat-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .c-1 { background: rgba(31,111,235,0.15); color: var(--accent); }
    .c-2 { background: rgba(218,54,51,0.15); color: var(--danger); }
    .c-3 { background: rgba(35,134,54,0.15); color: var(--success); }

    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-badge.active { background: rgba(35,134,54,0.2); color: var(--success); }
    .status-badge.archived { background: rgba(139,148,158,0.2); color: var(--text-secondary); }

    .actions { display: flex; gap: 6px; }

    .btn-sm {
      padding: 4px 10px; font-size: 12px; background: var(--bg-tertiary); color: var(--text-primary);
      border: 1px solid var(--border); border-radius: 6px; cursor: pointer;
      transition: all 0.2s;
    }
    .btn-sm:hover:not(:disabled) { background: var(--border); border-color: var(--border-hover); }
    .btn-sm:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-sm.danger { background: rgba(248,81,73,0.1); color: var(--danger); border-color: rgba(248,81,73,0.3); }
    .btn-sm.danger:hover { background: rgba(248,81,73,0.2); }

    .error-bar { background: rgba(248,81,73,0.1); color: var(--danger); padding: 12px 16px; border-radius: 6px; margin-top: 16px; border: 1px solid rgba(248,81,73,0.4); }
  `]
})
export class BacklogListComponent implements OnInit {
  backlogItems$: Observable<BacklogItem[]>;
  filteredItems$: Observable<BacklogItem[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  selectedCategory: number = 0;
  showArchived = false;
  searchTerm = '';
  isLead = false;

  categoryFilters = [
    { value: 0, label: 'All' },
    { value: BacklogCategory.ClientFocused, label: 'Client Focused' },
    { value: BacklogCategory.TechDebt, label: 'Tech Debt' },
    { value: BacklogCategory.RnD, label: 'R&D' }
  ];

  constructor(
    private store: Store<AppStoreState>,
    private router: Router,
    private userContext: UserContextService
  ) {
    this.backlogItems$ = this.store.select(BacklogSelectors.selectAllBacklogItems);
    this.loading$ = this.store.select(BacklogSelectors.selectBacklogLoading);
    this.error$ = this.store.select(BacklogSelectors.selectBacklogError);
    this.filteredItems$ = this.backlogItems$.pipe(
      map(items => items.filter(i => !i.isArchived))
    );
  }

  ngOnInit(): void {
    this.store.dispatch(BacklogActions.loadBacklogItems({ skip: 0, take: 50 }));
    this.userContext.currentUser$.subscribe(user => {
      this.isLead = user?.role === UserRole.TeamLead;
    });
  }

  getCategoryLabel(category: BacklogCategory): string {
    return BacklogCategoryLabels[category] || 'Unknown';
  }

  filterByCategory(category: number): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  toggleArchived(): void {
    this.showArchived = !this.showArchived;
    this.applyFilters();
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredItems$ = this.backlogItems$.pipe(
      map(items => {
        let filtered = items;
        if (!this.showArchived) {
          filtered = filtered.filter(i => !i.isArchived);
        }
        if (this.selectedCategory > 0) {
          filtered = filtered.filter(i => i.category === this.selectedCategory);
        }
        if (this.searchTerm) {
          filtered = filtered.filter(i => i.title.toLowerCase().includes(this.searchTerm));
        }
        return filtered;
      })
    );
  }

  navigateToCreate(): void {
    this.router.navigate(['/backlog/create']);
  }

  navigateToDetail(id: string): void {
    this.router.navigate(['/backlog', id]);
  }

  navigateToEdit(id: string): void {
    this.router.navigate(['/backlog', id, 'edit']);
  }

  archiveItem(id: string): void {
    if (confirm('Archive this backlog item?')) {
      this.store.dispatch(BacklogActions.archiveBacklogItem({ id }));
    }
  }
}
