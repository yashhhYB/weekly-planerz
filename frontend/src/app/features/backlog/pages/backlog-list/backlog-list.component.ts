import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BacklogService } from '../../../../core/services';
import { BacklogItem, BacklogCategory, BacklogStatus } from '../../../../models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-backlog-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="backlog-list-container">
      <div class="header">
        <div>
          <h1>Backlog Items</h1>
          <p class="subtitle">Manage and organize your tasks</p>
        </div>
        <button (click)="navigateToCreate()" class="btn btn-primary">
          + New Item
        </button>
      </div>

      <div class="filter-section">
        <button
          *ngFor="let status of statuses"
          [class.active]="selectedStatus === status"
          (click)="filterByStatus(status)"
          class="filter-btn"
        >
          {{ status }}
        </button>
      </div>

      <div *ngIf="loading" class="loading">
        <p>Loading backlog items...</p>
      </div>

      <div *ngIf="!loading && filteredBacklogItems.length === 0" class="empty-state">
        <p>No backlog items found. Create your first item to get started!</p>
      </div>

      <div *ngIf="!loading && filteredBacklogItems.length > 0" class="backlog-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Est. Hours</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredBacklogItems" class="backlog-row">
              <td class="title" (click)="navigateToDetail(item.id)">{{ item.title }}</td>
              <td><span class="badge" [ngClass]="'category-' + item.category.toLowerCase()">{{ item.category }}</span></td>
              <td><span class="badge" [ngClass]="'status-' + item.status.toLowerCase()">{{ item.status }}</span></td>
              <td>
                <div class="priority-dots">
                  <span *ngFor="let i of [1,2,3,4,5]" class="dot" [class.filled]="i <= item.priority"></span>
                </div>
              </td>
              <td>{{ item.estimatedHours }}h</td>
              <td class="actions">
                <button class="btn-small" (click)="navigateToEdit(item.id)">Edit</button>
                <button class="btn-small danger" (click)="archiveItem(item.id)">Archive</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="error" class="error-message">
        <p>{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .backlog-list-container {
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    h1 {
      margin: 0;
      color: #333;
    }

    .subtitle {
      margin: 5px 0 0 0;
      color: #999;
      font-size: 14px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.3s;
    }

    .btn-primary {
      background: #1976d2;
      color: white;
    }

    .btn-primary:hover {
      background: #1565c0;
    }

    .filter-section {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 8px 16px;
      background: #f0f0f0;
      border: 1px solid #ddd;
      border-radius: 20px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.3s;
    }

    .filter-btn:hover {
      background: #e0e0e0;
    }

    .filter-btn.active {
      background: #1976d2;
      color: white;
      border-color: #1976d2;
    }

    .loading, .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .backlog-table {
      overflow-x: auto;
      border-radius: 8px;
      border: 1px solid #ddd;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
    }

    thead {
      background: #f5f5f5;
    }

    th {
      padding: 15px;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #ddd;
    }

    td {
      padding: 15px;
      border-bottom: 1px solid #eee;
    }

    .title {
      color: #1976d2;
      cursor: pointer;
      font-weight: 500;
    }

    .title:hover {
      text-decoration: underline;
    }

    .badge {
      display: inline-block;
      padding: 4px 8px;
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

    .priority-dots {
      display: flex;
      gap: 4px;
    }

    .dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ddd;
    }

    .dot.filled {
      background: #ff6b6b;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .btn-small {
      padding: 5px 10px;
      font-size: 12px;
      background: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 3px;
      cursor: pointer;
    }

    .btn-small:hover {
      background: #e0e0e0;
    }

    .btn-small.danger {
      background: #ffebee;
      color: #c62828;
      border-color: #ffcdd2;
    }

    .btn-small.danger:hover {
      background: #ffcdd2;
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
export class BacklogListComponent implements OnInit, OnDestroy {
  backlogItems: BacklogItem[] = [];
  filteredBacklogItems: BacklogItem[] = [];
  selectedStatus: string = 'All';
  statuses = ['All', 'Pending', 'InProgress', 'Completed', 'Archived'];
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private backlogService: BacklogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBacklogItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBacklogItems(): void {
    this.loading = true;
    this.error = null;
    this.backlogService.getAllBacklogItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.backlogItems = items;
          this.applyFilter();
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message || 'Failed to load backlog items';
          this.loading = false;
        }
      });
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.selectedStatus === 'All') {
      this.filteredBacklogItems = this.backlogItems;
    } else {
      this.filteredBacklogItems = this.backlogItems.filter(
        item => item.status === this.selectedStatus
      );
    }
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
      this.backlogService.archiveBacklogItem(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadBacklogItems();
          },
          error: (err) => {
            this.error = 'Failed to archive backlog item';
          }
        });
    }
  }
}
