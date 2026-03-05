import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TeamMember } from '../../../../models';
import { AppStoreState } from '../../../../store';
import * as TeamActions from '../../../../store/team/team.actions';
import * as TeamSelectors from '../../../../store/team/team.selectors';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>👥 Manage Team Members</h1>
          <p class="subtitle">Add, edit, or remove team members</p>
        </div>
        <a routerLink="/home" class="btn-back">← Back to Home</a>
      </div>

      <div class="add-section">
        <div class="input-row">
          <input
            type="text"
            [(ngModel)]="newName"
            placeholder="Type a name"
            (keyup.enter)="addMember()"
            class="name-input"
          />
          <button class="btn-save" (click)="addMember()" [disabled]="!newName.trim()">
            Save This Person
          </button>
        </div>
      </div>

      <div class="members-grid" *ngIf="(members$ | async) as members">
        <div class="member-card" *ngFor="let member of members">
          <div class="card-top">
            <div class="avatar" [class.lead]="member.role === 2">
              {{ member.name.charAt(0).toUpperCase() }}
            </div>
            <div class="info">
              <span class="name" *ngIf="editingId !== member.id">{{ member.name }}</span>
              <input *ngIf="editingId === member.id" [(ngModel)]="editName" (keyup.enter)="saveEdit(member.id)" class="edit-input" />
              <span class="role" [class.lead]="member.role === 2">
                {{ member.role === 2 ? '⭐ Lead' : 'Member' }}
              </span>
            </div>
          </div>
          <div class="card-actions">
            <button *ngIf="editingId !== member.id" class="btn-sm" (click)="startEdit(member)">Edit Name</button>
            <button *ngIf="editingId === member.id" class="btn-sm green" (click)="saveEdit(member.id)">Save</button>
            <button *ngIf="editingId === member.id" class="btn-sm" (click)="cancelEdit()">Cancel</button>
            <button *ngIf="member.role !== 2" class="btn-sm blue" (click)="makeLead(member.id)">Make Lead</button>
            <button *ngIf="member.role !== 2" class="btn-sm red" (click)="removeMember(member.id)">Remove</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 900px; margin: 0 auto; padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h1 { color: #f0f6fc; margin: 0 0 4px; font-size: 24px; }
    .subtitle { color: #8b949e; margin: 0; font-size: 14px; }
    .btn-back { color: #58a6ff; text-decoration: none; font-size: 14px; padding: 8px 16px; border: 1px solid #30363d; border-radius: 8px; }
    .btn-back:hover { background: #161b22; }
    .add-section { margin-bottom: 24px; }
    .input-row { display: flex; gap: 12px; }
    .name-input { flex: 1; background: #0d1117; border: 1px solid #30363d; border-radius: 8px; padding: 12px 16px; color: #e1e4e8; font-size: 15px; }
    .name-input:focus { outline: none; border-color: #58a6ff; }
    .btn-save { background: #238636; border: none; color: #fff; padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-save:hover:not(:disabled) { background: #2ea043; }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
    .members-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
    .member-card { background: #161b22; border: 1px solid #30363d; border-radius: 10px; padding: 16px; }
    .card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .avatar { width: 44px; height: 44px; border-radius: 50%; background: #30363d; display: flex; align-items: center; justify-content: center; color: #e1e4e8; font-weight: 700; font-size: 18px; }
    .avatar.lead { background: #1f6feb; }
    .info { display: flex; flex-direction: column; gap: 2px; }
    .name { color: #f0f6fc; font-weight: 600; font-size: 16px; }
    .edit-input { background: #0d1117; border: 1px solid #58a6ff; border-radius: 6px; padding: 4px 8px; color: #e1e4e8; font-size: 14px; }
    .role { font-size: 12px; color: #8b949e; }
    .role.lead { color: #f0c060; }
    .card-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .btn-sm { background: #21262d; border: 1px solid #30363d; color: #e1e4e8; padding: 6px 12px; border-radius: 6px; font-size: 13px; cursor: pointer; }
    .btn-sm:hover { background: #30363d; }
    .btn-sm.green { border-color: #238636; color: #3fb950; }
    .btn-sm.blue { border-color: #1f6feb; color: #58a6ff; }
    .btn-sm.red { border-color: #da3633; color: #f85149; }
    .btn-sm.red:hover { background: rgba(218,54,51,0.2); }
  `]
})
export class TeamListComponent implements OnInit {
  members$!: Observable<TeamMember[]>;
  newName = '';
  editingId: string | null = null;
  editName = '';

  constructor(private store: Store<AppStoreState>) {}

  ngOnInit() {
    this.members$ = this.store.select(TeamSelectors.selectAllTeamMembers);
    this.store.dispatch(TeamActions.loadTeamMembers());
  }

  addMember() {
    const name = this.newName.trim();
    if (!name) return;
    this.store.dispatch(TeamActions.createTeamMember({ request: { name } }));
    this.newName = '';
  }

  startEdit(member: TeamMember) {
    this.editingId = member.id;
    this.editName = member.name;
  }

  saveEdit(id: string) {
    const name = this.editName.trim();
    if (!name) return;
    this.store.dispatch(TeamActions.updateTeamMember({ id, request: { name } }));
    this.editingId = null;
  }

  cancelEdit() { this.editingId = null; }

  makeLead(id: string) {
    this.store.dispatch(TeamActions.setTeamLead({ id }));
  }

  removeMember(id: string) {
    if (confirm('Remove this team member?')) {
      this.store.dispatch(TeamActions.deleteTeamMember({ id }));
    }
  }
}
