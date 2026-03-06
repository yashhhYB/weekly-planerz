import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { TeamMember, UserRole } from '../../../../models';
import { AppStoreState } from '../../../../store';
import * as TeamActions from '../../../../store/team/team.actions';
import * as TeamSelectors from '../../../../store/team/team.selectors';
import { UserContextService } from '../../../../core/services/user-context.service';

@Component({
  selector: 'app-team-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="setup-page">
      <div class="setup-card">
        <div class="card-header">
          <div class="icon-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h1 class="app-title">Weekly Planner</h1>
          <p class="app-subtitle">Set up your team to get started</p>
        </div>

        <div class="input-row">
          <input
            type="text"
            [(ngModel)]="newName"
            placeholder="Member name"
            (keyup.enter)="addMember()"
            class="name-input"
          />
          <button class="btn-plus" (click)="addMember()" [disabled]="!newName.trim()">+</button>
        </div>

        <div class="members-list" *ngIf="(members$ | async) as members">
          <div class="empty-state" *ngIf="members.length === 0">
            Add at least one member to continue
          </div>

          <div class="member-row" *ngFor="let member of members">
            <div class="member-left">
              <span class="member-name">{{ member.name }}</span>
              <span class="lead-badge" *ngIf="member.role === 2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Lead
              </span>
              <span class="member-badge" *ngIf="member.role !== 2">Member</span>
            </div>
            <div class="member-actions">
              <button
                *ngIf="member.role !== 2 && members.length >= 2"
                class="btn-icon crown"
                (click)="makeLead(member)"
                title="Make Lead">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </button>
              <button
                class="btn-icon trash"
                (click)="removeMember(member)"
                [disabled]="member.role === 2"
                [class.disabled]="member.role === 2"
                title="Remove">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </button>
            </div>
          </div>
        </div>

        <button
          class="btn-continue"
          (click)="goHome()"
          [disabled]="(memberCount$ | async) === 0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          Continue to Home
        </button>
      </div>
    </div>
  `,
  styles: [`
    .setup-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-base, #0b0e14);
      padding: 20px;
    }
    .setup-card {
      width: 100%;
      max-width: 480px;
      background: var(--bg-card, #131820);
      border: 1px solid rgba(0,200,255,0.12);
      border-radius: 16px;
      padding: 36px 32px 28px;
      box-shadow: 0 0 40px rgba(0,180,255,0.06);
    }

    .card-header { text-align: center; margin-bottom: 28px; }
    .icon-circle {
      width: 52px; height: 52px; border-radius: 14px;
      background: rgba(0,190,255,0.1); border: 1px solid rgba(0,190,255,0.25);
      display: flex; align-items: center; justify-content: center;
      color: #00d4ff; margin: 0 auto 16px;
    }
    .app-title { color: #00d4ff; font-size: 26px; font-weight: 700; margin: 0 0 6px; letter-spacing: -0.5px; }
    .app-subtitle { color: var(--text-muted, #7a8599); font-size: 14px; margin: 0; }

    .input-row { display: flex; gap: 10px; margin-bottom: 16px; }
    .name-input {
      flex: 1; background: var(--bg-input, #1a2030); border: 1px solid var(--border-subtle, #2a3444);
      border-radius: 10px; padding: 13px 16px; color: var(--text-primary, #e1e4e8); font-size: 15px;
      transition: border-color 0.2s;
    }
    .name-input::placeholder { color: var(--text-muted, #4a5568); }
    .name-input:focus { outline: none; border-color: #00d4ff; box-shadow: 0 0 0 3px rgba(0,212,255,0.1); }
    .btn-plus {
      width: 46px; height: 46px; border-radius: 10px; background: #00bfff; border: none;
      color: #fff; font-size: 24px; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      transition: background 0.2s;
    }
    .btn-plus:hover:not(:disabled) { background: #00d4ff; }
    .btn-plus:disabled { opacity: 0.4; cursor: not-allowed; }

    .members-list {
      background: var(--bg-input, #1a2030); border: 1px solid var(--border-subtle, #2a3444);
      border-radius: 10px; margin-bottom: 16px; min-height: 48px;
    }
    .empty-state { text-align: center; padding: 16px; color: var(--text-muted, #4a5568); font-size: 14px; }
    .member-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 13px 16px; border-bottom: 1px solid var(--border-subtle, #232d3d);
    }
    .member-row:last-child { border-bottom: none; }
    .member-left { display: flex; align-items: center; gap: 10px; }
    .member-name { color: var(--text-primary, #e1e4e8); font-weight: 500; font-size: 15px; }
    .lead-badge {
      background: rgba(0,190,255,0.12); color: #00d4ff; font-size: 12px; font-weight: 600;
      padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(0,190,255,0.25);
      display: flex; align-items: center; gap: 4px;
    }
    .member-badge { color: var(--text-muted, #4a5568); font-size: 12px; }

    .member-actions { display: flex; align-items: center; gap: 6px; }
    .btn-icon {
      background: none; border: none; font-size: 16px; cursor: pointer;
      padding: 4px 6px; border-radius: 6px; opacity: 0.5; transition: all 0.2s;
      color: var(--text-secondary, #8b949e);
    }
    .btn-icon:hover:not(:disabled) { opacity: 1; }
    .btn-icon.crown:hover { opacity: 1; transform: scale(1.15); color: #d29922; }
    .btn-icon.trash:hover:not(:disabled) { color: var(--danger, #da3633); }
    .btn-icon.disabled { opacity: 0.15; cursor: not-allowed; }

    .btn-continue {
      width: 100%; padding: 15px; border: none; border-radius: 10px;
      background: #00bfff; color: #fff; font-size: 16px; font-weight: 600;
      cursor: pointer; transition: background 0.2s; letter-spacing: 0.3px;
    }
    .btn-continue:hover:not(:disabled) { background: #00d4ff; }
    .btn-continue:disabled { opacity: 0.4; cursor: not-allowed; }

    @media (max-width: 500px) { .setup-card { padding: 28px 20px 22px; } }
  `]
})
export class TeamSetupComponent implements OnInit {
  members$!: Observable<TeamMember[]>;
  memberCount$!: Observable<number>;
  newName = '';

  constructor(
    private store: Store<AppStoreState>,
    private router: Router,
    private userContext: UserContextService
  ) {}

  ngOnInit() {
    this.members$ = this.store.select(TeamSelectors.selectAllTeamMembers);
    this.memberCount$ = this.store.select(TeamSelectors.selectTeamMemberCount);
    this.store.dispatch(TeamActions.loadTeamMembers());
  }

  addMember() {
    const name = this.newName.trim();
    if (!name) return;
    this.store.dispatch(TeamActions.createTeamMember({ request: { name } }));
    this.newName = '';
  }

  removeMember(member: TeamMember) {
    if (member.role === UserRole.TeamLead) return;
    this.store.dispatch(TeamActions.deleteTeamMember({ id: member.id }));
  }

  makeLead(member: TeamMember) {
    this.store.dispatch(TeamActions.setTeamLead({ id: member.id }));
  }

  goHome() {
    this.store.select(TeamSelectors.selectAllTeamMembers).pipe(first()).subscribe(members => {
      const lead = members.find(m => m.role === UserRole.TeamLead);
      if (lead) {
        this.userContext.setCurrentUser(lead);
      } else if (members.length > 0) {
        this.userContext.setCurrentUser(members[0]);
      }
      this.router.navigate(['/home']);
    });
  }
}
