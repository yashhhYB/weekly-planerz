import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TeamMember, UserRole } from '../../models';

const STORAGE_KEY = 'wp_current_user';

@Injectable({ providedIn: 'root' })
export class UserContextService {
  private currentUserSubject = new BehaviorSubject<TeamMember | null>(this.loadFromStorage());

  currentUser$: Observable<TeamMember | null> = this.currentUserSubject.asObservable();
  isLead$: Observable<boolean> = this.currentUser$.pipe(map(u => u?.role === UserRole.TeamLead));
  isMember$: Observable<boolean> = this.currentUser$.pipe(map(u => u?.role === UserRole.TeamMember));

  get currentUser(): TeamMember | null {
    return this.currentUserSubject.value;
  }

  get isLead(): boolean {
    return this.currentUser?.role === UserRole.TeamLead;
  }

  setCurrentUser(user: TeamMember): void {
    this.currentUserSubject.next(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  /** Refresh the stored user from a fresh members list (e.g. after role change) */
  refreshFromMembers(members: TeamMember[]): void {
    const current = this.currentUser;
    if (!current) return;
    const updated = members.find(m => m.id === current.id);
    if (updated) {
      this.setCurrentUser(updated);
    }
  }

  private loadFromStorage(): TeamMember | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
