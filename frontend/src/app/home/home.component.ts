import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { PlanningWeek, PlanningStatus, TeamMember, UserRole, WeekMember } from '../models';
import { AppStoreState } from '../store';
import * as PlanningSelectors from '../store/planning/planning.selectors';
import * as PlanningActions from '../store/planning/planning.actions';
import * as TeamSelectors from '../store/team/team.selectors';
import * as TeamActions from '../store/team/team.actions';
import { UserContextService } from '../core/services/user-context.service';
import { WeekMemberService } from '../core/services/week-member.service';
import { PlanningService } from '../core/services/planning.service';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-page">
      <!-- Greeting -->
      <div class="greeting-section" *ngIf="currentUser">
        <div class="greeting-card">
          <div class="greeting-avatar" [class.lead]="currentUser.role === 2">
            {{ currentUser.name.charAt(0).toUpperCase() }}
          </div>
          <div class="greeting-text">
            <p class="greeting-label">Welcome back</p>
            <h1 class="greeting-name">{{ currentUser.name }}</h1>
            <span class="role-tag" [class.lead]="currentUser.role === 2">
              {{ currentUser.role === 2 ? '⭐ Team Lead' : '👤 Team Member' }}
            </span>
          </div>
        </div>
      </div>

      <!-- ===== LEAD VIEW ===== -->
      <ng-container *ngIf="isLead">
        <div class="section-header">
          <h2 class="section-title">Quick Actions</h2>
          <p class="section-sub" *ngIf="!activeWeek">Start a new week to begin planning</p>
          <p class="section-sub" *ngIf="activeWeek">Week is active — manage your team's plan</p>
        </div>

        <!-- Lead WITHOUT active week: 4 cards -->
        <div class="actions-grid" *ngIf="!activeWeek">
          <button class="action-card start-card" (click)="navigateTo('/planning/create')">
            <div class="action-icon-wrap rocket">🚀</div>
            <div class="action-text">
              <strong>Start a New Week</strong>
              <p>Set up a new planning cycle for your team.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/backlog')">
            <div class="action-icon-wrap green">📋</div>
            <div class="action-text">
              <strong>Manage Backlog</strong>
              <p>Add, edit, or browse work items.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/team')">
            <div class="action-icon-wrap purple">👥</div>
            <div class="action-text">
              <strong>Manage Team Members</strong>
              <p>Add or remove team members.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/weeks')">
            <div class="action-icon-wrap gray">📅</div>
            <div class="action-text">
              <strong>View Past Weeks</strong>
              <p>Look at completed planning cycles.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>
        </div>

        <!-- Lead WITH active week: 6 cards -->
        <div class="actions-grid" *ngIf="activeWeek">
          <button class="action-card ice" (click)="goToFreeze()">
            <div class="action-icon-wrap frost">❄️</div>
            <div class="action-text">
              <strong>Review and Freeze the Plan</strong>
              <p>Check everyone's hours and lock the plan.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="goToPlanMyWork()">
            <div class="action-icon-wrap blue">📝</div>
            <div class="action-text">
              <strong>Plan My Work</strong>
              <p>Pick backlog items and commit hours.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/backlog')">
            <div class="action-icon-wrap green">📋</div>
            <div class="action-text">
              <strong>Manage Backlog</strong>
              <p>Add, edit, or browse work items.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/team')">
            <div class="action-icon-wrap purple">👥</div>
            <div class="action-text">
              <strong>Manage Team Members</strong>
              <p>Add or remove team members.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/weeks')">
            <div class="action-icon-wrap gray">📅</div>
            <div class="action-text">
              <strong>View Past Weeks</strong>
              <p>Look at completed planning cycles.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card danger-card" (click)="cancelWeekPlanning()">
            <div class="action-icon-wrap red">🗑️</div>
            <div class="action-text">
              <strong>Cancel This Week's Planning</strong>
              <p>Erase all plans and start over.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>
        </div>

        <!-- Active Week Info Card (Lead) -->
        <div class="active-week-section" *ngIf="activeWeek">
          <h2>Current Active Week</h2>
          <div class="active-week-card">
            <div class="week-info">
              <div class="week-dates">
                <span class="date-label">Work Period</span>
                <span class="date-range">{{ formatDate(activeWeek.startDate) }} → {{ formatDate(activeWeek.endDate) }}</span>
              </div>
              <div class="week-status">
                <span class="status-badge" [class]="getStatusClass(activeWeek.status)">
                  {{ getStatusLabel(activeWeek.status) }}
                </span>
                <span class="frozen-badge" *ngIf="activeWeek.isFrozen">🔒 Frozen</span>
              </div>
              <div class="week-split">
                <span class="split-chip client">Client {{ activeWeek.clientPercent }}%</span>
                <span class="split-chip tech">Tech {{ activeWeek.techDebtPercent }}%</span>
                <span class="split-chip rnd">R&D {{ activeWeek.rndPercent }}%</span>
              </div>
            </div>
            <div class="week-actions">
              <button class="btn-outline" (click)="navigateTo('/planning/' + activeWeek.id)">View Details</button>
              <button class="btn-primary" (click)="navigateTo('/planning/' + activeWeek.id + '/dashboard')">Lead Dashboard</button>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ===== MEMBER VIEW ===== -->
      <ng-container *ngIf="!isLead">
        <div class="section-header">
          <h2 class="section-title">Your Dashboard</h2>
          <p class="section-sub" *ngIf="!activeWeek">No active week — waiting for lead to start planning</p>
          <p class="section-sub" *ngIf="activeWeek">A week is active — plan your work</p>
        </div>

        <!-- Member WITHOUT active week: 2 cards -->
        <div class="actions-grid member-grid" *ngIf="!activeWeek">
          <button class="action-card" (click)="navigateTo('/backlog')">
            <div class="action-icon-wrap green">📋</div>
            <div class="action-text">
              <strong>Manage Backlog</strong>
              <p>Add, edit, or browse work items.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/weeks')">
            <div class="action-icon-wrap gray">📅</div>
            <div class="action-text">
              <strong>View Past Weeks</strong>
              <p>Look at completed planning cycles.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>
        </div>

        <!-- Member WITH active week: 3 cards -->
        <div class="actions-grid member-grid" *ngIf="activeWeek">
          <button class="action-card primary" (click)="goToPlanMyWork()">
            <div class="action-icon-wrap blue">📝</div>
            <div class="action-text">
              <strong>Plan My Work</strong>
              <p>Pick backlog items and commit your 30 hours.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/backlog')">
            <div class="action-icon-wrap green">📋</div>
            <div class="action-text">
              <strong>Manage Backlog</strong>
              <p>Add, edit, or browse work items.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/weeks')">
            <div class="action-icon-wrap gray">📅</div>
            <div class="action-text">
              <strong>View Past Weeks</strong>
              <p>Look at completed planning cycles.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>
        </div>

        <!-- Active plan for member -->
        <div class="member-active" *ngIf="memberWeekMember">
          <div class="active-plan-card">
            <h2>Your Active Plan</h2>
            <div class="plan-info">
              <div class="plan-dates">
                {{ formatDate(activeWeek!.startDate) }} → {{ formatDate(activeWeek!.endDate) }}
              </div>
              <div class="plan-stats">
                <div class="plan-stat">
                  <span class="stat-val">{{ memberWeekMember.totalPlannedHours }}h</span>
                  <span class="stat-lbl">Planned</span>
                </div>
                <div class="plan-stat">
                  <span class="stat-val">{{ memberWeekMember.totalActualHours }}h</span>
                  <span class="stat-lbl">Actual</span>
                </div>
                <div class="plan-stat">
                  <span class="stat-val">{{ memberWeekMember.hasSubmitted ? 'Yes' : 'No' }}</span>
                  <span class="stat-lbl">Submitted</span>
                </div>
              </div>
            </div>
            <button class="btn-primary full" (click)="navigateTo('/planning/' + activeWeek!.id + '/board/' + memberWeekMember.id)">
              {{ memberWeekMember.hasSubmitted ? 'View My Board' : 'Open Planning Board' }} →
            </button>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .home-page { padding: 32px 0; max-width: 920px; margin: 0 auto; }

    /* Greeting */
    .greeting-section { margin-bottom: 36px; }
    .greeting-card {
      display: flex; align-items: center; gap: 18px;
      background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-hover) 100%);
      border: 1px solid var(--border); border-radius: 16px; padding: 24px 28px;
    }
    .greeting-avatar {
      width: 60px; height: 60px; border-radius: 16px;
      background: var(--bg-tertiary, #30363d);
      display: flex; align-items: center; justify-content: center;
      color: var(--text-primary, #e1e4e8); font-weight: 700; font-size: 24px; flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .greeting-avatar.lead { background: linear-gradient(135deg, #1f6feb, #388bfd); color: #fff; }
    .greeting-text { display: flex; flex-direction: column; gap: 4px; }
    .greeting-label { margin: 0; color: var(--text-secondary, #8b949e); font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    .greeting-name {
      margin: 0; color: var(--text-heading, #f0f6fc); font-size: 28px; font-weight: 700; line-height: 1.2;
    }
    .role-tag {
      font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px;
      background: var(--bg-tertiary, #21262d); color: var(--text-secondary, #8b949e);
      display: inline-flex; align-items: center; gap: 4px; width: fit-content;
    }
    .role-tag.lead { background: rgba(31,111,235,0.15); color: #58a6ff; }

    /* Section Header */
    .section-header { margin-bottom: 20px; }
    .section-title { color: var(--text-heading); font-size: 20px; font-weight: 700; margin: 0 0 4px; }
    .section-sub { color: var(--text-secondary); font-size: 14px; margin: 0; }

    /* Actions Grid */
    .actions-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 28px;
    }
    .member-grid { grid-template-columns: 1fr; }
    .action-card {
      display: flex; align-items: center; gap: 14px; padding: 20px 22px;
      background: var(--bg-card, #161b22); border: 1px solid var(--border, #30363d);
      border-radius: 14px; cursor: pointer; text-align: left;
      transition: all 0.25s ease; color: var(--text-primary, #e1e4e8);
      position: relative; overflow: hidden;
    }
    .action-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: transparent; transition: background 0.25s;
    }
    .action-card:hover {
      border-color: var(--border-hover, #58a6ff); background: var(--bg-card-hover, #1c2129);
      transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    }
    .action-card.start-card { border: 2px solid rgba(31,111,235,0.4); }
    .action-card.start-card::before { background: linear-gradient(90deg, #1f6feb, #388bfd); height: 3px; }
    .action-card.start-card:hover { border-color: #1f6feb; box-shadow: 0 8px 24px rgba(31,111,235,0.2); }
    .action-card.primary { border-left: 3px solid #1f6feb; }
    .action-card.ice { border-left: 3px solid #7dd3fc; }
    .action-card.danger-card { border-left: 3px solid #f85149; }
    .action-card.danger-card:hover { border-color: #f85149; box-shadow: 0 8px 24px rgba(248,81,73,0.15); }

    .action-icon-wrap {
      width: 48px; height: 48px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; flex-shrink: 0;
    }
    .action-icon-wrap.rocket { background: linear-gradient(135deg, rgba(31,111,235,0.2), rgba(56,139,253,0.1)); }
    .action-icon-wrap.blue { background: rgba(31,111,235,0.15); }
    .action-icon-wrap.green { background: rgba(35,134,54,0.15); }
    .action-icon-wrap.purple { background: rgba(130,80,223,0.15); }
    .action-icon-wrap.gray { background: rgba(139,148,158,0.15); }
    .action-icon-wrap.frost { background: rgba(125,211,252,0.15); }
    .action-icon-wrap.red { background: rgba(248,81,73,0.12); }
    .action-text { flex: 1; }
    .action-text strong { display: block; font-size: 15px; color: var(--text-heading, #f0f6fc); margin-bottom: 4px; font-weight: 600; }
    .action-text p { margin: 0; font-size: 13px; color: var(--text-secondary, #8b949e); line-height: 1.4; }
    .action-arrow { color: var(--text-muted, #484f58); font-size: 18px; transition: transform 0.2s, color 0.2s; }
    .action-card:hover .action-arrow { transform: translateX(3px); color: var(--text-secondary); }

    /* Active Week Section */
    .active-week-section { margin-bottom: 24px; }
    .active-week-section h2 { color: var(--text-heading, #f0f6fc); font-size: 18px; margin: 0 0 12px; font-weight: 700; }
    .active-week-card {
      background: var(--bg-card, #161b22); border: 1px solid var(--border, #30363d);
      border-radius: 14px; padding: 22px;
      display: flex; justify-content: space-between; align-items: center; gap: 20px;
    }
    .week-info { display: flex; flex-direction: column; gap: 10px; }
    .date-label { color: var(--text-secondary, #8b949e); font-size: 12px; display: block; text-transform: uppercase; letter-spacing: 0.3px; }
    .date-range { color: var(--text-heading, #f0f6fc); font-size: 15px; font-weight: 600; }
    .week-status { display: flex; gap: 8px; }
    .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-badge.setup { background: rgba(210,153,34,0.15); color: #d29922; }
    .status-badge.inprogress { background: rgba(31,111,235,0.15); color: #58a6ff; }
    .status-badge.completed { background: rgba(35,134,54,0.15); color: #3fb950; }
    .status-badge.archived { background: rgba(72,79,88,0.15); color: #8b949e; }
    .frozen-badge { font-size: 12px; color: #f0c060; padding: 4px 10px; background: rgba(240,192,96,0.1); border-radius: 20px; }
    .week-split { display: flex; gap: 6px; }
    .split-chip { font-size: 11px; padding: 3px 8px; border-radius: 6px; font-weight: 500; }
    .split-chip.client { background: rgba(31,111,235,0.1); color: #58a6ff; }
    .split-chip.tech { background: rgba(218,54,51,0.1); color: #f85149; }
    .split-chip.rnd { background: rgba(35,134,54,0.1); color: #3fb950; }
    .week-actions { display: flex; flex-direction: column; gap: 8px; }
    .btn-outline {
      background: none; border: 1px solid var(--border, #30363d); color: var(--text-primary, #e1e4e8);
      padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500;
      transition: all 0.2s;
    }
    .btn-outline:hover { border-color: #58a6ff; color: var(--text-heading, #f0f6fc); }
    .btn-primary {
      background: linear-gradient(135deg, #1f6feb, #388bfd); border: none; color: #fff; padding: 8px 16px;
      border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;
      transition: all 0.2s; box-shadow: 0 2px 8px rgba(31,111,235,0.3);
    }
    .btn-primary:hover { background: linear-gradient(135deg, #388bfd, #58a6ff); box-shadow: 0 4px 16px rgba(31,111,235,0.4); }
    .btn-primary.full { width: 100%; padding: 12px; font-size: 15px; margin-top: 16px; }

    /* Member Active Plan Card */
    .active-plan-card {
      background: var(--bg-card, #161b22); border: 1px solid var(--border, #30363d);
      border-radius: 14px; padding: 24px; margin-bottom: 20px;
    }
    .active-plan-card h2 { color: var(--text-heading, #f0f6fc); font-size: 18px; margin: 0 0 16px; font-weight: 700; }
    .plan-dates { color: #58a6ff; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
    .plan-stats { display: flex; gap: 24px; }
    .plan-stat { display: flex; flex-direction: column; align-items: center; }
    .stat-val { font-size: 24px; font-weight: 700; color: var(--text-heading, #f0f6fc); }
    .stat-lbl { font-size: 12px; color: var(--text-secondary, #8b949e); margin-top: 2px; }

    @media (max-width: 768px) {
      .home-page { padding: 20px 0; }
      .actions-grid { grid-template-columns: 1fr; }
      .active-week-card { flex-direction: column; }
      .greeting-card { padding: 16px 20px; }
      .greeting-name { font-size: 22px; }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  currentUser: TeamMember | null = null;
  isLead = false;
  activeWeek: PlanningWeek | null = null;
  memberWeekMember: WeekMember | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppStoreState>,
    private router: Router,
    private userContext: UserContextService,
    private weekMemberService: WeekMemberService,
    private planningService: PlanningService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.store.dispatch(PlanningActions.loadPlanningWeeks({ skip: 0, take: 50 }));
    this.store.dispatch(TeamActions.loadTeamMembers());

    this.userContext.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user;
      this.isLead = user?.role === UserRole.TeamLead;

      if (!user) {
        this.store.select(TeamSelectors.selectAllTeamMembers).pipe(takeUntil(this.destroy$)).subscribe(members => {
          if (members.length === 0) {
            this.router.navigate(['/setup']);
          }
        });
      }
    });

    this.store.select(PlanningSelectors.selectAllPlanningWeeks).pipe(takeUntil(this.destroy$)).subscribe(weeks => {
      this.activeWeek = weeks.find(w =>
        w.status === PlanningStatus.InProgress || w.status === PlanningStatus.Setup
      ) || null;

      if (this.activeWeek && this.currentUser && !this.isLead) {
        this.loadMemberPlan(this.activeWeek.id, this.currentUser.id);
      } else {
        this.memberWeekMember = null;
      }
    });
  }

  private loadMemberPlan(weekId: string, memberId: string): void {
    this.weekMemberService.getWeekMembers(weekId).subscribe(members => {
      this.memberWeekMember = members.find(m => m.memberId === memberId) || null;
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  goToFreeze(): void {
    if (this.activeWeek) {
      this.router.navigate(['/planning', this.activeWeek.id, 'dashboard']);
    } else {
      this.toast.info('No active week to review. Start a new week first.');
    }
  }

  goToPlanMyWork(): void {
    if (this.activeWeek && this.currentUser) {
      if (this.isLead && this.activeWeek) {
        // Lead's member board
        this.weekMemberService.getWeekMembers(this.activeWeek.id).subscribe(members => {
          const myWm = members.find(m => m.memberId === this.currentUser!.id);
          if (myWm) {
            this.router.navigate(['/planning', this.activeWeek!.id, 'board', myWm.id]);
          } else {
            this.toast.info('You are not assigned to this week. Add yourself in the planning form.');
            this.router.navigate(['/planning', this.activeWeek!.id]);
          }
        });
      } else if (this.memberWeekMember) {
        this.router.navigate(['/planning', this.activeWeek.id, 'board', this.memberWeekMember.id]);
      } else {
        this.toast.info('You are not assigned to the current week yet.');
      }
    } else {
      this.toast.info('No active week. Ask your lead to start a new planning week.');
    }
  }

  cancelWeekPlanning(): void {
    if (!this.activeWeek) {
      this.toast.info('No active week to cancel.');
      return;
    }
    if (confirm('Are you sure you want to cancel this week\'s planning? This will delete the current week and all its plans.')) {
      this.planningService.deletePlanningWeek(this.activeWeek.id).subscribe({
        next: () => {
          this.toast.success('Week planning cancelled.');
          this.store.dispatch(PlanningActions.loadPlanningWeeks({ skip: 0, take: 50 }));
          this.activeWeek = null;
        },
        error: () => this.toast.error('Failed to cancel week planning.')
      });
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getStatusLabel(status: PlanningStatus): string {
    switch (status) {
      case PlanningStatus.Setup: return 'Setup';
      case PlanningStatus.InProgress: return 'In Progress';
      case PlanningStatus.Completed: return 'Completed';
      case PlanningStatus.Archived: return 'Archived';
      default: return '';
    }
  }

  getStatusClass(status: PlanningStatus): string {
    switch (status) {
      case PlanningStatus.Setup: return 'status-badge setup';
      case PlanningStatus.InProgress: return 'status-badge inprogress';
      case PlanningStatus.Completed: return 'status-badge completed';
      case PlanningStatus.Archived: return 'status-badge archived';
      default: return '';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
