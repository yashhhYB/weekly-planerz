import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PlanningWeek } from '../../../../models';
import { AppStoreState } from '../../../../store';
import * as PlanningSelectors from '../../../../store/planning/planning.selectors';
import * as PlanningActions from '../../../../store/planning/planning.actions';

@Component({
  selector: 'app-planning-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="planning-detail-container">
      <div class="header-actions">
        <button class="btn btn-back" (click)="goBack()">← Back</button>
        <div class="actions">
          <button class="btn btn-primary" (click)="navigateToEdit()">Edit</button>
          <button class="btn btn-danger" (click)="deletePlanning()">Delete</button>
          <button class="btn btn-secondary" (click)="freezeWeek()">Freeze</button>
        </div>
      </div>

      <div *ngIf="loading$ | async" class="loading">
        <p>Loading planning week details...</p>
      </div>

      <div *ngIf="(loading$ | async) === false && (planningWeek$ | async) as planningWeek" class="week-details">
        <h1>Planning Week: {{ formatDate(planningWeek.weekStartDate) }}</h1>
        
        <div class="date-range">
          <p><strong>Week:</strong> {{ formatDate(planningWeek.weekStartDate) }} - {{ formatDate(planningWeek.weekEndDate) }}</p>
        </div>

        <div class="content-section">
          <h2>Goals</h2>
          <p>{{ planningWeek.goals }}</p>
        </div>

        <div class="content-section">
          <h2>Key Activities</h2>
          <p>{{ planningWeek.keyActivities }}</p>
        </div>

        <div *ngIf="planningWeek.reflection" class="content-section">
          <h2>Reflection</h2>
          <p>{{ planningWeek.reflection }}</p>
        </div>

        <div class="metrics">
          <div class="metric-card">
            <h3>Health Score</h3>
            <p class="metric-value">{{ planningWeek.healthScore }}/10</p>
          </div>
          <div class="metric-card">
            <h3>Productivity</h3>
            <p class="metric-value">{{ planningWeek.productivity }}%</p>
          </div>
        </div>

        <div class="timestamps">
          <p><small>Created: {{ formatDateTime(planningWeek.createdAt) }}</small></p>
          <p><small>Last Updated: {{ formatDateTime(planningWeek.updatedAt) }}</small></p>
        </div>
      </div>

      <div *ngIf="error$ | async as error" class="error-message">
        <p>{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .planning-detail-container {
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
      margin: 0 0 20px 0;
      color: #333;
    }

    h2 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #1976d2;
      border-bottom: 2px solid #1976d2;
      padding-bottom: 5px;
    }

    .date-range {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }

    .date-range p {
      margin: 0;
      color: #666;
    }

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

    .metrics {
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
      font-size: 28px;
      font-weight: bold;
    }

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
export class PlanningDetailComponent implements OnInit {
  planningWeek$: Observable<PlanningWeek | undefined>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  private planningId: string = '';

  constructor(
    private store: Store<AppStoreState>,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.planningWeek$ = new Observable();
    this.loading$ = this.store.select(PlanningSelectors.selectPlanningLoading);
    this.error$ = this.store.select(PlanningSelectors.selectPlanningError);
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.planningId = params['id'];
      this.planningWeek$ = this.store.select(PlanningSelectors.selectPlanningWeekById(this.planningId));
    });
  }

  navigateToEdit(): void {
    this.router.navigate(['/planning', this.planningId, 'edit']);
  }

  deletePlanning(): void {
    if (confirm('Are you sure you want to delete this planning week?')) {
      this.store.dispatch(PlanningActions.deletePlanningWeek({ id: this.planningId }));
    }
  }

  freezeWeek(): void {
    if (confirm('Are you sure you want to freeze this planning week?')) {
      this.store.dispatch(PlanningActions.freezePlanningWeek({ id: this.planningId }));
    }
  }

  goBack(): void {
    this.router.navigate(['/planning']);
  }

  formatDate(date: Date): string {
    return date ? date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : '';
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
