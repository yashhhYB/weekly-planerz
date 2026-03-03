import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppStoreState } from '../store';
import * as PlanningSelectors from '../store/planning/planning.selectors';
import * as BacklogSelectors from '../store/backlog/backlog.selectors';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="welcome-section">
        <h1>Welcome to Weekly Planner</h1>
        <p class="tagline">Your production-grade planning system for weekly goal management</p>
      </div>

      <div class="dashboard-grid">
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <h3>Planning Weeks</h3>
            <p class="stat-value">{{ planningWeekCount$ | async }}</p>
            <p class="stat-label">Active cycles</p>
            <button (click)="navigateTo('/planning')" class="btn-card">View All →</button>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✓</div>
          <div class="stat-content">
            <h3>Backlog Items</h3>
            <p class="stat-value">{{ backlogItemCount$ | async }}</p>
            <p class="stat-label">Tasks to manage</p>
            <button (click)="navigateTo('/backlog')" class="btn-card">View All →</button>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <h3>Active Items</h3>
            <p class="stat-value">{{ activeBacklogCount$ | async }}</p>
            <p class="stat-label">In progress</p>
            <button (click)="navigateTo('/backlog')" class="btn-card">View All →</button>
          </div>
        </div>
      </div>

      <div class="features-section">
        <h2>Key Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <h3>📅 Weekly Planning</h3>
            <p>Create and manage weekly planning cycles with measurable goals and key activities.</p>
            <ul>
              <li>Set health scores 1-10</li>
              <li>Track productivity %</li>
              <li>Add reflections</li>
              <li>Freeze weeks when complete</li>
            </ul>
          </div>

          <div class="feature-card">
            <h3>📝 Backlog Management</h3>
            <p>Organize tasks across multiple categories with priority and time estimation.</p>
            <ul>
              <li>6 task categories</li>
              <li>Priority ranking (1-5)</li>
              <li>Hour estimation</li>
              <li>Status tracking</li>
            </ul>
          </div>

          <div class="feature-card">
            <h3>🔒 Business Rules</h3>
            <p>Enforced business logic ensures data integrity and planning consistency.</p>
            <ul>
              <li>Planning on Tuesday only</li>
              <li>Immutable frozen weeks</li>
              <li>Category allocation</li>
              <li>Time management</li>
            </ul>
          </div>

          <div class="feature-card">
            <h3>⚙️ API-Driven</h3>
            <p>Built on a robust .NET 8 backend with validated data models.</p>
            <ul>
              <li>13 REST endpoints</li>
              <li>CQRS architecture</li>
              <li>Input validation</li>
              <li>Error handling</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="action-buttons">
          <button (click)="navigateTo('/planning/create')" class="btn btn-primary">
            + Create Planning Week
          </button>
          <button (click)="navigateTo('/backlog/create')" class="btn btn-secondary">
            + Add Backlog Item
          </button>
          <button (click)="navigateTo('/planning')" class="btn btn-tertiary">
            View All Weeks
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 40px 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 40px;
    }

    .welcome-section h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
      color: #333;
    }

    .tagline {
      margin: 0;
      font-size: 16px;
      color: #666;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s, box-shadow 0.3s;
      display: flex;
      align-items: center;
      padding: 20px;
      gap: 20px;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .stat-icon {
      font-size: 40px;
      min-width: 50px;
    }

    .stat-content {
      flex: 1;
    }

    .stat-content h3 {
      margin: 0 0 5px 0;
      color: #333;
      font-size: 16px;
    }

    .stat-value {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
      color: #1976d2;
    }

    .stat-label {
      margin: 5px 0 10px 0;
      font-size: 12px;
      color: #999;
    }

    .btn-card {
      background: #f0f0f0;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 5px 10px;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-card:hover {
      background: #e0e0e0;
    }

    .features-section {
      margin-bottom: 40px;
    }

    .features-section h2 {
      margin: 0 0 20px 0;
      font-size: 24px;
      color: #333;
      border-bottom: 2px solid #1976d2;
      padding-bottom: 10px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .feature-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s;
    }

    .feature-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .feature-card h3 {
      margin: 0 0 10px 0;
      color: #1976d2;
      font-size: 16px;
    }

    .feature-card p {
      margin: 0 0 15px 0;
      font-size: 14px;
      color: #666;
      line-height: 1.5;
    }

    .feature-card ul {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;
      color: #666;
      line-height: 1.8;
    }

    .quick-actions {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
      padding: 30px;
      text-align: center;
    }

    .quick-actions h2 {
      margin: 0 0 20px 0;
      color: white;
      border: none;
      padding: 0;
      font-size: 24px;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s;
    }

    .btn-primary {
      background: white;
      color: #667eea;
    }

    .btn-primary:hover {
      background: #f0f0f0;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid white;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .btn-tertiary {
      background: transparent;
      color: white;
      border: 2px solid white;
    }

    .btn-tertiary:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    @media (max-width: 600px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  planningWeekCount$: Observable<number>;
  backlogItemCount$: Observable<number>;
  activeBacklogCount$: Observable<number>;

  constructor(
    private store: Store<AppStoreState>,
    private router: Router
  ) {
    this.planningWeekCount$ = this.store.select(PlanningSelectors.selectAllPlanningWeeks).pipe(
      map(weeks => weeks.length)
    );
    this.backlogItemCount$ = this.store.select(BacklogSelectors.selectAllBacklogItems).pipe(
      map(items => items.length)
    );
    this.activeBacklogCount$ = this.store.select(BacklogSelectors.selectAllBacklogItems).pipe(
      map(items => items.filter(i => i.status === 'InProgress').length)
    );
  }

  ngOnInit(): void {
    // Statistics are automatically updated via store selectors
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}

