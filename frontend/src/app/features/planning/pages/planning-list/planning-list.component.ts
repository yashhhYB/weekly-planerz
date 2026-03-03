import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PlanningWeek } from '../../../../models';
import { AppStoreState } from '../../../../store';
import * as PlanningSelectors from '../../../../store/planning/planning.selectors';
import * as PlanningActions from '../../../../store/planning/planning.actions';

@Component({
  selector: 'app-planning-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="planning-list-container">
      <div class="header">
        <h1>Planning Weeks</h1>
        <button (click)="navigateToCreate()" class="btn btn-primary">
          + New Planning Week
        </button>
      </div>

      <div *ngIf="loading$ | async" class="loading">
        <p>Loading planning weeks...</p>
      </div>

      <div *ngIf="(loading$ | async) === false && (planningWeeks$ | async)?.length === 0" class="empty-state">
        <p>No planning weeks found. Create your first planning week to get started!</p>
      </div>

      <div *ngIf="(loading$ | async) === false && (planningWeeks$ | async)?.length! > 0" class="planning-grid">
        <div *ngFor="let week of planningWeeks$ | async" class="planning-card" (click)="navigateToDetail(week.id)">
          <h3>{{ formatDate(week.weekStartDate) }}</h3>
          <p class="week-range">{{ formatDate(week.weekStartDate) }} - {{ formatDate(week.weekEndDate) }}</p>
          <div class="metrics">
            <div class="metric">
              <span class="label">Health Score:</span>
              <span class="value">{{ week.healthScore }}/10</span>
            </div>
            <div class="metric">
              <span class="label">Productivity:</span>
              <span class="value">{{ week.productivity }}%</span>
            </div>
          </div>
          <button class="btn btn-small" (click)="navigateToEdit(week.id, $event)">Edit</button>
        </div>
      </div>

      <div *ngIf="error$ | async as error" class="error-message">
        <p>{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .planning-list-container {
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

    .btn-small {
      padding: 5px 10px;
      font-size: 12px;
      background: #f0f0f0;
      border: 1px solid #ccc;
    }

    .btn-small:hover {
      background: #e0e0e0;
    }

    .loading, .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .planning-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .planning-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s;
      background: white;
    }

    .planning-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }

    .planning-card h3 {
      margin: 0 0 10px 0;
      color: #1976d2;
    }

    .week-range {
      font-size: 12px;
      color: #999;
      margin-bottom: 15px;
    }

    .metrics {
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }

    .metric {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 14px;
    }

    .label {
      color: #666;
      font-weight: 500;
    }

    .value {
      color: #1976d2;
      font-weight: bold;
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
export class PlanningListComponent implements OnInit {
  planningWeeks$: Observable<PlanningWeek[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(
    private store: Store<AppStoreState>,
    private router: Router
  ) {
    this.planningWeeks$ = this.store.select(PlanningSelectors.selectAllPlanningWeeks);
    this.loading$ = this.store.select(PlanningSelectors.selectPlanningLoading);
    this.error$ = this.store.select(PlanningSelectors.selectPlanningError);
  }

  ngOnInit(): void {
    this.store.dispatch(PlanningActions.loadPlanningWeeks({ skip: 0, take: 50 }));
  }

  formatDate(date: Date): string {
    return date ? date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : '';
  }

  navigateToCreate(): void {
    this.router.navigate(['/planning/create']);
  }

  navigateToDetail(id: string): void {
    this.router.navigate(['/planning', id]);
  }

  navigateToEdit(id: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/planning', id, 'edit']);
  }
}
