import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Dashboard } from '../../../../models';
import { WeekMemberService } from '../../../../core/services/week-member.service';
import { PlanningService } from '../../../../core/services/planning.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-lead-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>📊 Lead Dashboard</h1>
          <p class="subtitle" *ngIf="dashboard">{{ dashboard.weekLabel }}</p>
        </div>
        <div class="header-actions">
          <a [routerLink]="['/planning', weekId]" class="btn-back">← Back to Week</a>
          <a routerLink="/home" class="btn-back">🏠 Home</a>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Loading dashboard...</div>

      <div *ngIf="!loading && dashboard" class="dashboard-content">
        <!-- Status & Actions Bar -->
        <div class="status-bar">
          <div class="status-info">
            <span class="status-badge" [ngClass]="'st-' + dashboard.status">
              {{ getStatusLabel(dashboard.status) }}
            </span>
            <span class="frozen-badge" *ngIf="dashboard.isFrozen">🔒 Frozen</span>
          </div>
          <div class="status-actions">
            <button class="btn-action freeze" *ngIf="!dashboard.isFrozen && dashboard.status <= 1" (click)="freezeWeek()">
              🔒 Freeze Week
            </button>
            <button class="btn-action start" *ngIf="dashboard.status === 0" (click)="startWeek()">
              ▶ Start Week
            </button>
            <button class="btn-action complete" *ngIf="dashboard.status === 1" (click)="completeWeek()">
              ✅ Complete Week
            </button>
          </div>
        </div>

        <!-- Metrics Row -->
        <div class="metrics-row">
          <div class="metric-card">
            <div class="metric-value blue">{{ dashboard.totalPlannedHours.toFixed(1) }}h</div>
            <div class="metric-label">Total Planned</div>
          </div>
          <div class="metric-card">
            <div class="metric-value green">{{ dashboard.totalActualHours.toFixed(1) }}h</div>
            <div class="metric-label">Total Actual</div>
          </div>
          <div class="metric-card">
            <div class="metric-value" [class.green]="dashboard.completionPercent >= 80" [class.yellow]="dashboard.completionPercent >= 50 && dashboard.completionPercent < 80" [class.red]="dashboard.completionPercent < 50">
              {{ dashboard.completionPercent.toFixed(0) }}%
            </div>
            <div class="metric-label">Completion</div>
          </div>
          <div class="metric-card">
            <div class="metric-value blue">{{ dashboard.members.length }}</div>
            <div class="metric-label">Team Members</div>
          </div>
        </div>

        <!-- Category Breakdown -->
        <div class="section">
          <h2>Category Distribution</h2>
          <div class="cat-grid">
            <div class="cat-card">
              <div class="cat-header">
                <span class="cat-dot" style="background: #1f6feb;"></span>
                <span class="cat-title">Client Focused</span>
                <span class="cat-pct">{{ dashboard.clientFocused.allocatedPercent }}%</span>
              </div>
              <div class="cat-hours">
                <span>Planned: {{ dashboard.clientFocused.plannedHours.toFixed(1) }}h</span>
                <span>Actual: {{ dashboard.clientFocused.actualHours.toFixed(1) }}h</span>
              </div>
              <div class="cat-bar-track"><div class="cat-bar-fill" style="background: #1f6feb;" [style.width.%]="dashboard.clientFocused.allocatedPercent"></div></div>
            </div>
            <div class="cat-card">
              <div class="cat-header">
                <span class="cat-dot" style="background: #da3633;"></span>
                <span class="cat-title">Tech Debt</span>
                <span class="cat-pct">{{ dashboard.techDebt.allocatedPercent }}%</span>
              </div>
              <div class="cat-hours">
                <span>Planned: {{ dashboard.techDebt.plannedHours.toFixed(1) }}h</span>
                <span>Actual: {{ dashboard.techDebt.actualHours.toFixed(1) }}h</span>
              </div>
              <div class="cat-bar-track"><div class="cat-bar-fill" style="background: #da3633;" [style.width.%]="dashboard.techDebt.allocatedPercent"></div></div>
            </div>
            <div class="cat-card">
              <div class="cat-header">
                <span class="cat-dot" style="background: #238636;"></span>
                <span class="cat-title">R&D</span>
                <span class="cat-pct">{{ dashboard.rnD.allocatedPercent }}%</span>
              </div>
              <div class="cat-hours">
                <span>Planned: {{ dashboard.rnD.plannedHours.toFixed(1) }}h</span>
                <span>Actual: {{ dashboard.rnD.actualHours.toFixed(1) }}h</span>
              </div>
              <div class="cat-bar-track"><div class="cat-bar-fill" style="background: #238636;" [style.width.%]="dashboard.rnD.allocatedPercent"></div></div>
            </div>
          </div>
        </div>

        <!-- Member Progress -->
        <div class="section">
          <h2>Member Progress</h2>
          <div class="member-list">
            <div class="member-row" *ngFor="let m of dashboard.members" (click)="openMemberBoard(m)" [class.clickable]="true">
              <div class="member-left">
                <div class="avatar">{{ m.name.charAt(0).toUpperCase() }}</div>
                <div class="member-info">
                  <span class="member-name">{{ m.name }}</span>
                  <span class="member-status" [class.submitted]="m.hasSubmitted">
                    {{ m.hasSubmitted ? '✅ Submitted' : '⏳ Pending' }}
                  </span>
                </div>
              </div>
              <div class="member-right">
                <div class="member-hours">
                  <span>{{ m.plannedHours.toFixed(1) }}h planned</span>
                  <span class="sep">→</span>
                  <span>{{ m.actualHours.toFixed(1) }}h actual</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill" [style.width.%]="m.progressPercent" [class.high]="m.progressPercent >= 80"></div>
                </div>
                <span class="progress-pct">{{ m.progressPercent.toFixed(0) }}%</span>
                <span class="view-link">View →</span>
              </div>
            </div>
            <div class="empty" *ngIf="dashboard.members.length === 0">No members assigned to this week</div>
          </div>
        </div>

        <!-- Task Progress Table -->
        <div class="section" *ngIf="dashboard.tasks.length > 0">
          <h2>Task Progress</h2>
          <div class="table-wrapper">
            <table class="task-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Member</th>
                  <th>Planned</th>
                  <th>Actual</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let t of dashboard.tasks">
                  <td class="task-name">{{ t.taskTitle }}</td>
                  <td>{{ t.memberName }}</td>
                  <td>{{ t.plannedHours.toFixed(1) }}h</td>
                  <td>{{ t.actualHours.toFixed(1) }}h</td>
                  <td>
                    <div class="cell-progress">
                      <div class="mini-track"><div class="mini-fill" [style.width.%]="t.progressPercent"></div></div>
                      <span>{{ t.progressPercent }}%</span>
                    </div>
                  </td>
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
    .page-container { max-width: 1000px; margin: 0 auto; padding: 24px 0; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h1 { color: #f0f6fc; margin: 0 0 4px; font-size: 24px; }
    .subtitle { color: #8b949e; margin: 0; font-size: 14px; }
    .header-actions { display: flex; gap: 8px; }
    .btn-back { color: #58a6ff; text-decoration: none; font-size: 14px; padding: 8px 16px; border: 1px solid #30363d; border-radius: 8px; }
    .btn-back:hover { background: #161b22; }
    .loading { text-align: center; padding: 60px; color: #8b949e; }

    .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .metric-card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px; text-align: center; }
    .metric-value { font-size: 32px; font-weight: 700; margin-bottom: 4px; }
    .metric-value.blue { color: #58a6ff; }
    .metric-value.green { color: #3fb950; }
    .metric-value.yellow { color: #d29922; }
    .metric-value.red { color: #f85149; }
    .metric-label { font-size: 13px; color: #8b949e; text-transform: uppercase; letter-spacing: 0.5px; }

    .section { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px; margin-bottom: 16px; }
    .section h2 { margin: 0 0 16px; font-size: 16px; color: #f0f6fc; padding-bottom: 10px; border-bottom: 1px solid #21262d; }

    .cat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .cat-card { background: #0d1117; border: 1px solid #21262d; border-radius: 8px; padding: 14px; }
    .cat-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .cat-dot { width: 10px; height: 10px; border-radius: 50%; }
    .cat-title { color: #e1e4e8; font-weight: 500; font-size: 14px; flex: 1; }
    .cat-pct { color: #8b949e; font-size: 14px; font-weight: 600; }
    .cat-hours { display: flex; justify-content: space-between; font-size: 12px; color: #8b949e; margin-bottom: 8px; }
    .cat-bar-track { height: 6px; background: #21262d; border-radius: 3px; overflow: hidden; }
    .cat-bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }

    .member-list { display: flex; flex-direction: column; gap: 10px; }
    .member-row { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #0d1117; border: 1px solid #21262d; border-radius: 8px; }
    .member-left { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 38px; height: 38px; border-radius: 50%; background: #30363d; display: flex; align-items: center; justify-content: center; color: #e1e4e8; font-weight: 700; font-size: 16px; }
    .member-info { display: flex; flex-direction: column; gap: 2px; }
    .member-name { color: #f0f6fc; font-weight: 500; font-size: 14px; }
    .member-status { font-size: 12px; color: #8b949e; }
    .member-status.submitted { color: #3fb950; }
    .member-right { display: flex; align-items: center; gap: 12px; }
    .member-hours { font-size: 13px; color: #8b949e; display: flex; gap: 6px; }
    .sep { color: #484f58; }
    .progress-track { width: 100px; height: 6px; background: #21262d; border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: #1f6feb; border-radius: 3px; transition: width 0.3s; }
    .progress-fill.high { background: #238636; }
    .progress-pct { font-size: 13px; color: #e1e4e8; font-weight: 600; min-width: 40px; text-align: right; }

    .table-wrapper { overflow-x: auto; }
    .task-table { width: 100%; border-collapse: collapse; }
    .task-table th { text-align: left; padding: 10px 12px; color: #8b949e; font-size: 12px; font-weight: 600; text-transform: uppercase; border-bottom: 1px solid #21262d; }
    .task-table td { padding: 10px 12px; color: #e1e4e8; font-size: 14px; border-bottom: 1px solid #161b22; }
    .task-name { font-weight: 500; }
    .cell-progress { display: flex; align-items: center; gap: 8px; }
    .mini-track { width: 60px; height: 5px; background: #21262d; border-radius: 3px; overflow: hidden; }
    .mini-fill { height: 100%; background: #1f6feb; border-radius: 3px; }

    .empty { text-align: center; padding: 24px; color: #8b949e; }
    .error-bar { background: rgba(248,81,73,0.1); color: #f85149; padding: 12px 16px; border-radius: 6px; margin-top: 16px; border: 1px solid rgba(248,81,73,0.4); }

    .status-bar { display: flex; justify-content: space-between; align-items: center; background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 14px 18px; margin-bottom: 16px; }
    .status-info { display: flex; align-items: center; gap: 10px; }
    .status-badge { padding: 5px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .st-0 { background: rgba(210,153,34,0.15); color: #d29922; }
    .st-1 { background: rgba(31,111,235,0.15); color: #58a6ff; }
    .st-2 { background: rgba(35,134,54,0.15); color: #3fb950; }
    .st-3 { background: rgba(72,79,88,0.15); color: #8b949e; }
    .frozen-badge { font-size: 12px; color: #f0c060; padding: 4px 10px; background: rgba(240,192,96,0.1); border-radius: 20px; }
    .status-actions { display: flex; gap: 8px; }
    .btn-action { padding: 8px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-action.freeze { background: rgba(240,192,96,0.15); color: #f0c060; border: 1px solid rgba(240,192,96,0.3); }
    .btn-action.freeze:hover { background: rgba(240,192,96,0.25); }
    .btn-action.start { background: rgba(31,111,235,0.15); color: #58a6ff; border: 1px solid rgba(31,111,235,0.3); }
    .btn-action.start:hover { background: rgba(31,111,235,0.25); }
    .btn-action.complete { background: rgba(35,134,54,0.15); color: #3fb950; border: 1px solid rgba(35,134,54,0.3); }
    .btn-action.complete:hover { background: rgba(35,134,54,0.25); }

    .member-row.clickable { cursor: pointer; transition: border-color 0.2s; }
    .member-row.clickable:hover { border-color: #58a6ff; }
    .view-link { color: #58a6ff; font-size: 13px; font-weight: 500; margin-left: 8px; }

    @media (max-width: 768px) {
      .metrics-row { grid-template-columns: repeat(2, 1fr); }
      .cat-grid { grid-template-columns: 1fr; }
      .member-row { flex-direction: column; align-items: flex-start; gap: 10px; }
    }
  `]
})
export class LeadDashboardComponent implements OnInit, OnDestroy {
  weekId = '';
  dashboard: Dashboard | null = null;
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private weekMemberService: WeekMemberService,
    private planningService: PlanningService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.weekId = params['id'];
      this.loadDashboard();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard() {
    this.loading = true;
    this.weekMemberService.getDashboard(this.weekId).subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load dashboard';
        this.loading = false;
      }
    });
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 0: return 'Setup';
      case 1: return 'In Progress';
      case 2: return 'Completed';
      case 3: return 'Archived';
      default: return 'Unknown';
    }
  }

  openMemberBoard(m: any) {
    if (m.weekMemberId) {
      this.router.navigate(['/planning', this.weekId, 'board', m.weekMemberId]);
    }
  }

  freezeWeek() {
    this.planningService.freezePlanningWeek(this.weekId).subscribe({
      next: () => {
        this.toast.success('Week frozen successfully');
        this.loadDashboard();
      },
      error: (err) => this.toast.error(err?.message || 'Failed to freeze week')
    });
  }

  startWeek() {
    this.planningService.startPlanningWeek(this.weekId).subscribe({
      next: () => {
        this.toast.success('Week started successfully');
        this.loadDashboard();
      },
      error: (err) => this.toast.error(err?.message || 'Failed to start week')
    });
  }

  completeWeek() {
    this.planningService.completePlanningWeek(this.weekId).subscribe({
      next: () => {
        this.toast.success('Week completed successfully');
        this.loadDashboard();
      },
      error: (err) => this.toast.error(err?.message || 'Failed to complete week')
    });
  }
}
