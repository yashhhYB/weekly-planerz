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
          <div class="alloc-sliders">
            <div class="slider-group">
              <div class="slider-header">
                <label for="clientPercent">Client Focused</label>
                <span class="slider-value blue">{{ form.get('clientPercent')?.value }}%</span>
              </div>
              <input type="range" id="clientPercent" formControlName="clientPercent" min="0" max="100" step="1" class="range-slider client" (input)="onSliderChange('client')" />
              <small class="hours-hint">{{ getClientHours() }}h of 30h</small>
            </div>
            <div class="slider-group">
              <div class="slider-header">
                <label for="techDebtPercent">Tech Debt</label>
                <span class="slider-value red">{{ form.get('techDebtPercent')?.value }}%</span>
              </div>
              <input type="range" id="techDebtPercent" formControlName="techDebtPercent" min="0" max="100" step="1" class="range-slider techdebt" (input)="onSliderChange('techDebt')" />
              <small class="hours-hint">{{ getTechDebtHours() }}h of 30h</small>
            </div>
            <div class="slider-group rnd-group">
              <div class="slider-header">
                <label>R&D</label>
                <span class="slider-value green">{{ form.get('rndPercent')?.value }}%</span>
              </div>
              <div class="rnd-bar-track">
                <div class="rnd-bar-fill" [style.width.%]="form.get('rndPercent')?.value"></div>
              </div>
              <small class="hours-hint">{{ getRndHours() }}h of 30h <span class="auto-tag">auto-calculated</span></small>
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
    .page h1 { margin: 0 0 4px 0; font-size: 28px; color: var(--text-heading); }
    .page-desc { margin: 0 0 24px; color: var(--text-secondary); font-size: 14px; }

    .form-card {
      background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 24px;
    }

    .field { margin-bottom: 18px; }
    label { display: block; margin-bottom: 6px; font-weight: 500; color: var(--text-primary); font-size: 14px; }

    input[type="date"], input[type="number"] {
      width: 100%; padding: 10px 12px;
      background: var(--bg-input); color: var(--text-primary);
      border: 1px solid var(--border); border-radius: 6px;
      font-size: 14px; font-family: inherit; box-sizing: border-box;
      transition: border-color 0.2s;
    }
    input:focus { outline: none; border-color: var(--border-hover); box-shadow: 0 0 0 3px rgba(31,111,235,0.15); }

    .hint { display: block; margin-top: 4px; color: var(--text-secondary); font-size: 12px; }
    .error-hint { display: block; margin-top: 4px; color: var(--danger); font-size: 12px; font-weight: 500; }
    .hours-hint { display: block; margin-top: 4px; color: var(--accent); font-size: 12px; font-weight: 600; }

    /* Members Section */
    .members-section {
      background: var(--bg-input); border: 1px solid var(--border); border-radius: 8px;
      padding: 20px; margin-bottom: 20px;
    }
    .members-section h3 { margin: 0 0 14px; color: var(--text-heading); font-size: 16px; }
    .members-section h3 .sub { font-weight: 400; color: var(--text-secondary); font-size: 13px; }
    .member-checkboxes { display: flex; flex-direction: column; gap: 8px; }
    .member-check {
      display: flex; align-items: center; gap: 12px; padding: 10px 14px;
      background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px;
      cursor: pointer; transition: all 0.2s; position: relative;
    }
    .member-check:hover { border-color: var(--border-hover); }
    .member-check.selected { border-color: var(--success); background: rgba(35,134,54,0.08); }
    .member-check input[type="checkbox"] { display: none; }
    .member-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--text-primary); font-weight: 700; font-size: 14px; flex-shrink: 0; }
    .member-avatar.lead { background: var(--accent); color: #fff; }
    .member-info { flex: 1; }
    .member-name { display: block; color: var(--text-heading); font-size: 14px; font-weight: 500; }
    .member-role { display: block; color: var(--text-secondary); font-size: 12px; }
    .check-icon { color: var(--success); font-size: 18px; font-weight: 700; }
    .selected-count { margin-top: 10px; font-size: 13px; color: var(--text-secondary); text-align: right; }
    .empty-members { text-align: center; padding: 16px; color: var(--text-secondary); font-size: 14px; }
    .empty-members a { color: var(--accent); text-decoration: none; }

    .alloc-section {
      background: var(--bg-input); border: 1px solid var(--border); border-radius: 8px;
      padding: 20px; margin-bottom: 20px;
    }
    .alloc-section h3 { margin: 0 0 16px 0; color: var(--text-heading); font-size: 16px; }
    .alloc-section h3 .sub { font-weight: 400; color: var(--text-secondary); font-size: 13px; }

    .alloc-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

    .alloc-sliders { display: flex; flex-direction: column; gap: 20px; }
    .slider-group { display: flex; flex-direction: column; gap: 6px; }
    .slider-header { display: flex; justify-content: space-between; align-items: center; }
    .slider-header label { margin-bottom: 0; font-weight: 600; }
    .slider-value { font-size: 18px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .slider-value.blue { color: var(--accent); }
    .slider-value.red { color: var(--danger); }
    .slider-value.green { color: var(--success); }
    .auto-tag { font-size: 10px; color: var(--text-muted); background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; margin-left: 4px; }

    .range-slider {
      -webkit-appearance: none; appearance: none; width: 100%; height: 8px;
      border-radius: 4px; outline: none; cursor: pointer;
      background: var(--bg-tertiary);
      border: none;
    }
    .range-slider::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 22px; height: 22px; border-radius: 50%;
      cursor: pointer; border: 3px solid var(--bg-card);
      box-shadow: 0 2px 6px rgba(0,0,0,0.3); transition: transform 0.15s;
    }
    .range-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
    .range-slider::-moz-range-thumb {
      width: 18px; height: 18px; border-radius: 50%;
      cursor: pointer; border: 3px solid var(--bg-card);
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .range-slider.client::-webkit-slider-thumb { background: var(--accent); }
    .range-slider.client::-moz-range-thumb { background: var(--accent); }
    .range-slider.techdebt::-webkit-slider-thumb { background: var(--danger); }
    .range-slider.techdebt::-moz-range-thumb { background: var(--danger); }

    .rnd-bar-track { height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden; }
    .rnd-bar-fill { height: 100%; background: var(--success); border-radius: 4px; transition: width 0.2s; }

    .rnd-group { opacity: 0.85; }

    .total-row {
      margin-top: 14px; padding: 10px; text-align: center;
      background: rgba(35,134,54,0.15); border-radius: 6px; color: var(--success);
    }
    .total-row.invalid { background: rgba(248,81,73,0.15); color: var(--danger); }
    .total-error { margin-left: 8px; font-size: 12px; }

    .form-actions { display: flex; gap: 10px; margin-top: 24px; }

    .btn-save {
      flex: 1; padding: 12px 20px; background: var(--success); color: white;
      border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;
      transition: background 0.2s;
    }
    .btn-save:hover:not(:disabled) { background: var(--success-hover); }
    .btn-save:disabled { opacity: 0.4; cursor: not-allowed; }

    .btn-cancel {
      flex: 1; padding: 12px 20px; background: var(--bg-tertiary); color: var(--text-primary);
      border: 1px solid var(--border); border-radius: 6px; cursor: pointer; font-size: 14px;
      transition: all 0.2s;
    }
    .btn-cancel:hover { background: var(--border); border-color: var(--border-hover); }

    .error-bar { background: rgba(248,81,73,0.1); color: var(--danger); padding: 12px 16px; border-radius: 6px; margin-top: 16px; border: 1px solid rgba(248,81,73,0.4); }

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
      clientPercent: [40, [Validators.required, Validators.min(0), Validators.max(100)]],
      techDebtPercent: [30, [Validators.required, Validators.min(0), Validators.max(100)]],
      rndPercent: [30, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  onSliderChange(changed: 'client' | 'techDebt'): void {
    const client = this.form.get('clientPercent')?.value || 0;
    const techDebt = this.form.get('techDebtPercent')?.value || 0;
    const sum = client + techDebt;
    if (sum > 100) {
      // Cap the other slider
      if (changed === 'client') {
        this.form.get('techDebtPercent')?.setValue(100 - client, { emitEvent: false });
      } else {
        this.form.get('clientPercent')?.setValue(100 - techDebt, { emitEvent: false });
      }
    }
    const c = this.form.get('clientPercent')?.value || 0;
    const t = this.form.get('techDebtPercent')?.value || 0;
    this.form.get('rndPercent')?.setValue(Math.max(0, 100 - c - t), { emitEvent: false });
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
