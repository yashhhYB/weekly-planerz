import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PlanningService } from '../../../../core/services';
import { CreatePlanningWeekRequest } from '../../../../models';

@Component({
  selector: 'app-planning-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="planning-form-container">
      <h1>{{ isEdit ? 'Edit Planning Week' : 'Create Planning Week' }}</h1>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="weekStartDate">Week Start Date (Tuesday)</label>
          <input
            type="date"
            id="weekStartDate"
            formControlName="weekStartDate"
            required
          />
        </div>

        <div class="form-group">
          <label for="goals">Goals</label>
          <textarea
            id="goals"
            formControlName="goals"
            rows="4"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label for="keyActivities">Key Activities</label>
          <textarea
            id="keyActivities"
            formControlName="keyActivities"
            rows="4"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label for="healthScore">Health Score (1-10)</label>
          <input
            type="number"
            id="healthScore"
            formControlName="healthScore"
            min="1"
            max="10"
            required
          />
        </div>

        <div class="form-group">
          <label for="productivity">Productivity (%)</label>
          <input
            type="number"
            id="productivity"
            formControlName="productivity"
            min="0"
            max="100"
            required
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="!form.valid || submitting">
            {{ submitting ? 'Saving...' : 'Save' }}
          </button>
          <button type="button" class="btn btn-secondary" (click)="onCancel()">
            Cancel
          </button>
        </div>
      </form>

      <div *ngIf="error" class="error-message">
        <p>{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .planning-form-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 30px;
      color: #333;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #333;
    }

    input, textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      font-family: inherit;
    }

    input:focus, textarea:focus {
      outline: none;
      border-color: #1976d2;
      box-shadow: 0 0 5px rgba(25, 118, 210, 0.3);
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 30px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.3s;
    }

    .btn-primary {
      background: #1976d2;
      color: white;
      flex: 1;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1565c0;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f0f0f0;
      color: #333;
      border: 1px solid #ddd;
      flex: 1;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 15px;
      border-radius: 4px;
      margin-top: 20px;
    }
  `]
})
export class PlanningFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  submitting = false;
  error: string | null = null;
  private planningId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private planningService: PlanningService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.planningId = params['id'];
        this.loadPlanningWeek();
      }
    });
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      weekStartDate: ['', Validators.required],
      goals: ['', Validators.required],
      keyActivities: ['', Validators.required],
      healthScore: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      productivity: [50, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  private loadPlanningWeek(): void {
    if (!this.planningId) return;

    this.planningService.getPlanningWeekById(this.planningId).subscribe({
      next: (week) => {
        this.form.patchValue({
          weekStartDate: this.formatDateForInput(week.weekStartDate),
          goals: week.goals,
          keyActivities: week.keyActivities,
          healthScore: week.healthScore,
          productivity: week.productivity
        });
      },
      error: (err) => {
        this.error = 'Failed to load planning week';
      }
    });
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    this.submitting = true;
    this.error = null;

    const request: CreatePlanningWeekRequest = this.form.value;

    if (this.isEdit && this.planningId) {
      this.planningService.updatePlanningWeek(this.planningId, request).subscribe({
        next: () => {
          this.router.navigate(['/planning', this.planningId]);
        },
        error: (err) => {
          this.error = err.message || 'Failed to update planning week';
          this.submitting = false;
        }
      });
    } else {
      this.planningService.createPlanningWeek(request).subscribe({
        next: (week) => {
          this.router.navigate(['/planning', week.id]);
        },
        error: (err) => {
          this.error = err.message || 'Failed to create planning week';
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    if (this.isEdit && this.planningId) {
      this.router.navigate(['/planning', this.planningId]);
    } else {
      this.router.navigate(['/planning']);
    }
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }
}
