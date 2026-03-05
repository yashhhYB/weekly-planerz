import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter, first } from 'rxjs/operators';
import { CreatePlanningWeekRequest, UpdatePlanningWeekRequest, TeamMember } from '../../../../models';
import { AppStoreState } from '../../../../store';
import * as PlanningSelectors from '../../../../store/planning/planning.selectors';
import * as PlanningActions from '../../../../store/planning/planning.actions';
import * as TeamSelectors from '../../../../store/team/team.selectors';
import * as TeamActions from '../../../../store/team/team.actions';
import { WeekMemberService } from '../../../../core/services/week-member.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-planning-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="page">
      <h1>{{ isEdit ? 'Edit Planning Week' : 'Start a New Week' }}</h1>
      <p class="page-desc" *ngIf="!isEdit">Create a new weekly planning cycle. Select team members and set category allocation.</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-card">
        <div *ngIf="!isEdit" class="field">
          <label for="planningDate">Planning Date (must be a Tuesday)</label>
          <input type="date" id="planningDate" formControlName="planningDate" required />
          <small *ngIf="!dateError" class="hint">Week runs Wednesday to Monday (30 hours total)</small>
          <small *ngIf="dateError" class="error-hint">{{ dateError }}</small>
        </div>

        <!-- Team Member Selection (Create only) -->
        <div *ngIf="!isEdit" class="members-section">
          <h3>Select Team Members <span class="sub">(who participates this week?)</span></h3>
          <div class="member-checkboxes">
            <label class="member-check" *ngFor="let m of teamMembers" [class.selected]="selectedMemberIds.has(m.id)">
              <input type="checkbox" [checked]="selectedMemberIds.has(m.id)" (change)="toggleMember(m.id)" />
              <div class="member-avatar" [class.lead]="m.role === 2">{{ m.name.charAt(0).toUpperCase() }}</div>
              <div class="member-info">
                <span class="member-name">{{ m.name }}</span>
                <span class="member-role">{{ m.role === 2 ? 'Lead' : 'Member' }}</span>
              </div>
              <span class="check-icon" *ngIf="selectedMemberIds.has(m.id)">✓</span>
            </label>
            <div class="empty-members" *ngIf="teamMembers.length === 0">
              No team members found. <a routerLink="/team">Add members first →</a>
            </div>
          </div>
          <div class="selected-count" *ngIf="teamMembers.length > 0">
            {{ selectedMemberIds.size }} of {{ teamMembers.length }} selected
          </div>
        </div>

        <div class="alloc-section">
          <h3>Category Allocation <span class="sub">(must sum to 100%)</span></h3>
          <div class="alloc-row">
            <div class="field">
              <label for="clientPercent">Client Focused %</label>
              <input type="number" id="clientPercent" formControlName="clientPercent" min="0" max="100" step="1" required />
              <small class="hours-hint">{{ getClientHours() }}h</small>
            </div>
            <div class="field">
              <label for="techDebtPercent">Tech Debt %</label>
              <input type="number" id="techDebtPercent" formControlName="techDebtPercent" min="0" max="100" step="1" required />
              <small class="hours-hint">{{ getTechDebtHours() }}h</small>
            </div>
            <div class="field">
              <label for="rndPercent">R&D %</label>
              <input type="number" id="rndPercent" formControlName="rndPercent" min="0" max="100" step="1" required />
              <small class="hours-hint">{{ getRndHours() }}h</small>
            </div>
          </div>
          <div class="total-row" [class.invalid]="getTotal() !== 100">
            <strong>Total: {{ getTotal() }}%</strong>
            <span *ngIf="getTotal() !== 100" class="total-error">Must equal 100%</span>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-save" [disabled]="!form.valid || submitting || getTotal() !== 100 || (!isEdit && !!dateError) || (!isEdit && selectedMemberIds.size === 0)">
            {{ submitting ? 'Creating...' : (isEdit ? 'Save Changes' : 'Create Week & Assign Members') }}
          </button>
          <button type="button" class="btn-cancel" (click)="onCancel()">Cancel</button>
        </div>
      </form>

      <div *ngIf="error$ | async as error" class="error-bar">{{ error }}</div>
    </div>
  `,
  styles: [`
    .page { padding: 32px 0; max-width: 640px; margin: 0 auto; }
    .page h1 { margin: 0 0 4px 0; font-size: 28px; color: #f0f6fc; }
    .page-desc { margin: 0 0 24px; color: #8b949e; font-size: 14px; }

    .form-card {
      background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 24px;
    }

    .field { margin-bottom: 18px; }
    label { display: block; margin-bottom: 6px; font-weight: 500; color: #e1e4e8; font-size: 14px; }

    input[type="date"], input[type="number"] {
      width: 100%; padding: 10px 12px;
      background: #0d1117; color: #e1e4e8;
      border: 1px solid #30363d; border-radius: 6px;
      font-size: 14px; font-family: inherit; box-sizing: border-box;
      transition: border-color 0.2s;
    }
    input:focus { outline: none; border-color: #58a6ff; box-shadow: 0 0 0 3px rgba(31,111,235,0.15); }

    .hint { display: block; margin-top: 4px; color: #8b949e; font-size: 12px; }
    .error-hint { display: block; margin-top: 4px; color: #f85149; font-size: 12px; font-weight: 500; }
    .hours-hint { display: block; margin-top: 4px; color: #58a6ff; font-size: 12px; font-weight: 600; }

    /* Members Section */
    .members-section {
      background: #0d1117; border: 1px solid #21262d; border-radius: 8px;
      padding: 20px; margin-bottom: 20px;
    }
    .members-section h3 { margin: 0 0 14px; color: #f0f6fc; font-size: 16px; }
    .members-section h3 .sub { font-weight: 400; color: #8b949e; font-size: 13px; }
    .member-checkboxes { display: flex; flex-direction: column; gap: 8px; }
    .member-check {
      display: flex; align-items: center; gap: 12px; padding: 10px 14px;
      background: #161b22; border: 1px solid #30363d; border-radius: 8px;
      cursor: pointer; transition: all 0.2s; position: relative;
    }
    .member-check:hover { border-color: #58a6ff; }
    .member-check.selected { border-color: #238636; background: rgba(35,134,54,0.08); }
    .member-check input[type="checkbox"] { display: none; }
    .member-avatar { width: 34px; height: 34px; border-radius: 50%; background: #30363d; display: flex; align-items: center; justify-content: center; color: #e1e4e8; font-weight: 700; font-size: 14px; flex-shrink: 0; }
    .member-avatar.lead { background: #1f6feb; }
    .member-info { flex: 1; }
    .member-name { display: block; color: #f0f6fc; font-size: 14px; font-weight: 500; }
    .member-role { display: block; color: #8b949e; font-size: 12px; }
    .check-icon { color: #3fb950; font-size: 18px; font-weight: 700; }
    .selected-count { margin-top: 10px; font-size: 13px; color: #8b949e; text-align: right; }
    .empty-members { text-align: center; padding: 16px; color: #8b949e; font-size: 14px; }
    .empty-members a { color: #58a6ff; text-decoration: none; }

    .alloc-section {
      background: #0d1117; border: 1px solid #21262d; border-radius: 8px;
      padding: 20px; margin-bottom: 20px;
    }
    .alloc-section h3 { margin: 0 0 16px 0; color: #f0f6fc; font-size: 16px; }
    .alloc-section h3 .sub { font-weight: 400; color: #8b949e; font-size: 13px; }

    .alloc-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

    .total-row {
      margin-top: 14px; padding: 10px; text-align: center;
      background: rgba(35,134,54,0.15); border-radius: 6px; color: #3fb950;
    }
    .total-row.invalid { background: rgba(248,81,73,0.15); color: #f85149; }
    .total-error { margin-left: 8px; font-size: 12px; }

    .form-actions { display: flex; gap: 10px; margin-top: 24px; }

    .btn-save {
      flex: 1; padding: 12px 20px; background: #238636; color: white;
      border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;
      transition: background 0.2s;
    }
    .btn-save:hover:not(:disabled) { background: #2ea043; }
    .btn-save:disabled { opacity: 0.4; cursor: not-allowed; }

    .btn-cancel {
      flex: 1; padding: 12px 20px; background: #21262d; color: #e1e4e8;
      border: 1px solid #30363d; border-radius: 6px; cursor: pointer; font-size: 14px;
      transition: all 0.2s;
    }
    .btn-cancel:hover { background: #30363d; border-color: #58a6ff; }

    .error-bar { background: rgba(248,81,73,0.1); color: #f85149; padding: 12px 16px; border-radius: 6px; margin-top: 16px; border: 1px solid rgba(248,81,73,0.4); }

    @media (max-width: 640px) { .alloc-row { grid-template-columns: 1fr; } }
  `]
})
export class PlanningFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEdit = false;
  submitting = false;
  dateError: string | null = null;
  error$: Observable<string | null>;
  teamMembers: TeamMember[] = [];
  selectedMemberIds = new Set<string>();
  private planningId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store<AppStoreState>,
    private route: ActivatedRoute,
    private router: Router,
    private weekMemberService: WeekMemberService,
    private toast: ToastService
  ) {
    this.initializeForm();
    this.error$ = this.store.select(PlanningSelectors.selectPlanningError);
  }

  ngOnInit(): void {
    // Load team members for selection
    this.store.dispatch(TeamActions.loadTeamMembers());
    this.store.select(TeamSelectors.selectAllTeamMembers)
      .pipe(takeUntil(this.destroy$))
      .subscribe(members => {
        this.teamMembers = members;
        // Auto-select all members by default
        if (this.selectedMemberIds.size === 0 && members.length > 0) {
          members.forEach(m => this.selectedMemberIds.add(m.id));
        }
      });

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.planningId = params['id'];
        this.store.dispatch(PlanningActions.loadPlanningWeekById({ id: params['id'] }));
        this.store.select(PlanningSelectors.selectPlanningWeekById(params['id']))
          .pipe(takeUntil(this.destroy$))
          .subscribe(week => {
            if (week) {
              this.form.patchValue({
                clientPercent: week.clientPercent,
                techDebtPercent: week.techDebtPercent,
                rndPercent: week.rndPercent
              });
            }
          });
      }
    });

    // Navigate on success — for create, also add members to the week
    this.store.select(PlanningSelectors.selectPlanningLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        if (this.submitting && !loading) {
          if (this.isEdit) {
            this.submitting = false;
            this.router.navigate(['/planning']);
          }
          // For create: handled in onSubmit via createPlanningWeekSuccess listener
        }
      });

    // Tuesday validation for planning date
    if (!this.isEdit) {
      this.form.get('planningDate')?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(value => {
          this.dateError = this.validateTuesday(value);
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMember(id: string): void {
    if (this.selectedMemberIds.has(id)) {
      this.selectedMemberIds.delete(id);
    } else {
      this.selectedMemberIds.add(id);
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      planningDate: ['', Validators.required],
      clientPercent: [34, [Validators.required, Validators.min(0), Validators.max(100)]],
      techDebtPercent: [33, [Validators.required, Validators.min(0), Validators.max(100)]],
      rndPercent: [33, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  getTotal(): number {
    const c = this.form.get('clientPercent')?.value || 0;
    const t = this.form.get('techDebtPercent')?.value || 0;
    const r = this.form.get('rndPercent')?.value || 0;
    return c + t + r;
  }

  getClientHours(): string { return ((this.form.get('clientPercent')?.value || 0) * 30 / 100).toFixed(1); }
  getTechDebtHours(): string { return ((this.form.get('techDebtPercent')?.value || 0) * 30 / 100).toFixed(1); }
  getRndHours(): string { return ((this.form.get('rndPercent')?.value || 0) * 30 / 100).toFixed(1); }

  private validateTuesday(dateStr: string): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr + 'T00:00:00');
    if (date.getDay() !== 2) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `Selected date is a ${dayNames[date.getDay()]}. Planning date must be a Tuesday.`;
    }
    return null;
  }

  onSubmit(): void {
    if (!this.form.valid || this.getTotal() !== 100) return;

    if (!this.isEdit) {
      this.dateError = this.validateTuesday(this.form.value.planningDate);
      if (this.dateError) return;
    }

    this.submitting = true;

    if (this.isEdit && this.planningId) {
      const updateRequest: UpdatePlanningWeekRequest = {
        clientPercent: this.form.value.clientPercent,
        techDebtPercent: this.form.value.techDebtPercent,
        rndPercent: this.form.value.rndPercent
      };
      this.store.dispatch(PlanningActions.updatePlanningWeek({ 
        id: this.planningId, 
        request: updateRequest 
      }));
    } else {
      const createRequest: CreatePlanningWeekRequest = {
        planningDate: new Date(this.form.value.planningDate).toISOString(),
        clientPercent: this.form.value.clientPercent,
        techDebtPercent: this.form.value.techDebtPercent,
        rndPercent: this.form.value.rndPercent
      };
      this.store.dispatch(PlanningActions.createPlanningWeek({ request: createRequest }));

      // After the week is created, add selected members
      const memberIds = Array.from(this.selectedMemberIds);
      this.store.select(PlanningSelectors.selectAllPlanningWeeks)
        .pipe(
          filter(weeks => !!weeks && weeks.length > 0),
          takeUntil(this.destroy$)
        )
        .subscribe(weeks => {
          if (!this.submitting) return;
          // Find the newly created week (most recent)
          const sorted = [...weeks].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          const newWeek = sorted[0];
          if (newWeek && memberIds.length > 0) {
            this.weekMemberService.addWeekMembers(newWeek.id, memberIds).subscribe({
              next: () => {
                this.submitting = false;
                this.toast.success('Week created with ' + memberIds.length + ' members!');
                this.router.navigate(['/planning', newWeek.id]);
              },
              error: () => {
                this.submitting = false;
                this.toast.error('Week created but failed to add members');
                this.router.navigate(['/planning', newWeek.id]);
              }
            });
          } else if (newWeek) {
            this.submitting = false;
            this.router.navigate(['/planning', newWeek.id]);
          }
        });
    }
  }

  onCancel(): void {
    if (this.isEdit && this.planningId) {
      this.router.navigate(['/planning', this.planningId]);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
