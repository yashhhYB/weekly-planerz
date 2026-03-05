import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { PlanningWeek, PlanningStatus, WeekMember, TeamMember } from '../../../../models';
import { AppStoreState } from '../../../../store';
import * as PlanningSelectors from '../../../../store/planning/planning.selectors';
import * as PlanningActions from '../../../../store/planning/planning.actions';
import * as TeamSelectors from '../../../../store/team/team.selectors';
import * as TeamActions from '../../../../store/team/team.actions';
import { WeekMemberService } from '../../../../core/services/week-member.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-planning-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <div class="header-actions">
        <button class="btn-back" (click)="goBack()">← Back to list</button>
        <div class="actions">
          <button class="btn-edit" (click)="navigateToEdit()" [disabled]="(planningWeek$ | async)?.isFrozen">Edit</button>
          <button class="btn-freeze" (click)="freezeWeek()" [disabled]="(planningWeek$ | async)?.isFrozen">
            {{ (planningWeek$ | async)?.isFrozen ? '🔒 Frozen' : '🔒 Freeze' }}
          </button>
          <button class="btn-danger" (click)="deletePlanning()">Delete</button>
        </div>
      </div>

      <div *ngIf="loading$ | async" class="loading">Loading planning week details...</div>

      <div *ngIf="(loading$ | async) === false && (planningWeek$ | async) as planningWeek" class="detail-content">
        <h1>{{ formatDate(planningWeek.planningDate) }}</h1>

        <div class="status-row">
          <span class="status-badge" [ngClass]="'s-' + planningWeek.status">{{ getStatusLabel(planningWeek.status) }}</span>
          <span *ngIf="planningWeek.isFrozen" class="frozen-badge">🔒 Frozen</span>
          <span class="date-range">{{ formatDate(planningWeek.startDate) }} → {{ formatDate(planningWeek.endDate) }}</span>
        </div>

        <div class="transition-bar">
          <button *ngIf="planningWeek.status === 1" class="btn-start" (click)="startWeek()">▶ Start Week</button>
          <button *ngIf="planningWeek.status === 2" class="btn-complete" (click)="completeWeek()">✓ Complete Week</button>
          <button *ngIf="planningWeek.status === 3" class="btn-archive" (click)="archiveWeek()">📦 Archive Week</button>
          <span *ngIf="planningWeek.status === 4" class="archived-label">This week has been archived</span>
        </div>

        <div class="section">
          <h2>Category Allocation <span class="sub">(30h total)</span></h2>
          <div class="alloc-grid">
            <div class="alloc-card">
              <div class="alloc-icon" style="background:rgba(31,111,235,0.15);color:#58a6ff;">📊</div>
              <div class="alloc-info">
                <span class="alloc-label">Client Focused</span>
                <span class="alloc-big">{{ planningWeek.clientPercent }}%</span>
                <span class="alloc-hours">{{ (planningWeek.clientPercent * 30 / 100).toFixed(1) }}h</span>
              </div>
              <div class="alloc-bar"><div class="alloc-fill client" [style.width.%]="planningWeek.clientPercent"></div></div>
            </div>
            <div class="alloc-card">
              <div class="alloc-icon" style="background:rgba(218,54,51,0.15);color:#f85149;">🔧</div>
              <div class="alloc-info">
                <span class="alloc-label">Tech Debt</span>
                <span class="alloc-big">{{ planningWeek.techDebtPercent }}%</span>
                <span class="alloc-hours">{{ (planningWeek.techDebtPercent * 30 / 100).toFixed(1) }}h</span>
              </div>
              <div class="alloc-bar"><div class="alloc-fill techdebt" [style.width.%]="planningWeek.techDebtPercent"></div></div>
            </div>
            <div class="alloc-card">
              <div class="alloc-icon" style="background:rgba(35,134,54,0.15);color:#3fb950;">🧪</div>
              <div class="alloc-info">
                <span class="alloc-label">R&D</span>
                <span class="alloc-big">{{ planningWeek.rndPercent }}%</span>
                <span class="alloc-hours">{{ (planningWeek.rndPercent * 30 / 100).toFixed(1) }}h</span>
              </div>
              <div class="alloc-bar"><div class="alloc-fill rnd" [style.width.%]="planningWeek.rndPercent"></div></div>
            </div>
          </div>
        </div>

        <div class="meta">
          <span>Created: {{ formatDateTime(planningWeek.createdAt) }}</span>
        </div>

        <!-- Team Members Section -->
        <div class="section" style="margin-top: 20px;">
          <div class="section-header">
            <h2>Team Members</h2>
            <div class="section-actions">
              <button class="btn-sm blue" (click)="addAllMembers()" *ngIf="weekMembers.length === 0">+ Add Team</button>
              <a [routerLink]="['/planning', planningId, 'dashboard']" class="btn-sm green">📊 Dashboard</a>
            </div>
          </div>
          <div class="members-grid" *ngIf="weekMembers.length > 0">
            <div class="wm-card" *ngFor="let wm of weekMembers">
              <div class="wm-top">
                <div class="wm-avatar" [class.submitted]="wm.hasSubmitted">{{ wm.memberName.charAt(0).toUpperCase() }}</div>
                <div class="wm-info">
                  <span class="wm-name">{{ wm.memberName }}</span>
                  <span class="wm-status" [class.done]="wm.hasSubmitted">{{ wm.hasSubmitted ? '✅ Submitted' : '⏳ Pending' }}</span>
                </div>
              </div>
              <div class="wm-hours">{{ wm.totalPlannedHours.toFixed(1) }}h planned · {{ wm.tasks.length }} tasks</div>
              <a [routerLink]="['/planning', planningId, 'board', wm.id]" class="btn-board">Open Board →</a>
            </div>
          </div>
          <div *ngIf="weekMembers.length === 0" class="empty-members">
            No members assigned to this week yet. Click "Add Team" to add all team members.
          </div>
        </div>
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

    .btn-freeze {
      padding: 8px 16px; background: rgba(56,182,255,0.1); color: #79c0ff;
      border: 1px solid rgba(56,182,255,0.3); border-radius: 6px; cursor: pointer; font-size: 13px;
      transition: all 0.2s;
    }
    .btn-freeze:hover:not(:disabled) { background: rgba(56,182,255,0.2); }
    .btn-freeze:disabled { opacity: 0.4; cursor: not-allowed; }

    .btn-danger {
      padding: 8px 16px; background: rgba(248,81,73,0.1); color: #f85149;
      border: 1px solid rgba(248,81,73,0.3); border-radius: 6px; cursor: pointer; font-size: 13px;
      transition: all 0.2s;
    }
    .btn-danger:hover { background: rgba(248,81,73,0.2); }

    .loading { text-align: center; padding: 60px; color: #8b949e; }

    .detail-content h1 { margin: 0 0 12px 0; font-size: 28px; color: #f0f6fc; }

    .status-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
    .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .s-1 { background: rgba(210,153,34,0.2); color: #d29922; }
    .s-2 { background: rgba(31,111,235,0.2); color: #58a6ff; }
    .s-3 { background: rgba(35,134,54,0.2); color: #3fb950; }
    .s-4 { background: rgba(139,148,158,0.2); color: #8b949e; }
    .frozen-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; background: rgba(56,182,255,0.15); color: #79c0ff; }
    .date-range { color: #8b949e; font-size: 14px; margin-left: auto; }

    .transition-bar {
      margin-bottom: 24px; padding: 14px 16px;
      background: #161b22; border: 1px solid #30363d; border-radius: 8px;
      display: flex; align-items: center; gap: 10px;
    }
    .btn-start {
      padding: 8px 18px; background: #1f6feb; color: white;
      border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px;
    }
    .btn-start:hover { background: #388bfd; }
    .btn-complete {
      padding: 8px 18px; background: #238636; color: white;
      border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px;
    }
    .btn-complete:hover { background: #2ea043; }
    .btn-archive {
      padding: 8px 18px; background: #484f58; color: white;
      border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px;
    }
    .btn-archive:hover { background: #6e7681; }
    .archived-label { color: #8b949e; font-style: italic; font-size: 14px; }

    .section {
      background: #161b22; border: 1px solid #30363d; border-radius: 8px;
      padding: 20px; margin-bottom: 20px;
    }
    .section h2 { margin: 0 0 16px 0; font-size: 17px; color: #f0f6fc; }
    .section h2 .sub { font-weight: 400; color: #8b949e; font-size: 14px; }

    .alloc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }

    .alloc-card {
      background: #0d1117; border: 1px solid #21262d; border-radius: 8px;
      padding: 16px; display: flex; flex-direction: column; gap: 10px;
    }
    .alloc-icon {
      width: 36px; height: 36px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center; font-size: 18px;
    }
    .alloc-info { display: flex; flex-direction: column; }
    .alloc-label { font-size: 12px; color: #8b949e; }
    .alloc-big { font-size: 24px; font-weight: 700; color: #f0f6fc; }
    .alloc-hours { font-size: 13px; color: #8b949e; }

    .alloc-bar { height: 6px; background: #21262d; border-radius: 3px; overflow: hidden; }
    .alloc-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
    .alloc-fill.client { background: #1f6feb; }
    .alloc-fill.techdebt { background: #da3633; }
    .alloc-fill.rnd { background: #238636; }

    .meta { color: #484f58; font-size: 12px; margin-top: 12px; }

    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid #21262d; }
    .section-header h2 { margin: 0; font-size: 17px; color: #f0f6fc; }
    .section-actions { display: flex; gap: 8px; }
    .btn-sm { padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-block; }
    .btn-sm.blue { background: rgba(31,111,235,0.15); color: #58a6ff; border: 1px solid rgba(31,111,235,0.3); }
    .btn-sm.blue:hover { background: rgba(31,111,235,0.25); }
    .btn-sm.green { background: rgba(35,134,54,0.15); color: #3fb950; border: 1px solid rgba(35,134,54,0.3); }
    .btn-sm.green:hover { background: rgba(35,134,54,0.25); }
    .members-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
    .wm-card { background: #0d1117; border: 1px solid #21262d; border-radius: 8px; padding: 14px; }
    .wm-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .wm-avatar { width: 36px; height: 36px; border-radius: 50%; background: #30363d; display: flex; align-items: center; justify-content: center; color: #e1e4e8; font-weight: 700; font-size: 15px; }
    .wm-avatar.submitted { background: #238636; }
    .wm-info { display: flex; flex-direction: column; gap: 2px; }
    .wm-name { color: #f0f6fc; font-weight: 500; font-size: 14px; }
    .wm-status { font-size: 11px; color: #8b949e; }
    .wm-status.done { color: #3fb950; }
    .wm-hours { font-size: 12px; color: #8b949e; margin-bottom: 8px; }
    .btn-board { display: inline-block; font-size: 12px; color: #58a6ff; text-decoration: none; padding: 4px 10px; border: 1px solid #30363d; border-radius: 6px; }
    .btn-board:hover { background: #21262d; }
    .empty-members { text-align: center; padding: 20px; color: #8b949e; font-size: 14px; }

    .error-bar { background: rgba(248,81,73,0.1); color: #f85149; padding: 12px 16px; border-radius: 6px; margin-top: 16px; border: 1px solid rgba(248,81,73,0.4); }

    @media (max-width: 768px) {
      .alloc-grid { grid-template-columns: 1fr; }
      .header-actions { flex-direction: column; gap: 12px; align-items: flex-start; }
    }
  `]
})
export class PlanningDetailComponent implements OnInit, OnDestroy {
  planningWeek$: Observable<PlanningWeek | undefined>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  planningId: string = '';
  weekMembers: WeekMember[] = [];
  private destroy$ = new Subject<void>();

  private statusLabels: Record<number, string> = {
    [PlanningStatus.Setup]: 'Setup',
    [PlanningStatus.InProgress]: 'In Progress',
    [PlanningStatus.Completed]: 'Completed',
    [PlanningStatus.Archived]: 'Archived'
  };

  constructor(
    private store: Store<AppStoreState>,
    private route: ActivatedRoute,
    private router: Router,
    private weekMemberService: WeekMemberService,
    private toast: ToastService
  ) {
    this.planningWeek$ = new Observable();
    this.loading$ = this.store.select(PlanningSelectors.selectPlanningLoading);
    this.error$ = this.store.select(PlanningSelectors.selectPlanningError);
  }

  ngOnInit(): void {
    this.store.dispatch(TeamActions.loadTeamMembers());
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.planningId = params['id'];
      this.store.dispatch(PlanningActions.loadPlanningWeekById({ id: this.planningId }));
      this.planningWeek$ = this.store.select(PlanningSelectors.selectPlanningWeekById(this.planningId));
      this.loadWeekMembers();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWeekMembers(): void {
    this.weekMemberService.getWeekMembers(this.planningId).subscribe({
      next: (members) => this.weekMembers = members,
      error: () => this.weekMembers = []
    });
  }

  addAllMembers(): void {
    this.store.select(TeamSelectors.selectAllTeamMembers).pipe(takeUntil(this.destroy$)).subscribe(teamMembers => {
      if (teamMembers.length === 0) {
        this.toast.error('No team members found. Add members in Team page first.');
        return;
      }
      const memberIds = teamMembers.map(m => m.id);
      this.weekMemberService.addWeekMembers(this.planningId, memberIds).subscribe({
        next: () => {
          this.toast.success('Team members added to this week!');
          this.loadWeekMembers();
        },
        error: (err) => this.toast.error(err?.error?.message || 'Failed to add members')
      });
    });
  }

  getStatusLabel(status: PlanningStatus): string {
    return this.statusLabels[status] || 'Unknown';
  }

  navigateToEdit(): void {
    this.router.navigate(['/planning', this.planningId, 'edit']);
  }

  deletePlanning(): void {
    if (confirm('Are you sure you want to delete this planning week?')) {
      this.store.dispatch(PlanningActions.deletePlanningWeek({ id: this.planningId }));
      this.router.navigate(['/planning']);
    }
  }

  freezeWeek(): void {
    if (confirm('Are you sure you want to freeze this planning week? This cannot be undone.')) {
      this.store.dispatch(PlanningActions.freezePlanningWeek({ id: this.planningId }));
    }
  }

  startWeek(): void {
    this.store.dispatch(PlanningActions.startPlanningWeek({ id: this.planningId }));
  }

  completeWeek(): void {
    if (confirm('Mark this week as completed? This will also freeze the week.')) {
      this.store.dispatch(PlanningActions.completePlanningWeek({ id: this.planningId }));
    }
  }

  archiveWeek(): void {
    if (confirm('Archive this planning week?')) {
      this.store.dispatch(PlanningActions.archivePlanningWeek({ id: this.planningId }));
    }
  }

  goBack(): void {
    this.router.navigate(['/planning']);
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
