import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { WeekMember, MemberTask, BacklogItem, BacklogCategory, BacklogCategoryLabels } from '../../../../models';
import { WeekMemberService } from '../../../../core/services/week-member.service';
import { BacklogService } from '../../../../core/services/backlog.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-member-board',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>📋 Planning Board</h1>
          <p class="subtitle" *ngIf="weekMember">{{ weekMember.memberName }}'s Week Plan</p>
        </div>
        <div class="header-actions">
          <a [routerLink]="['/planning', weekId]" class="btn-back">← Back to Week</a>
          <a routerLink="/home" class="btn-back">🏠 Home</a>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Loading board...</div>

      <div *ngIf="!loading && weekMember" class="board-layout">
        <!-- Submitted Banner -->
        <div class="submitted-banner" *ngIf="weekMember.hasSubmitted">
          ✅ Plan submitted ({{ weekMember.totalPlannedHours }}h planned)
        </div>

        <!-- Hours Summary Bar -->
        <div class="hours-bar">
          <div class="hours-info">
            <span class="hours-used" [class.full]="totalPlanned >= 30" [class.over]="totalPlanned > 30">
              {{ totalPlanned.toFixed(1) }}h
            </span>
            <span class="hours-sep">/</span>
            <span class="hours-total">30h</span>
          </div>
          <div class="hours-track">
            <div class="hours-fill" [style.width.%]="(totalPlanned / 30) * 100 | number:'1.0-0'" [class.full]="totalPlanned >= 30" [class.over]="totalPlanned > 30"></div>
          </div>
          <button class="btn-submit" (click)="submitPlan()" [disabled]="weekMember.hasSubmitted || totalPlanned !== 30">
            {{ weekMember.hasSubmitted ? '✅ Submitted' : 'Submit Plan' }}
          </button>
        </div>

        <!-- Category Quotas -->
        <div class="category-quotas">
          <div class="quota" *ngFor="let cat of categoryQuotas">
            <span class="cat-dot" [style.background]="cat.color"></span>
            <span class="cat-name">{{ cat.label }}</span>
            <span class="cat-hours">{{ cat.usedHours.toFixed(1) }} / {{ cat.maxHours.toFixed(1) }}h</span>
            <div class="quota-track">
              <div class="quota-fill" [style.width.%]="cat.maxHours > 0 ? (cat.usedHours / cat.maxHours) * 100 : 0" [style.background]="cat.color"></div>
            </div>
          </div>
        </div>

        <div class="two-panels">
          <!-- Left: Available Backlog -->
          <div class="panel">
            <h2>Available Backlog</h2>
            <div class="search-box">
              <input type="text" [(ngModel)]="searchTerm" placeholder="Search tasks..." class="search-input" />
            </div>
            <div class="task-list">
              <div class="task-card" *ngFor="let item of filteredBacklog">
                <div class="task-top">
                  <span class="cat-badge" [ngClass]="'cat-' + item.category">{{ getCategoryLabel(item.category) }}</span>
                  <span class="est-hours">{{ item.estimatedHours }}h est.</span>
                </div>
                <div class="task-title">{{ item.title }}</div>
                <div class="task-desc" *ngIf="item.description">{{ item.description }}</div>
                <div class="task-bottom" *ngIf="!weekMember!.hasSubmitted">
                  <input type="number" [(ngModel)]="assignHours[item.id]" min="0.5" max="30" step="0.5" class="hours-input" placeholder="Hours" />
                  <button class="btn-assign" (click)="assignTask(item)" [disabled]="!assignHours[item.id] || assignHours[item.id]! <= 0">
                    + Assign
                  </button>
                </div>
              </div>
              <div class="empty" *ngIf="filteredBacklog.length === 0">No available tasks</div>
            </div>
          </div>

          <!-- Right: Assigned Tasks -->
          <div class="panel">
            <h2>My Assigned Tasks ({{ weekMember.tasks.length }})</h2>
            <div class="task-list">
              <div class="assigned-card" *ngFor="let task of weekMember.tasks">
                <div class="task-top">
                  <span class="cat-badge" [ngClass]="'cat-' + task.backlogCategory">{{ getCategoryLabel(task.backlogCategory) }}</span>
                  <span class="planned-hours">{{ task.plannedHours }}h planned</span>
                </div>
                <div class="task-title">{{ task.backlogTitle }}</div>
                <div class="task-bottom" *ngIf="!weekMember!.hasSubmitted">
                  <button class="btn-remove" (click)="removeTask(task)">Remove</button>
                </div>
              </div>
              <div class="empty" *ngIf="weekMember.tasks.length === 0">No tasks assigned yet. Pick from the backlog!</div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="error" class="error-bar">{{ error }}</div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 24px 0; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .page-header h1 { color: #f0f6fc; margin: 0 0 4px; font-size: 24px; }
    .subtitle { color: #8b949e; margin: 0; font-size: 14px; }
    .header-actions { display: flex; gap: 8px; }
    .btn-back { color: #58a6ff; text-decoration: none; font-size: 14px; padding: 8px 16px; border: 1px solid #30363d; border-radius: 8px; }
    .btn-back:hover { background: #161b22; }
    .loading { text-align: center; padding: 60px; color: #8b949e; }

    .submitted-banner { background: rgba(35,134,54,0.15); border: 1px solid rgba(35,134,54,0.4); color: #3fb950; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-weight: 600; text-align: center; }

    .hours-bar { display: flex; align-items: center; gap: 16px; background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .hours-info { display: flex; align-items: baseline; gap: 4px; min-width: 90px; }
    .hours-used { font-size: 22px; font-weight: 700; color: #58a6ff; }
    .hours-used.full { color: #3fb950; }
    .hours-used.over { color: #f85149; }
    .hours-sep { color: #484f58; font-size: 18px; }
    .hours-total { color: #8b949e; font-size: 16px; }
    .hours-track { flex: 1; height: 8px; background: #21262d; border-radius: 4px; overflow: hidden; }
    .hours-fill { height: 100%; background: #1f6feb; border-radius: 4px; transition: width 0.3s; }
    .hours-fill.full { background: #238636; }
    .hours-fill.over { background: #da3633; }
    .btn-submit { background: #238636; border: none; color: #fff; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .btn-submit:hover:not(:disabled) { background: #2ea043; }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

    .category-quotas { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .quota { display: flex; align-items: center; gap: 8px; background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 10px 14px; flex: 1; min-width: 200px; }
    .cat-dot { width: 10px; height: 10px; border-radius: 50%; }
    .cat-name { color: #e1e4e8; font-size: 13px; font-weight: 500; }
    .cat-hours { color: #8b949e; font-size: 13px; margin-left: auto; }
    .quota-track { width: 60px; height: 6px; background: #21262d; border-radius: 3px; overflow: hidden; }
    .quota-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }

    .two-panels { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .panel { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px; }
    .panel h2 { color: #f0f6fc; font-size: 16px; margin: 0 0 12px; padding-bottom: 10px; border-bottom: 1px solid #21262d; }

    .search-box { margin-bottom: 12px; }
    .search-input { width: 100%; background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 8px 12px; color: #e1e4e8; font-size: 14px; box-sizing: border-box; }
    .search-input:focus { outline: none; border-color: #58a6ff; }

    .task-list { display: flex; flex-direction: column; gap: 8px; max-height: 500px; overflow-y: auto; }
    .task-card, .assigned-card { background: #0d1117; border: 1px solid #21262d; border-radius: 8px; padding: 12px; }
    .task-card:hover, .assigned-card:hover { border-color: #30363d; }
    .task-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .cat-badge { font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
    .cat-1 { background: rgba(31,111,235,0.2); color: #58a6ff; }
    .cat-2 { background: rgba(218,54,51,0.2); color: #f85149; }
    .cat-3 { background: rgba(35,134,54,0.2); color: #3fb950; }
    .est-hours { color: #8b949e; font-size: 12px; }
    .planned-hours { color: #58a6ff; font-size: 12px; font-weight: 600; }
    .task-title { color: #e1e4e8; font-size: 14px; font-weight: 500; margin-bottom: 4px; }
    .task-desc { color: #8b949e; font-size: 12px; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .task-bottom { display: flex; gap: 8px; align-items: center; margin-top: 8px; }
    .hours-input { width: 70px; background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 6px 8px; color: #e1e4e8; font-size: 13px; }
    .hours-input:focus { outline: none; border-color: #58a6ff; }
    .btn-assign { background: #238636; border: none; color: #fff; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-assign:hover:not(:disabled) { background: #2ea043; }
    .btn-assign:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-remove { background: rgba(218,54,51,0.1); border: 1px solid rgba(218,54,51,0.3); color: #f85149; padding: 6px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; }
    .btn-remove:hover { background: rgba(218,54,51,0.2); }

    .empty { text-align: center; padding: 24px; color: #8b949e; font-size: 14px; }
    .error-bar { background: rgba(248,81,73,0.1); color: #f85149; padding: 12px 16px; border-radius: 6px; margin-top: 16px; border: 1px solid rgba(248,81,73,0.4); }

    @media (max-width: 768px) {
      .two-panels { grid-template-columns: 1fr; }
      .category-quotas { flex-direction: column; }
    }
  `]
})
export class MemberBoardComponent implements OnInit, OnDestroy {
  weekId = '';
  weekMemberId = '';
  weekMember: WeekMember | null = null;
  backlogItems: BacklogItem[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  assignHours: Record<string, number> = {};
  totalPlanned = 0;
  categoryQuotas: { category: number; label: string; color: string; maxHours: number; usedHours: number }[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private weekMemberService: WeekMemberService,
    private backlogService: BacklogService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.weekId = params['weekId'];
      this.weekMemberId = params['weekMemberId'];
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
      member: this.weekMemberService.getWeekMember(this.weekMemberId),
      backlog: this.backlogService.getAllBacklogItems()
    }).subscribe({
      next: ({ member, backlog }) => {
        this.weekMember = member;
        this.backlogItems = backlog;
        this.recalculate();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load board data';
        this.loading = false;
      }
    });
  }

  get filteredBacklog(): BacklogItem[] {
    const assignedIds = new Set(this.weekMember?.tasks.map(t => t.backlogItemId) || []);
    let items = this.backlogItems.filter(i => !i.isArchived && !assignedIds.has(i.id));
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      items = items.filter(i => i.title.toLowerCase().includes(term) || i.description?.toLowerCase().includes(term));
    }
    return items;
  }

  getCategoryLabel(cat: number): string {
    return BacklogCategoryLabels[cat] || 'Unknown';
  }

  assignTask(item: BacklogItem) {
    const hours = this.assignHours[item.id];
    if (!hours || hours <= 0) return;
    this.weekMemberService.assignTask(this.weekMemberId, { backlogItemId: item.id, plannedHours: hours }).subscribe({
      next: () => {
        this.toast.success('Task assigned!');
        delete this.assignHours[item.id];
        this.loadData();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Failed to assign task');
      }
    });
  }

  removeTask(task: MemberTask) {
    if (!confirm('Remove this task assignment?')) return;
    this.weekMemberService.removeTask(task.id).subscribe({
      next: () => {
        this.toast.success('Task removed');
        this.loadData();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Failed to remove task');
      }
    });
  }

  submitPlan() {
    if (this.totalPlanned !== 30) {
      this.toast.error('Total planned hours must be exactly 30h');
      return;
    }
    this.weekMemberService.submitPlan(this.weekMemberId).subscribe({
      next: () => {
        this.toast.success('Plan submitted successfully!');
        this.loadData();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Failed to submit plan');
      }
    });
  }

  private recalculate() {
    if (!this.weekMember) return;
    this.totalPlanned = this.weekMember.tasks.reduce((s, t) => s + t.plannedHours, 0);

    const catConfig = [
      { category: BacklogCategory.ClientFocused, label: 'Client Focused', color: '#1f6feb' },
      { category: BacklogCategory.TechDebt, label: 'Tech Debt', color: '#da3633' },
      { category: BacklogCategory.RnD, label: 'R&D', color: '#238636' }
    ];
    // Category quotas are derived from week allocation, but we don't have week data here
    // So we just show usage per category out of 30h
    this.categoryQuotas = catConfig.map(c => ({
      ...c,
      maxHours: 30,
      usedHours: this.weekMember!.tasks.filter(t => t.backlogCategory === c.category).reduce((s, t) => s + t.plannedHours, 0)
    }));
  }
}
