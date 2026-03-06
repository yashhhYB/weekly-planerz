import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { WeekMember, MemberTask, UpdateProgressRequest } from '../../../../models';
import { WeekMemberService } from '../../../../core/services/week-member.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-update-progress',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <div>
            <h1>Update My Progress</h1>
            <p class="subtitle" *ngIf="weekMember">{{ weekMember.memberName }}'s Tasks</p>
          </div>
        </div>
        <div class="header-actions">
          <a routerLink="/home" class="btn-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Home
          </a>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Loading your tasks...</div>

      <div *ngIf="!loading && weekMember" class="progress-content">
        <!-- Summary Card -->
        <div class="summary-card">
          <div class="summary-stats">
            <div class="summary-stat">
              <span class="stat-value">{{ weekMember.totalPlannedHours }}h</span>
              <span class="stat-label">Planned</span>
            </div>
            <div class="summary-stat">
              <span class="stat-value">{{ getTotalActual() }}h</span>
              <span class="stat-label">Actual</span>
            </div>
            <div class="summary-stat">
              <span class="stat-value">{{ getOverallProgress() }}%</span>
              <span class="stat-label">Progress</span>
            </div>
            <div class="summary-stat">
              <span class="stat-value">{{ weekMember.tasks.length }}</span>
              <span class="stat-label">Tasks</span>
            </div>
          </div>
          <div class="overall-bar">
            <div class="bar-track">
              <div class="bar-fill" [style.width.%]="getOverallProgress()"></div>
            </div>
          </div>
        </div>

        <!-- Tasks List -->
        <div class="tasks-section">
          <h2 class="tasks-heading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            Your Assigned Tasks
          </h2>

          <div *ngIf="weekMember.tasks.length === 0" class="empty-tasks">
            <p>No tasks assigned yet.</p>
          </div>

          <div class="task-card" *ngFor="let task of weekMember.tasks; let i = index">
            <div class="task-header">
              <div class="task-title-row">
                <h3>{{ task.backlogTitle }}</h3>
                <span class="cat-badge" [ngClass]="'c-' + task.backlogCategory">{{ getCategoryLabel(task.backlogCategory) }}</span>
              </div>
              <span class="task-status" [ngClass]="getTaskStatusClass(task)">{{ getTaskStatus(task) }}</span>
            </div>

            <div class="task-progress">
              <div class="progress-bar-container">
                <div class="progress-track">
                  <div class="progress-fill" [style.width.%]="task.progressPercent" [ngClass]="getProgressColorClass(task.progressPercent)"></div>
                </div>
                <span class="progress-text">{{ task.progressPercent }}%</span>
              </div>
            </div>

            <div class="task-hours-row">
              <div class="hours-info">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{{ task.actualHours }} of {{ task.plannedHours }}h done</span>
              </div>
            </div>

            <div class="task-inputs">
              <div class="input-group">
                <label>Actual Hours</label>
                <input type="number" [value]="task.actualHours" min="0" step="0.5"
                       (change)="onHoursChange(task, $event)" class="input-field" />
              </div>
              <div class="input-group">
                <label>Progress %</label>
                <input type="range" [value]="task.progressPercent" min="0" max="100" step="5"
                       (input)="onProgressSlide(task, $event)" class="range-input" />
                <span class="range-value">{{ task.progressPercent }}%</span>
              </div>
              <button class="btn-save" (click)="saveProgress(task)" [disabled]="savingTaskId === task.id">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {{ savingTaskId === task.id ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && !weekMember" class="empty-state">
        <p>Could not load your tasks. You might not be assigned to this week.</p>
        <a routerLink="/home" class="btn-back">Go Home</a>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 32px 0; max-width: 860px; margin: 0 auto; }

    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .header-left { display: flex; align-items: center; gap: 14px; }
    .header-icon { color: var(--accent); }
    .header-left h1 { margin: 0; font-size: 24px; color: var(--text-heading); }
    .subtitle { margin: 4px 0 0; color: var(--text-secondary); font-size: 14px; }
    .header-actions { display: flex; gap: 8px; }
    .btn-back {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 14px; background: var(--bg-tertiary); color: var(--text-primary);
      border: 1px solid var(--border); border-radius: 8px; text-decoration: none;
      font-size: 13px; transition: all 0.2s;
    }
    .btn-back:hover { border-color: var(--border-hover); background: var(--bg-card-hover); }

    .loading { text-align: center; padding: 60px; color: var(--text-secondary); }

    /* Summary Card */
    .summary-card {
      background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px;
      padding: 24px; margin-bottom: 24px;
    }
    .summary-stats { display: flex; justify-content: space-around; margin-bottom: 16px; }
    .summary-stat { display: flex; flex-direction: column; align-items: center; }
    .stat-value { font-size: 28px; font-weight: 700; color: var(--text-heading); }
    .stat-label { font-size: 12px; color: var(--text-secondary); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.3px; }
    .overall-bar { padding: 0 8px; }
    .bar-track { height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; background: linear-gradient(90deg, #1f6feb, #388bfd); border-radius: 4px; transition: width 0.4s ease; }

    /* Tasks Section */
    .tasks-section { margin-bottom: 20px; }
    .tasks-heading {
      display: flex; align-items: center; gap: 8px;
      font-size: 18px; font-weight: 700; color: var(--text-heading);
      margin: 0 0 16px;
    }
    .empty-tasks { text-align: center; padding: 40px; color: var(--text-secondary); }

    /* Task Card */
    .task-card {
      background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px;
      padding: 20px; margin-bottom: 14px; transition: border-color 0.2s;
    }
    .task-card:hover { border-color: var(--border-hover); }

    .task-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .task-title-row { display: flex; align-items: center; gap: 10px; flex: 1; }
    .task-title-row h3 { margin: 0; font-size: 16px; color: var(--text-heading); font-weight: 600; }

    .cat-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .c-1 { background: rgba(31,111,235,0.15); color: var(--accent); }
    .c-2 { background: rgba(218,54,51,0.15); color: var(--danger); }
    .c-3 { background: rgba(35,134,54,0.15); color: var(--success); }

    .task-status { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; }
    .task-status.not-started { background: rgba(139,148,158,0.15); color: var(--text-secondary); }
    .task-status.in-progress { background: rgba(31,111,235,0.15); color: var(--accent); }
    .task-status.done { background: rgba(35,134,54,0.15); color: var(--success); }

    .task-progress { margin-bottom: 12px; }
    .progress-bar-container { display: flex; align-items: center; gap: 10px; }
    .progress-track { flex: 1; height: 6px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s ease; }
    .progress-fill.low { background: var(--danger); }
    .progress-fill.mid { background: #d29922; }
    .progress-fill.high { background: var(--success); }
    .progress-text { font-size: 13px; font-weight: 600; color: var(--text-secondary); min-width: 36px; text-align: right; }

    .task-hours-row { display: flex; align-items: center; margin-bottom: 14px; }
    .hours-info { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-secondary); }

    .task-inputs { display: flex; align-items: flex-end; gap: 16px; padding-top: 12px; border-top: 1px solid var(--bg-tertiary); }
    .input-group { display: flex; flex-direction: column; gap: 4px; }
    .input-group label { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
    .input-field {
      width: 100px; padding: 8px 10px; background: var(--bg-input, var(--bg-tertiary));
      color: var(--text-primary); border: 1px solid var(--border); border-radius: 6px;
      font-size: 14px;
    }
    .input-field:focus { outline: none; border-color: var(--accent); }
    .range-input { width: 140px; accent-color: var(--accent); cursor: pointer; }
    .range-value { font-size: 13px; font-weight: 600; color: var(--text-primary); }

    .btn-save {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 16px; background: var(--success); color: white;
      border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;
      transition: all 0.2s; white-space: nowrap;
    }
    .btn-save:hover:not(:disabled) { filter: brightness(1.15); }
    .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

    .empty-state { text-align: center; padding: 60px; color: var(--text-secondary); }

    @media (max-width: 768px) {
      .page-container { padding: 20px 0; }
      .task-inputs { flex-direction: column; align-items: stretch; gap: 10px; }
      .input-field { width: 100%; }
      .range-input { width: 100%; }
      .summary-stats { flex-wrap: wrap; gap: 16px; }
    }
  `]
})
export class UpdateProgressComponent implements OnInit, OnDestroy {
  weekId = '';
  weekMemberId = '';
  weekMember: WeekMember | null = null;
  loading = true;
  savingTaskId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private weekMemberService: WeekMemberService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.weekId = params['weekId'];
      this.weekMemberId = params['weekMemberId'];
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;
    this.weekMemberService.getWeekMember(this.weekMemberId).subscribe({
      next: (wm) => {
        this.weekMember = wm;
        this.loading = false;
      },
      error: () => {
        this.weekMember = null;
        this.loading = false;
        this.toast.error('Failed to load your tasks.');
      }
    });
  }

  getTotalActual(): number {
    if (!this.weekMember) return 0;
    return this.weekMember.tasks.reduce((sum, t) => sum + t.actualHours, 0);
  }

  getOverallProgress(): number {
    if (!this.weekMember || this.weekMember.tasks.length === 0) return 0;
    const total = this.weekMember.tasks.reduce((sum, t) => sum + t.progressPercent, 0);
    return Math.round(total / this.weekMember.tasks.length);
  }

  getCategoryLabel(category: number): string {
    switch (category) {
      case 1: return 'Client Focused';
      case 2: return 'Tech Debt';
      case 3: return 'R&D';
      default: return 'Unknown';
    }
  }

  getTaskStatus(task: MemberTask): string {
    if (task.progressPercent >= 100) return 'Done';
    if (task.progressPercent > 0 || task.actualHours > 0) return 'In Progress';
    return 'Not Started';
  }

  getTaskStatusClass(task: MemberTask): string {
    if (task.progressPercent >= 100) return 'task-status done';
    if (task.progressPercent > 0 || task.actualHours > 0) return 'task-status in-progress';
    return 'task-status not-started';
  }

  getProgressColorClass(percent: number): string {
    if (percent >= 70) return 'high';
    if (percent >= 30) return 'mid';
    return 'low';
  }

  onHoursChange(task: MemberTask, event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value) || 0;
    task.actualHours = Math.max(0, val);
  }

  onProgressSlide(task: MemberTask, event: Event): void {
    task.progressPercent = parseInt((event.target as HTMLInputElement).value, 10);
  }

  saveProgress(task: MemberTask): void {
    this.savingTaskId = task.id;
    const req: UpdateProgressRequest = {
      actualHours: task.actualHours,
      progressPercent: task.progressPercent
    };
    this.weekMemberService.updateProgress(task.id, req).subscribe({
      next: (updated) => {
        task.actualHours = updated.actualHours;
        task.progressPercent = updated.progressPercent;
        this.savingTaskId = null;
        this.toast.success(`Progress saved for "${task.backlogTitle}"`);
      },
      error: () => {
        this.savingTaskId = null;
        this.toast.error('Failed to save progress. Please try again.');
      }
    });
  }
}
