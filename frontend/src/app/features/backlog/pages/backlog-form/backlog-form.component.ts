import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { BacklogService } from '../../../../core/services';
import { CreateBacklogItemRequest, BacklogCategory, BacklogStatus } from '../../../../models';

@Component({
  selector: 'app-backlog-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="backlog-form-container">
      <h1>{{ isEdit ? 'Edit Backlog Item' : 'Create Backlog Item' }}</h1>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="title">Title *</label>
          <input
            type="text"
            id="title"
            formControlName="title"
            placeholder="Enter item title"
            required
          />
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            formControlName="description"
            rows="4"
            placeholder="Describe what needs to be done"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="category">Category *</label>
            <select
              id="category"
              formControlName="category"
              required
            >
              <option value="">Select Category</option>
              <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="priority">Priority (1-5) *</label>
            <input
              type="number"
              id="priority"
              formControlName="priority"
              min="1"
              max="5"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="estimatedHours">Estimated Hours (0-168) *</label>
          <input
            type="number"
            id="estimatedHours"
            formControlName="estimatedHours"
            min="0"
            max="168"
            step="0.5"
            required
          />
        </div>

        <div *ngIf="isEdit" class="form-group">
          <label for="status">Status</label>
          <select
            id="status"
            formControlName="status"
          >
            <option *ngFor="let st of statuses" [value]="st">{{ st }}</option>
          </select>
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
    .backlog-form-container {
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

    input, textarea, select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      font-family: inherit;
    }

    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: #1976d2;
      box-shadow: 0 0 5px rgba(25, 118, 210, 0.3);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
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
export class BacklogFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  submitting = false;
  error: string | null = null;
  private backlogId: string | null = null;

  categories = Object.values(BacklogCategory);
  statuses = Object.values(BacklogStatus);

  constructor(
    private fb: FormBuilder,
    private backlogService: BacklogService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.backlogId = params['id'];
        this.loadBacklogItem();
      }
    });
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: ['', Validators.required],
      priority: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      estimatedHours: [1, [Validators.required, Validators.min(0), Validators.max(168)]],
      status: [BacklogStatus.Pending]
    });
  }

  private loadBacklogItem(): void {
    if (!this.backlogId) return;

    this.backlogService.getBacklogItemById(this.backlogId).subscribe({
      next: (item) => {
        this.form.patchValue({
          title: item.title,
          description: item.description,
          category: item.category,
          priority: item.priority,
          estimatedHours: item.estimatedHours,
          status: item.status
        });
      },
      error: (err) => {
        this.error = 'Failed to load backlog item';
      }
    });
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    this.submitting = true;
    this.error = null;

    const request: CreateBacklogItemRequest = this.form.value;

    if (this.isEdit && this.backlogId) {
      this.backlogService.updateBacklogItem(this.backlogId, request).subscribe({
        next: () => {
          this.router.navigate(['/backlog', this.backlogId]);
        },
        error: (err) => {
          this.error = err.message || 'Failed to update backlog item';
          this.submitting = false;
        }
      });
    } else {
      this.backlogService.createBacklogItem(request).subscribe({
        next: (item) => {
          this.router.navigate(['/backlog', item.id]);
        },
        error: (err) => {
          this.error = err.message || 'Failed to create backlog item';
          this.submitting = false;
        }
      });
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
