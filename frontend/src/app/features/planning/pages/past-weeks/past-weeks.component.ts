import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { PlanningWeek, PlanningStatus } from '../../../../models';
import { AppStoreState } from '../../../../store';
import * as PlanningSelectors from '../../../../store/planning/planning.selectors';
import * as PlanningActions from '../../../../store/planning/planning.actions';

@Component({
  selector: 'app-past-weeks',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>📅 Past Weeks</h1>
          <p class="subtitle">Completed and archived planning weeks</p>
        </div>
        <a routerLink="/home" class="btn-back">← Back to Home</a>
      </div>

      <div class="filter-bar">
        <button class="filter-btn" [class.active]="filter === 'all'" (click)="filter = 'all'">All</button>
        <button class="filter-btn" [class.active]="filter === 'completed'" (click)="filter = 'completed'">Completed</button>
        <button class="filter-btn" [class.active]="filter === 'archived'" (click)="filter = 'archived'">Archived</button>
      </div>

      <div class="weeks-list" *ngIf="filteredWeeks$ | async as weeks">
        <a *ngFor="let w of weeks" [routerLink]="['/planning', w.id]" class="week-card">
          <div class="week-top">
            <span class="status-badge" [ngClass]="'s-' + w.status">{{ getStatusLabel(w.status) }}</span>
            <span *ngIf="w.isFrozen" class="frozen">🔒</span>
          </div>
          <div class="week-date">{{ formatDate(w.planningDate) }}</div>
          <div class="week-range">{{ formatDate(w.startDate) }} → {{ formatDate(w.endDate) }}</div>
          <div class="week-alloc">
            <span class="alloc-chip client">Client {{ w.clientPercent }}%</span>
            <span class="alloc-chip tech">Tech {{ w.techDebtPercent }}%</span>
            <span class="alloc-chip rnd">R&D {{ w.rndPercent }}%</span>
          </div>
        </a>
        <div class="empty" *ngIf="weeks.length === 0">
          <p>No past weeks found.</p>
          <p class="hint">Completed and archived weeks will appear here.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 900px; margin: 0 auto; padding: 24px 0; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .page-header h1 { color: var(--text-heading); margin: 0 0 4px; font-size: 24px; }
    .subtitle { color: var(--text-secondary); margin: 0; font-size: 14px; }
    .btn-back { color: var(--accent); text-decoration: none; font-size: 14px; padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; }
    .btn-back:hover { background: var(--bg-card); }

    .filter-bar { display: flex; gap: 8px; margin-bottom: 16px; }
    .filter-btn { background: var(--bg-tertiary); border: 1px solid var(--border); color: var(--text-secondary); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; }
    .filter-btn:hover { color: var(--text-primary); border-color: var(--text-muted); }
    .filter-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }

    .weeks-list { display: flex; flex-direction: column; gap: 10px; }
    .week-card { display: block; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 16px; text-decoration: none; transition: all 0.2s; }
    .week-card:hover { border-color: var(--border-hover); background: var(--bg-card-hover); }

    .week-top { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .status-badge { font-size: 11px; padding: 3px 10px; border-radius: 12px; font-weight: 600; }
    .s-1 { background: rgba(210,153,34,0.2); color: #d29922; }
    .s-2 { background: rgba(31,111,235,0.2); color: var(--accent); }
    .s-3 { background: rgba(35,134,54,0.2); color: var(--success); }
    .s-4 { background: rgba(139,148,158,0.2); color: var(--text-secondary); }
    .frozen { font-size: 14px; }

    .week-date { color: var(--text-heading); font-size: 18px; font-weight: 600; margin-bottom: 4px; }
    .week-range { color: var(--text-secondary); font-size: 13px; margin-bottom: 10px; }

    .week-alloc { display: flex; gap: 8px; }
    .alloc-chip { font-size: 11px; padding: 3px 8px; border-radius: 10px; font-weight: 500; }
    .alloc-chip.client { background: rgba(31,111,235,0.15); color: var(--accent); }
    .alloc-chip.tech { background: rgba(218,54,51,0.15); color: var(--danger); }
    .alloc-chip.rnd { background: rgba(35,134,54,0.15); color: var(--success); }

    .empty { text-align: center; padding: 60px; color: var(--text-secondary); }
    .empty p { margin: 0 0 4px; }
    .hint { font-size: 13px; }
  `]
})
export class PastWeeksComponent implements OnInit {
  filter: 'all' | 'completed' | 'archived' = 'all';
  filteredWeeks$!: Observable<PlanningWeek[]>;
  private allWeeks$!: Observable<PlanningWeek[]>;

  private statusLabels: Record<number, string> = {
    [PlanningStatus.Setup]: 'Setup',
    [PlanningStatus.InProgress]: 'In Progress',
    [PlanningStatus.Completed]: 'Completed',
    [PlanningStatus.Archived]: 'Archived'
  };

  constructor(private store: Store<AppStoreState>) {}

  ngOnInit() {
    this.store.dispatch(PlanningActions.loadPlanningWeeks({ skip: 0, take: 100 }));
    this.allWeeks$ = this.store.select(PlanningSelectors.selectAllPlanningWeeks).pipe(
      map(weeks => weeks.filter(w => w.status === PlanningStatus.Completed || w.status === PlanningStatus.Archived))
    );
    this.updateFiltered();
  }

  get filteredWeeksComputed$(): Observable<PlanningWeek[]> {
    return this.allWeeks$.pipe(
      map(weeks => {
        if (this.filter === 'completed') return weeks.filter(w => w.status === PlanningStatus.Completed);
        if (this.filter === 'archived') return weeks.filter(w => w.status === PlanningStatus.Archived);
        return weeks;
      })
    );
  }

  private updateFiltered() {
    this.filteredWeeks$ = this.filteredWeeksComputed$;
  }

  getStatusLabel(s: PlanningStatus): string {
    return this.statusLabels[s] || 'Unknown';
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
