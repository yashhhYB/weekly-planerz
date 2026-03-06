import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PlanningWeek, PlanningStatus } from '../../../../models';
import { AppStoreState } from '../../../../store';
import * as PlanningSelectors from '../../../../store/planning/planning.selectors';
import * as PlanningActions from '../../../../store/planning/planning.actions';
import { UserContextService } from '../../../../core/services/user-context.service';

@Component({
  selector: 'app-planning-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Planning Weeks</h1>
          <p class="page-desc">Create and manage your weekly planning cycles</p>
        </div>
        <button (click)="navigateToCreate()" class="btn-create">
          <span>+</span> New Week
        </button>
      </div>

      <div *ngIf="loading$ | async" class="loading">Loading planning weeks...</div>

      <div *ngIf="(loading$ | async) === false && (planningWeeks$ | async)?.length === 0" class="empty">
        <div class="empty-icon">📋</div>
        <p>No planning weeks yet</p>
        <small>Create your first planning week to get started</small>
      </div>

      <div *ngIf="(loading$ | async) === false && (planningWeeks$ | async)?.length! > 0" class="cards-grid">
        <div *ngFor="let week of planningWeeks$ | async" class="week-card" (click)="navigateToDetail(week.id)">
          <div class="card-top">
            <span class="status-badge" [ngClass]="'s-' + week.status">{{ getStatusLabel(week.status) }}</span>
            <span *ngIf="week.isFrozen" class="frozen-badge">🔒 Frozen</span>
          </div>
          <h3>{{ formatDate(week.planningDate) }}</h3>
          <p class="date-range">{{ formatDate(week.startDate) }} → {{ formatDate(week.endDate) }}</p>
          <div class="alloc-bars">
            <div class="alloc-row">
              <span class="alloc-label">Client</span>
              <div class="alloc-track"><div class="alloc-fill client" [style.width.%]="week.clientPercent"></div></div>
              <span class="alloc-val">{{ week.clientPercent }}%</span>
            </div>
            <div class="alloc-row">
              <span class="alloc-label">Tech Debt</span>
              <div class="alloc-track"><div class="alloc-fill techdebt" [style.width.%]="week.techDebtPercent"></div></div>
              <span class="alloc-val">{{ week.techDebtPercent }}%</span>
            </div>
            <div class="alloc-row">
              <span class="alloc-label">R&D</span>
              <div class="alloc-track"><div class="alloc-fill rnd" [style.width.%]="week.rndPercent"></div></div>
              <span class="alloc-val">{{ week.rndPercent }}%</span>
            </div>
          </div>
          <div class="card-footer">
            <button class="btn-edit" (click)="navigateToEdit(week.id, $event)" [disabled]="week.isFrozen">Edit</button>
          </div>
        </div>
      </div>

      <div *ngIf="error$ | async as error" class="error-bar">{{ error }}</div>
    </div>
  `,
  styles: [`
    .page { padding: 32px 0; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .page-header h1 { margin: 0 0 4px 0; font-size: 28px; color: var(--text-heading); }
    .page-desc { margin: 0; color: var(--text-secondary); font-size: 14px; }

    .btn-create {
      display: flex; align-items: center; gap: 6px;
      padding: 10px 20px; background: var(--success); color: white;
      border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;
      transition: background 0.2s;
    }
    .btn-create:hover { background: #2ea043; }
    .btn-create span { font-size: 18px; }

    .loading { text-align: center; padding: 60px; color: var(--text-secondary); }

    .empty { text-align: center; padding: 80px 20px; color: var(--text-secondary); }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }
    .empty p { margin: 0 0 4px 0; font-size: 18px; color: var(--text-primary); }
    .empty small { color: var(--text-secondary); }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }

    .week-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .week-card:hover { border-color: var(--border-hover); transform: translateY(-2px); }

    .card-top { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }

    .status-badge {
      padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
    }
    .s-1 { background: rgba(210,153,34,0.2); color: #d29922; }
    .s-2 { background: rgba(31,111,235,0.2); color: var(--accent); }
    .s-3 { background: rgba(35,134,54,0.2); color: var(--success); }
    .s-4 { background: rgba(139,148,158,0.2); color: var(--text-secondary); }
    .frozen-badge { padding: 3px 10px; border-radius: 20px; font-size: 12px; background: rgba(56,182,255,0.15); color: #79c0ff; }

    .week-card h3 { margin: 0 0 4px 0; color: var(--text-heading); font-size: 18px; }
    .date-range { margin: 0 0 16px 0; font-size: 13px; color: var(--text-secondary); }

    .alloc-bars { margin-bottom: 16px; }
    .alloc-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .alloc-label { min-width: 65px; font-size: 12px; color: var(--text-secondary); }
    .alloc-track { flex: 1; height: 6px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden; }
    .alloc-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
    .alloc-fill.client { background: var(--accent); }
    .alloc-fill.techdebt { background: var(--danger); }
    .alloc-fill.rnd { background: var(--success); }
    .alloc-val { min-width: 35px; text-align: right; font-size: 13px; color: var(--text-primary); font-weight: 600; }

    .card-footer { border-top: 1px solid var(--bg-tertiary); padding-top: 12px; }

    .btn-edit {
      padding: 6px 14px; background: var(--bg-tertiary); color: var(--text-primary);
      border: 1px solid var(--border); border-radius: 6px; cursor: pointer; font-size: 12px;
      transition: all 0.2s;
    }
    .btn-edit:hover:not(:disabled) { background: var(--border); border-color: var(--border-hover); }
    .btn-edit:disabled { opacity: 0.4; cursor: not-allowed; }

    .error-bar { background: rgba(248,81,73,0.1); color: var(--danger); padding: 12px 16px; border-radius: 6px; margin-top: 16px; border: 1px solid rgba(248,81,73,0.4); }
  `]
})
export class PlanningListComponent implements OnInit {
  planningWeeks$: Observable<PlanningWeek[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  private statusLabels: Record<number, string> = {
    [PlanningStatus.Setup]: 'Setup',
    [PlanningStatus.InProgress]: 'In Progress',
    [PlanningStatus.Completed]: 'Completed',
    [PlanningStatus.Archived]: 'Archived'
  };

  constructor(
    private store: Store<AppStoreState>,
    private router: Router,
    private userContext: UserContextService
  ) {
    this.planningWeeks$ = this.store.select(PlanningSelectors.selectAllPlanningWeeks);
    this.loading$ = this.store.select(PlanningSelectors.selectPlanningLoading);
    this.error$ = this.store.select(PlanningSelectors.selectPlanningError);
  }

  ngOnInit(): void {
    // Only leads can access the planning list page
    if (!this.userContext.isLead) {
      this.router.navigate(['/home']);
      return;
    }
    this.store.dispatch(PlanningActions.loadPlanningWeeks({ skip: 0, take: 50 }));
  }

  getStatusLabel(status: PlanningStatus): string {
    return this.statusLabels[status] || 'Unknown';
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
