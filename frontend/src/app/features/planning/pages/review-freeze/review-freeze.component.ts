import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import {
  Dashboard, PlanningWeek, WeekMember,
  BacklogCategoryLabels, BacklogCategory
} from '../../../../models';
import { WeekMemberService } from '../../../../core/services/week-member.service';
import { PlanningService } from '../../../../core/services/planning.service';
import { ToastService } from '../../../../core/services/toast.service';
import { UserContextService } from '../../../../core/services/user-context.service';

/** Represents a single freeze prerequisite condition */
interface FreezeCondition {
  label: string;
  met: boolean;
  detail: string;
}

/**
 * ReviewFreezeComponent
 * Displays a comprehensive review of the planning week before freezing.
 * Shows category budget vs planned breakdowns, member progress cards,
 * and a checklist of freeze conditions that must all be met before
 * the week plan can be locked.
 */

@Component({
  selector: 'app-review-freeze',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
          <div>
            <h1>Review & Freeze</h1>
            <p class="subtitle" *ngIf="week">{{ formatDate(week.startDate) }} &mdash; {{ formatDate(week.endDate) }}</p>
          </div>
        </div>
        <div class="header-actions">
          <a routerLink="/home" class="btn-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </a>
          <a [routerLink]="['/planning', weekId]" class="btn-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </a>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Loading review data...</div>

      <div *ngIf="!loading && dashboard && week" class="review-content">
        <!-- Overview Bar -->
        <div class="overview-bar">
          <div class="overview-stat">
            <span class="ov-val blue">{{ dashboard.members.length }}</span>
            <span class="ov-lbl">Members</span>
          </div>
          <div class="overview-stat">
            <span class="ov-val blue">{{ dashboard.totalPlannedHours.toFixed(1) }}h</span>
            <span class="ov-lbl">Total Planned</span>
          </div>
          <div class="overview-stat">
            <span class="ov-val" [class.green]="allSubmitted" [class.yellow]="!allSubmitted">
              {{ submittedCount }}/{{ dashboard.members.length }}
            </span>
            <span class="ov-lbl">Ready</span>
          </div>
          <div class="overview-stat">
            <span class="ov-val" [class.green]="week.isFrozen" [class.yellow]="!week.isFrozen">
              {{ week.isFrozen ? 'Frozen' : 'Open' }}
            </span>
            <span class="ov-lbl">Status</span>
          </div>
        </div>

        <!-- Category Summary Table -->
        <div class="section">
          <div class="section-title-row">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            <h2>Category Summary</h2>
          </div>
          <div class="table-wrapper">
            <table class="summary-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Budget %</th>
                  <th>Budget Hours</th>
                  <th>Planned Hours</th>
                  <th>Difference</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let cat of categoryRows">
                  <td>
                    <span class="cat-indicator" [style.background]="cat.color"></span>
                    {{ cat.label }}
                  </td>
                  <td>{{ cat.budgetPercent }}%</td>
                  <td>{{ cat.budgetHours.toFixed(1) }}h</td>
                  <td>{{ cat.plannedHours.toFixed(1) }}h</td>
                  <td [class.over]="cat.diff > 0" [class.under]="cat.diff < 0">
                    {{ cat.diff > 0 ? '+' : '' }}{{ cat.diff.toFixed(1) }}h
                  </td>
                  <td>
                    <span class="status-pill" [class.ok]="cat.withinBudget" [class.warn]="!cat.withinBudget">
                      <svg *ngIf="cat.withinBudget" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                      <svg *ngIf="!cat.withinBudget" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      {{ cat.withinBudget ? 'On Budget' : 'Over/Under' }}
                    </span>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Total</strong></td>
                  <td><strong>100%</strong></td>
                  <td><strong>{{ totalBudgetHours.toFixed(1) }}h</strong></td>
                  <td><strong>{{ dashboard.totalPlannedHours.toFixed(1) }}h</strong></td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Member Summary -->
        <div class="section">
          <div class="section-title-row">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <h2>Member Summary</h2>
          </div>
          <div class="member-cards">
            <div class="member-summary-card" *ngFor="let m of dashboard.members"
                 [class.ready]="m.hasSubmitted" [class.pending]="!m.hasSubmitted">
              <div class="ms-top">
                <div class="ms-avatar" [class.submitted]="m.hasSubmitted">
                  {{ m.name.charAt(0).toUpperCase() }}
                </div>
                <div class="ms-info">
                  <span class="ms-name">{{ m.name }}</span>
                  <span class="ms-status" [class.done]="m.hasSubmitted">
                    <svg *ngIf="m.hasSubmitted" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    <svg *ngIf="!m.hasSubmitted" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {{ m.hasSubmitted ? 'Ready' : 'Planning...' }}
                  </span>
                </div>
              </div>
              <div class="ms-metrics">
                <div class="ms-metric">
                  <span class="ms-val" [class.full]="m.plannedHours === 30" [class.not-full]="m.plannedHours !== 30">
                    {{ m.plannedHours.toFixed(1) }}h
                  </span>
                  <span class="ms-lbl">/ 30h</span>
                </div>
              </div>
              <div class="ms-bar">
                <div class="ms-bar-fill" [style.width.%]="(m.plannedHours / 30) * 100"
                     [class.full]="m.plannedHours === 30" [class.over]="m.plannedHours > 30"></div>
              </div>
            </div>
          </div>
          <div class="empty" *ngIf="dashboard.members.length === 0">No members assigned</div>
        </div>

        <!-- Freeze Conditions Checklist -->
        <div class="section freeze-section">
          <div class="section-title-row">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <h2>Freeze Conditions</h2>
          </div>
          <div class="conditions-list">
            <div class="condition-row" *ngFor="let c of freezeConditions" [class.met]="c.met" [class.unmet]="!c.met">
              <div class="cond-icon">
                <svg *ngIf="c.met" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"/><polyline points="16 8 10 16 7 13"/>
                </svg>
                <svg *ngIf="!c.met" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
              </div>
              <div class="cond-text">
                <span class="cond-label">{{ c.label }}</span>
                <span class="cond-detail">{{ c.detail }}</span>
              </div>
            </div>
          </div>

          <!-- Freeze Button -->
          <div class="freeze-action">
            <button class="btn-freeze-main" *ngIf="!week.isFrozen"
                    [disabled]="!canFreeze"
                    (click)="freezeWeek()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Freeze Week Plan
            </button>
            <div class="frozen-banner" *ngIf="week.isFrozen">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Plan is frozen — no further edits allowed
            </div>
          </div>
        </div>

        <!-- Task Details Table -->
        <div class="section" *ngIf="dashboard.tasks.length > 0">
          <div class="section-title-row">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <h2>All Assigned Tasks</h2>
          </div>
          <div class="table-wrapper">
            <table class="summary-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assigned To</th>
                  <th>Category</th>
                  <th>Planned Hours</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let t of dashboard.tasks">
                  <td class="task-name-cell">{{ t.taskTitle }}</td>
                  <td>{{ t.memberName }}</td>
                  <td>
                    <span class="cat-badge-sm" [ngClass]="'cat-' + getCategoryId(t.taskTitle)">
                      {{ t.memberName ? '' : '' }}
                    </span>
                    —
                  </td>
                  <td>{{ t.plannedHours.toFixed(1) }}h</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div *ngIf="error" class="error-bar">{{ error }}</div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 960px; margin: 0 auto; padding: 24px 0; }

    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .header-left { display: flex; align-items: center; gap: 14px; }
    .header-icon { width: 32px; height: 32px; color: var(--accent); }
    .page-header h1 { color: var(--text-heading); margin: 0 0 4px; font-size: 24px; font-weight: 700; }
    .subtitle { color: var(--text-secondary); margin: 0; font-size: 14px; }
    .header-actions { display: flex; gap: 8px; }
    .btn-back {
      color: var(--text-secondary); text-decoration: none; font-size: 13px; padding: 8px 14px;
      border: 1px solid var(--border); border-radius: 8px; display: flex; align-items: center; gap: 6px;
      transition: all 0.2s; background: none;
    }
    .btn-back:hover { background: var(--bg-card); color: var(--text-heading); border-color: var(--border-hover); }

    .loading { text-align: center; padding: 60px; color: var(--text-secondary); }

    /* Overview Bar */
    .overview-bar {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;
    }
    .overview-stat {
      background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px;
      padding: 18px; text-align: center;
    }
    .ov-val { font-size: 28px; font-weight: 700; display: block; margin-bottom: 4px; }
    .ov-val.blue { color: var(--accent); }
    .ov-val.green { color: var(--success); }
    .ov-val.yellow { color: #d29922; }
    .ov-lbl { font-size: 12px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }

    /* Section */
    .section {
      background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px;
      padding: 22px; margin-bottom: 16px;
    }
    .section-title-row {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--bg-tertiary);
    }
    .section-icon { width: 20px; height: 20px; color: var(--accent); flex-shrink: 0; }
    .section h2 { margin: 0; font-size: 16px; color: var(--text-heading); font-weight: 600; }

    /* Summary Table */
    .table-wrapper { overflow-x: auto; }
    .summary-table { width: 100%; border-collapse: collapse; }
    .summary-table th {
      text-align: left; padding: 10px 14px; color: var(--text-secondary); font-size: 12px;
      font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px;
      border-bottom: 1px solid var(--bg-tertiary);
    }
    .summary-table td {
      padding: 12px 14px; color: var(--text-primary); font-size: 14px;
      border-bottom: 1px solid rgba(33,38,45,0.6);
    }
    .summary-table tfoot td {
      border-top: 2px solid var(--border); border-bottom: none;
      color: var(--text-heading); font-size: 14px;
    }
    .cat-indicator {
      display: inline-block; width: 10px; height: 10px; border-radius: 50%;
      margin-right: 8px; vertical-align: middle;
    }
    .over { color: var(--danger); }
    .under { color: #d29922; }
    .status-pill {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;
    }
    .status-pill.ok { background: rgba(35,134,54,0.15); color: var(--success); }
    .status-pill.warn { background: rgba(210,153,34,0.15); color: #d29922; }

    /* Member Summary Cards */
    .member-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
    .member-summary-card {
      background: var(--bg-input); border: 1px solid var(--bg-tertiary); border-radius: 10px; padding: 16px;
      transition: border-color 0.2s;
    }
    .member-summary-card.ready { border-left: 3px solid var(--success); }
    .member-summary-card.pending { border-left: 3px solid #d29922; }
    .ms-top { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .ms-avatar {
      width: 36px; height: 36px; border-radius: 50%; background: var(--bg-tertiary);
      display: flex; align-items: center; justify-content: center;
      color: var(--text-primary); font-weight: 700; font-size: 15px; flex-shrink: 0;
    }
    .ms-avatar.submitted { background: var(--success); }
    .ms-info { display: flex; flex-direction: column; gap: 2px; }
    .ms-name { color: var(--text-heading); font-weight: 500; font-size: 14px; }
    .ms-status { font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; }
    .ms-status.done { color: var(--success); }
    .ms-metrics { margin-bottom: 8px; }
    .ms-metric { display: flex; align-items: baseline; gap: 4px; }
    .ms-val { font-size: 20px; font-weight: 700; color: var(--accent); }
    .ms-val.full { color: var(--success); }
    .ms-val.not-full { color: #d29922; }
    .ms-lbl { font-size: 13px; color: var(--text-secondary); }
    .ms-bar { height: 6px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden; }
    .ms-bar-fill { height: 100%; background: var(--accent); border-radius: 3px; transition: width 0.3s; }
    .ms-bar-fill.full { background: var(--success); }
    .ms-bar-fill.over { background: var(--danger); }

    /* Freeze Conditions */
    .freeze-section .conditions-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
    .condition-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px; border-radius: 8px; background: var(--bg-input); border: 1px solid var(--bg-tertiary);
    }
    .condition-row.met .cond-icon { color: var(--success); }
    .condition-row.unmet .cond-icon { color: var(--text-secondary); }
    .cond-text { display: flex; flex-direction: column; gap: 2px; }
    .cond-label { color: var(--text-primary); font-size: 14px; font-weight: 500; }
    .cond-detail { color: var(--text-secondary); font-size: 12px; }

    /* Freeze Button */
    .freeze-action { text-align: center; }
    .btn-freeze-main {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 14px 32px; border: none; border-radius: 10px;
      font-size: 16px; font-weight: 700; cursor: pointer;
      background: linear-gradient(135deg, #1f6feb, #388bfd); color: #fff;
      box-shadow: 0 4px 16px rgba(31,111,235,0.3);
      transition: all 0.25s;
    }
    .btn-freeze-main:hover:not(:disabled) {
      background: linear-gradient(135deg, #388bfd, #58a6ff);
      box-shadow: 0 6px 24px rgba(31,111,235,0.4);
      transform: translateY(-2px);
    }
    .btn-freeze-main:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
    .frozen-banner {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      padding: 16px; background: rgba(35,134,54,0.1); border: 1px solid rgba(35,134,54,0.3);
      border-radius: 10px; color: var(--success); font-weight: 600; font-size: 15px;
    }

    .task-name-cell { font-weight: 500; }
    .cat-badge-sm {
      font-size: 10px; padding: 2px 6px; border-radius: 8px; font-weight: 600;
    }
    .empty { text-align: center; padding: 24px; color: var(--text-secondary); }
    .error-bar {
      background: rgba(248,81,73,0.1); color: var(--danger); padding: 12px 16px;
      border-radius: 6px; margin-top: 16px; border: 1px solid rgba(248,81,73,0.4);
    }

    @media (max-width: 768px) {
      .overview-bar { grid-template-columns: repeat(2, 1fr); }
      .member-cards { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; gap: 12px; }
    }
  `]
})
export class ReviewFreezeComponent implements OnInit, OnDestroy {
  weekId = '';
  week: PlanningWeek | null = null;
  dashboard: Dashboard | null = null;
  loading = true;
  error: string | null = null;

  categoryRows: {
    label: string; color: string; budgetPercent: number;
    budgetHours: number; plannedHours: number; diff: number; withinBudget: boolean;
  }[] = [];
  totalBudgetHours = 0;
  freezeConditions: FreezeCondition[] = [];
  canFreeze = false;
  allSubmitted = false;
  submittedCount = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private weekMemberService: WeekMemberService,
    private planningService: PlanningService,
    private toast: ToastService,
    private userContext: UserContextService
  ) {}

  ngOnInit() {
    if (!this.userContext.isLead) {
      this.router.navigate(['/home']);
      return;
    }
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.weekId = params['id'];
      this.loadData();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.loading = true;
    forkJoin({
      week: this.planningService.getPlanningWeekById(this.weekId),
      dashboard: this.weekMemberService.getDashboard(this.weekId)
    }).subscribe({
      next: ({ week, dashboard }) => {
        this.week = week;
        this.dashboard = dashboard;
        this.computeSummaries();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load review data';
        this.loading = false;
      }
    });
  }

  private computeSummaries() {
    if (!this.week || !this.dashboard) return;

    const memberCount = this.dashboard.members.length;
    this.totalBudgetHours = memberCount * 30;

    // Category rows
    const cats = [
      {
        label: 'Client Focused', color: '#1f6feb',
        budgetPercent: this.week.clientPercent,
        plannedHours: this.dashboard.clientFocused.plannedHours
      },
      {
        label: 'Tech Debt', color: '#da3633',
        budgetPercent: this.week.techDebtPercent,
        plannedHours: this.dashboard.techDebt.plannedHours
      },
      {
        label: 'R&D', color: '#238636',
        budgetPercent: this.week.rndPercent,
        plannedHours: this.dashboard.rnD.plannedHours
      }
    ];
    this.categoryRows = cats.map(c => {
      const budgetHours = this.totalBudgetHours * (c.budgetPercent / 100);
      const diff = c.plannedHours - budgetHours;
      return {
        ...c, budgetHours, diff,
        withinBudget: Math.abs(diff) < 0.1
      };
    });

    // Member counts
    this.submittedCount = this.dashboard.members.filter(m => m.hasSubmitted).length;
    this.allSubmitted = this.submittedCount === memberCount && memberCount > 0;

    // Freeze conditions
    const allHave30h = this.dashboard.members.every(m => m.plannedHours === 30);
    const catBudgetsMatch = this.categoryRows.every(c => c.withinBudget);
    const hasMembers = memberCount > 0;

    this.freezeConditions = [
      {
        label: 'All members assigned',
        met: hasMembers,
        detail: hasMembers ? `${memberCount} member(s) in this week` : 'No members assigned yet'
      },
      {
        label: 'Every member has exactly 30h planned',
        met: allHave30h && hasMembers,
        detail: allHave30h ? 'All members at 30h' :
          `${this.dashboard.members.filter(m => m.plannedHours !== 30).length} member(s) not at 30h`
      },
      {
        label: 'All members marked as Ready',
        met: this.allSubmitted,
        detail: this.allSubmitted ? 'Everyone is ready' :
          `${memberCount - this.submittedCount} member(s) still planning`
      },
      {
        label: 'Category budgets match planned hours',
        met: catBudgetsMatch,
        detail: catBudgetsMatch ? 'All categories on budget' :
          `${this.categoryRows.filter(c => !c.withinBudget).length} category(s) off budget`
      }
    ];

    this.canFreeze = this.freezeConditions.every(c => c.met) && !this.week!.isFrozen;
  }

  freezeWeek() {
    if (!this.canFreeze) return;
    this.planningService.freezePlanningWeek(this.weekId).subscribe({
      next: (updatedWeek) => {
        this.toast.success('Week plan frozen successfully!');
        this.loadData();
      },
      error: (err) => this.toast.error(err?.message || 'Failed to freeze week')
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getCategoryId(title: string): number {
    return 1; // Default, category info comes from task data
  }
}
