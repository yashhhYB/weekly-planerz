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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" *ngIf="currentUser.role === 2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" *ngIf="currentUser.role !== 2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {{ currentUser.role === 2 ? 'Team Lead' : 'Team Member' }}
            </span>
          </div>
        </div>
      </div>

      <!-- ===== LEAD VIEW ===== -->
      <ng-container *ngIf="isLead">
        <!-- Active Week Info Card (Lead) — shown at TOP -->
        <div class="active-week-section" *ngIf="activeWeek">
          <h2>Current Active Week</h2>
          <div class="active-week-card">
            <div class="week-info">
              <div class="week-dates">
                <span class="date-label">Work Period</span>
                <span class="date-range">{{ formatDate(activeWeek.startDate) }} &rarr; {{ formatDate(activeWeek.endDate) }}</span>
              </div>
              <div class="week-status">
                <span class="status-badge" [class]="getStatusClass(activeWeek.status)">
                  {{ getStatusLabel(activeWeek.status) }}
                </span>
                <span class="frozen-badge" *ngIf="activeWeek.isFrozen"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> Frozen</span>
              </div>
              <div class="week-split">
                <span class="split-chip client">Client {{ activeWeek.clientPercent }}%</span>
                <span class="split-chip tech">Tech {{ activeWeek.techDebtPercent }}%</span>
                <span class="split-chip rnd">R&amp;D {{ activeWeek.rndPercent }}%</span>
              </div>
            </div>
            <div class="week-actions">
              <button class="btn-outline" (click)="navigateTo('/planning/' + activeWeek.id)">View Details</button>
              <button class="btn-primary" (click)="navigateTo('/planning/' + activeWeek.id + '/review')">Review &amp; Freeze</button>
            </div>
          </div>
        </div>

        <div class="section-header">
          <h2 class="section-title">Quick Actions</h2>
          <p class="section-sub" *ngIf="!activeWeek">Start a new week to begin planning</p>
          <p class="section-sub" *ngIf="activeWeek">Week is active — manage your team's plan</p>
        </div>

        <!-- Lead WITHOUT active week: 4 cards -->
        <div class="actions-grid" *ngIf="!activeWeek">
          <button class="action-card start-card" (click)="navigateTo('/planning/create')">
            <div class="action-icon-wrap rocket"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg></div>
            <div class="action-text">
              <strong>Start a New Week</strong>
              <p>Set up a new planning cycle for your team.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/backlog')">
            <div class="action-icon-wrap green"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
            <div class="action-text">
              <strong>Manage Backlog</strong>
              <p>Add, edit, or browse work items.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/team')">
            <div class="action-icon-wrap purple"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></div>
            <div class="action-text">
              <strong>Manage Team Members</strong>
              <p>Add or remove team members.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/weeks')">
            <div class="action-icon-wrap gray"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
            <div class="action-text">
              <strong>View Past Weeks</strong>
              <p>Look at completed planning cycles.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>
        </div>

        <!-- Lead WITH active week (pre-freeze): 6 cards -->
        <div class="actions-grid" *ngIf="activeWeek && !activeWeek.isFrozen">
          <button class="action-card ice" (click)="goToFreeze()">
            <div class="action-icon-wrap frost"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></div>
            <div class="action-text">
              <strong>Review & Freeze</strong>
              <p>Check everyone's hours and lock the plan.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="goToPlanMyWork()">
            <div class="action-icon-wrap blue"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
            <div class="action-text">
              <strong>Plan My Work</strong>
              <p>Pick backlog items and commit hours.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/backlog')">
            <div class="action-icon-wrap green"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
            <div class="action-text">
              <strong>Manage Backlog</strong>
              <p>Add, edit, or browse work items.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/team')">
            <div class="action-icon-wrap purple"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></div>
            <div class="action-text">
              <strong>Manage Team Members</strong>
              <p>Add or remove team members.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/weeks')">
            <div class="action-icon-wrap gray"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
            <div class="action-text">
              <strong>View Past Weeks</strong>
              <p>Look at completed planning cycles.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card danger-card" (click)="cancelWeekPlanning()">
            <div class="action-icon-wrap red"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></div>
            <div class="action-text">
              <strong>Cancel This Week's Planning</strong>
              <p>Erase all plans and start over.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>
        </div>

        <!-- Lead WITH active week (post-freeze): 6 cards -->
        <div class="actions-grid" *ngIf="activeWeek && activeWeek.isFrozen">
          <button class="action-card primary" (click)="navigateTo('/planning/' + activeWeek.id + '/dashboard')">
            <div class="action-icon-wrap blue"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
            <div class="action-text">
              <strong>See Team Progress</strong>
              <p>View the team's overall progress and stats.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="goToUpdateProgress()">
            <div class="action-icon-wrap green"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
            <div class="action-text">
              <strong>Update My Progress</strong>
              <p>Log actual hours and track task completion.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card start-card" (click)="completeWeek()">
            <div class="action-icon-wrap rocket"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
            <div class="action-text">
              <strong>Finish This Week</strong>
              <p>Mark the week as completed for all members.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/backlog')">
            <div class="action-icon-wrap green"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
            <div class="action-text">
              <strong>Manage Backlog</strong>
              <p>Add, edit, or browse work items.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/team')">
            <div class="action-icon-wrap purple"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></div>
            <div class="action-text">
              <strong>Manage Team Members</strong>
              <p>Add or remove team members.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/weeks')">
            <div class="action-icon-wrap gray"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
            <div class="action-text">
              <strong>View Past Weeks</strong>
              <p>Look at completed planning cycles.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>
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
            <div class="action-icon-wrap green"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
            <div class="action-text">
              <strong>Manage Backlog</strong>
              <p>Add, edit, or browse work items.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/weeks')">
            <div class="action-icon-wrap gray"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
            <div class="action-text">
              <strong>View Past Weeks</strong>
              <p>Look at completed planning cycles.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>
        </div>

        <!-- Member WITH active week (pre-freeze): 3 cards -->
        <div class="actions-grid member-grid" *ngIf="activeWeek && !activeWeek.isFrozen">
          <button class="action-card primary" (click)="goToPlanMyWork()">
            <div class="action-icon-wrap blue"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
            <div class="action-text">
              <strong>Plan My Work</strong>
              <p>Pick backlog items and commit your 30 hours.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/backlog')">
            <div class="action-icon-wrap green"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
            <div class="action-text">
              <strong>Manage Backlog</strong>
              <p>Add, edit, or browse work items.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/weeks')">
            <div class="action-icon-wrap gray"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
            <div class="action-text">
              <strong>View Past Weeks</strong>
              <p>Look at completed planning cycles.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>
        </div>

        <!-- Member WITH active week (post-freeze): 4 cards -->
        <div class="actions-grid member-grid" *ngIf="activeWeek && activeWeek.isFrozen">
          <button class="action-card primary" (click)="goToUpdateProgress()">
            <div class="action-icon-wrap blue"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
            <div class="action-text">
              <strong>Update My Progress</strong>
              <p>Log actual hours and track task completion.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/planning/' + activeWeek.id + '/dashboard')">
            <div class="action-icon-wrap blue"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
            <div class="action-text">
              <strong>See Team Progress</strong>
              <p>View the team's overall progress and stats.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/backlog')">
            <div class="action-icon-wrap green"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
            <div class="action-text">
              <strong>Manage Backlog</strong>
              <p>Add, edit, or browse work items.</p>
            </div>
            <span class="action-arrow">→</span>
          </button>

          <button class="action-card" (click)="navigateTo('/weeks')">
            <div class="action-icon-wrap gray"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
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
    .role-tag.lead { background: rgba(31,111,235,0.15); color: var(--accent); }

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
    .action-card.start-card:hover { border-color: var(--accent); box-shadow: 0 8px 24px rgba(31,111,235,0.2); }
    .action-card.primary { border-left: 3px solid var(--accent); }
    .action-card.ice { border-left: 3px solid #7dd3fc; }
    .action-card.danger-card { border-left: 3px solid var(--danger); }
    .action-card.danger-card:hover { border-color: var(--danger); box-shadow: 0 8px 24px rgba(248,81,73,0.15); }

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
    .status-badge.inprogress { background: rgba(31,111,235,0.15); color: var(--accent); }
    .status-badge.completed { background: rgba(35,134,54,0.15); color: var(--success); }
    .status-badge.archived { background: rgba(72,79,88,0.15); color: var(--text-secondary); }
    .frozen-badge { font-size: 12px; color: #f0c060; padding: 4px 10px; background: rgba(240,192,96,0.1); border-radius: 20px; }
    .week-split { display: flex; gap: 6px; }
    .split-chip { font-size: 11px; padding: 3px 8px; border-radius: 6px; font-weight: 500; }
    .split-chip.client { background: rgba(31,111,235,0.1); color: var(--accent); }
    .split-chip.tech { background: rgba(218,54,51,0.1); color: var(--danger); }
    .split-chip.rnd { background: rgba(35,134,54,0.1); color: var(--success); }
    .week-actions { display: flex; flex-direction: column; gap: 8px; }
    .btn-outline {
      background: none; border: 1px solid var(--border, #30363d); color: var(--text-primary, #e1e4e8);
      padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500;
      transition: all 0.2s;
    }
    .btn-outline:hover { border-color: var(--border-hover); color: var(--text-heading); }
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
    .plan-dates { color: var(--accent); font-size: 14px; font-weight: 600; margin-bottom: 16px; }
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

      if (this.activeWeek && this.currentUser) {
        this.loadMemberPlan(this.activeWeek.id, this.currentUser.id);
      } else {
        this.memberWeekMember = null;
      }
    });
  }

  private loadMemberPlan(weekId: string, memberId: string): void {
    this.weekMemberService.getWeekMembers(weekId).subscribe({
      next: (members) => {
        this.memberWeekMember = members.find(m => m.memberId === memberId) || null;
      },
      error: () => {
        this.memberWeekMember = null;
      }
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  goToFreeze(): void {
    if (this.activeWeek) {
      this.router.navigate(['/planning', this.activeWeek.id, 'review']);
    } else {
      this.toast.info('No active week to review. Start a new week first.');
    }
  }

  goToPlanMyWork(): void {
    if (this.activeWeek && this.currentUser) {
      if (this.isLead && this.activeWeek) {
        // Lead's member board
        this.weekMemberService.getWeekMembers(this.activeWeek.id).subscribe({
          next: (members) => {
            const myWm = members.find(m => m.memberId === this.currentUser!.id);
            if (myWm) {
              this.router.navigate(['/planning', this.activeWeek!.id, 'board', myWm.id]);
            } else {
              this.toast.info('You are not assigned to this week. Add yourself in the planning form.');
              this.router.navigate(['/planning', this.activeWeek!.id]);
            }
          },
          error: () => this.toast.error('Failed to load week members.')
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

  goToUpdateProgress(): void {
    if (!this.activeWeek || !this.currentUser) {
      this.toast.info('No active week available.');
      return;
    }
    if (this.memberWeekMember) {
      this.router.navigate(['/planning', this.activeWeek.id, 'progress', this.memberWeekMember.id]);
    } else {
      // lookup member
      this.weekMemberService.getWeekMembers(this.activeWeek.id).subscribe({
        next: (members) => {
          const myWm = members.find(m => m.memberId === this.currentUser!.id);
          if (myWm) {
            this.router.navigate(['/planning', this.activeWeek!.id, 'progress', myWm.id]);
          } else {
            this.toast.info('You are not assigned to this week.');
          }
        },
        error: () => this.toast.error('Failed to load week members.')
      });
    }
  }

  completeWeek(): void {
    if (!this.activeWeek) {
      this.toast.info('No active week to complete.');
      return;
    }
    if (confirm('Mark this week as completed? This will finalize all member plans.')) {
      this.planningService.completePlanningWeek(this.activeWeek.id).subscribe({
        next: () => {
          this.toast.success('Week marked as completed!');
          this.store.dispatch(PlanningActions.loadPlanningWeeks({ skip: 0, take: 50 }));
          this.activeWeek = null;
        },
        error: (err) => this.toast.error(err?.message || 'Failed to complete the week.')
      });
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
        error: (err) => this.toast.error(err?.message || 'Failed to cancel week planning.')
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
