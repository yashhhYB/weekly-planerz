import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CreateBacklogItemRequest, UpdateBacklogItemRequest, BacklogCategory, BacklogCategoryLabels, UserRole } from '../../../../models';
import { AppStoreState } from '../../../../store';
import * as BacklogSelectors from '../../../../store/backlog/backlog.selectors';
import * as BacklogActions from '../../../../store/backlog/backlog.actions';
import { UserContextService } from '../../../../core/services/user-context.service';

@Component({
  selector: 'app-backlog-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="page">
      <h1>{{ isEdit ? 'Edit Backlog Item' : 'Create Backlog Item' }}</h1>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-card">
        <div class="field">
          <label for="title">Title *</label>
          <input type="text" id="title" formControlName="title" placeholder="Enter item title" required />
        </div>

        <div class="field">
          <label for="description">Description</label>
          <textarea id="description" formControlName="description" rows="4" placeholder="Describe what needs to be done"></textarea>
        </div>

        <div class="form-row">
          <div class="field">
            <label for="category">Category *</label>
            <select id="category" formControlName="category" required [attr.disabled]="!isLead ? '' : null">
              <option [ngValue]="0" disabled>Select Category</option>
              <option *ngFor="let cat of categoryOptions" [ngValue]="cat.value">{{ cat.label }}</option>
            </select>
            <small *ngIf="!isLead" class="hint">Only the Team Lead can change category</small>
          </div>
          <div class="field">
            <label for="estimatedHours">Estimated Hours *</label>
            <input type="number" id="estimatedHours" formControlName="estimatedHours" min="0" max="168" step="0.5" required />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-save" [disabled]="!form.valid || submitting">{{ submitting ? 'Saving...' : 'Save' }}</button>
          <button type="button" class="btn-cancel" (click)="onCancel()">Cancel</button>
        </div>
      </form>

      <div *ngIf="error$ | async as error" class="error-bar">{{ error }}</div>
    </div>
  `,
  styles: [`
    .page { padding: 32px 0; max-width: 600px; margin: 0 auto; }
    .page h1 { margin: 0 0 24px 0; font-size: 28px; color: var(--text-heading); }

    .form-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 24px; }

    .field { margin-bottom: 18px; }
    label { display: block; margin-bottom: 6px; font-weight: 500; color: var(--text-primary); font-size: 14px; }

    input, textarea, select {
      width: 100%; padding: 10px 12px;
      background: var(--bg-input); color: var(--text-primary);
      border: 1px solid var(--border); border-radius: 6px;
      font-size: 14px; font-family: inherit; box-sizing: border-box;
      transition: border-color 0.2s;
    }
    input:focus, textarea:focus, select:focus { outline: none; border-color: var(--border-hover); box-shadow: 0 0 0 3px rgba(31,111,235,0.15); }
    textarea { resize: vertical; min-height: 80px; }
    select { cursor: pointer; }
    select[disabled] { opacity: 0.6; cursor: not-allowed; }
    select option { background: var(--bg-card); color: var(--text-primary); }
    .hint { display: block; margin-top: 4px; color: var(--text-muted); font-size: 12px; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-actions { display: flex; gap: 10px; margin-top: 24px; }

    .btn-save {
      flex: 1; padding: 10px 20px; background: var(--success); color: white;
      border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600;
      transition: all 0.2s;
    }
    .btn-save:hover:not(:disabled) { filter: brightness(1.15); }
    .btn-save:disabled { opacity: 0.4; cursor: not-allowed; }

    .btn-cancel {
      flex: 1; padding: 10px 20px; background: var(--bg-tertiary); color: var(--text-primary);
      border: 1px solid var(--border); border-radius: 6px; cursor: pointer; font-size: 14px;
      transition: all 0.2s;
    }
    .btn-cancel:hover { background: var(--border); border-color: var(--border-hover); }

    .error-bar { background: rgba(248,81,73,0.1); color: var(--danger); padding: 12px 16px; border-radius: 6px; margin-top: 16px; border: 1px solid rgba(248,81,73,0.4); }

    @media (max-width: 640px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class BacklogFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEdit = false;
  submitting = false;
  isLead = false;
  error$: Observable<string | null>;
  private backlogId: string | null = null;
  private destroy$ = new Subject<void>();

  categoryOptions = [
    { value: BacklogCategory.ClientFocused, label: BacklogCategoryLabels[BacklogCategory.ClientFocused] },
    { value: BacklogCategory.TechDebt, label: BacklogCategoryLabels[BacklogCategory.TechDebt] },
    { value: BacklogCategory.RnD, label: BacklogCategoryLabels[BacklogCategory.RnD] }
  ];

  constructor(
    private fb: FormBuilder,
    private store: Store<AppStoreState>,
    private route: ActivatedRoute,
    private router: Router,
    private userContext: UserContextService
  ) {
    this.initializeForm();
    this.error$ = this.store.select(BacklogSelectors.selectBacklogError);
  }

  ngOnInit(): void {
    this.userContext.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.isLead = user?.role === UserRole.TeamLead;
    });
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.backlogId = params['id'];
        this.store.dispatch(BacklogActions.loadBacklogItemById({ id: params['id'] }));
        this.store.select(BacklogSelectors.selectBacklogItemById(params['id']))
          .pipe(takeUntil(this.destroy$))
          .subscribe(item => {
            if (item) {
              this.form.patchValue({
                title: item.title,
                description: item.description,
                category: item.category,
                estimatedHours: item.estimatedHours
              });
            }
          });
      }
    });

    // Navigate on success
    this.store.select(BacklogSelectors.selectBacklogLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        if (this.submitting && !loading) {
          this.submitting = false;
          this.router.navigate(['/backlog']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: [0, [Validators.required, Validators.min(1)]],
      estimatedHours: [1, [Validators.required, Validators.min(0), Validators.max(168)]]
    });
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    this.submitting = true;

    if (this.isEdit && this.backlogId) {
      const updateRequest: UpdateBacklogItemRequest = {
        title: this.form.value.title,
        description: this.form.value.description,
        category: this.form.value.category,
        estimatedHours: this.form.value.estimatedHours
      };
      this.store.dispatch(BacklogActions.updateBacklogItem({ 
        id: this.backlogId, 
        request: updateRequest 
      }));
    } else {
      const createRequest: CreateBacklogItemRequest = {
        title: this.form.value.title,
        description: this.form.value.description,
        category: this.form.value.category,
        estimatedHours: this.form.value.estimatedHours
      };
      this.store.dispatch(BacklogActions.createBacklogItem({ request: createRequest }));
    }
  }

  onCancel(): void {
    if (this.isEdit && this.backlogId) {
      this.router.navigate(['/backlog', this.backlogId]);
    } else {
      this.router.navigate(['/backlog']);
    }
  }
}
