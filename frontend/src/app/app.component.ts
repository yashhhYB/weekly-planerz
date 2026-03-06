import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, combineLatest, takeUntil, filter, first } from 'rxjs';
import { ToastComponent } from './shared/toast/toast.component';
import { UserContextService } from './core/services/user-context.service';
import { DataManagementService } from './core/services/data-management.service';
import { ToastService } from './core/services/toast.service';
import { ThemeService, Theme } from './core/services/theme.service';
import { TeamMember, UserRole } from './models';
import { AppStoreState } from './store';
import * as TeamActions from './store/team/team.actions';
import * as TeamSelectors from './store/team/team.selectors';

/**
 * Root application component.
 *
 * Hosts the navbar (with user-switcher, theme toggle, and data-management
 * controls), the router outlet, and the footer. Manages the currently
 * selected user via {@link UserContextService} and exposes role-based
 * navigation guards for the template.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastComponent],
  template: `
    <app-toast></app-toast>
    <nav class="navbar" *ngIf="!hideNav">
      <div class="nav-container">
        <a routerLink="/home" class="nav-brand">
          <div class="brand-logo">&lt;weekly/<span class="brand-accent">plannerz</span>&gt;</div>
        </a>

        <ul class="nav-links">
          <li><a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <span class="nav-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></span> Home
          </a></li>
          <li><a routerLink="/backlog" routerLinkActive="active">
            <span class="nav-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></span> Backlog
          </a></li>
          <li><a routerLink="/weeks" routerLinkActive="active">
            <span class="nav-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></span> Past Weeks
          </a></li>
        </ul>

        <!-- Theme Toggle -->
        <button class="theme-toggle" (click)="toggleTheme()" [title]="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <svg *ngIf="isDark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          <svg *ngIf="!isDark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        </button>

        <!-- User Switcher -->
        <div class="user-area" *ngIf="currentUser">
          <div class="current-user" (click)="showSwitcher = !showSwitcher">
            <div class="user-avatar" [class.lead]="currentUser.role === 2">
              {{ currentUser.name.charAt(0).toUpperCase() }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ currentUser.name }}</span>
              <span class="user-role">{{ currentUser.role === 2 ? 'Team Lead' : 'Team Member' }}</span>
            </div>
            <span class="switch-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 15 12 20 17 15"></polyline><polyline points="7 9 12 4 17 9"></polyline></svg></span>
          </div>

          <div class="switcher-dropdown" *ngIf="showSwitcher">
            <div class="switcher-header">Switch Role</div>
            <button
              *ngFor="let member of allMembers"
              class="switcher-item"
              [class.active]="member.id === currentUser.id"
              (click)="switchUser(member)">
              <div class="sw-avatar" [class.lead]="member.role === 2">
                {{ member.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <span class="sw-name">{{ member.name }}</span>
                <span class="sw-role">{{ member.role === 2 ? 'Lead' : 'Member' }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="main-content" [class.full-page]="hideNav" [class.has-footer]="!hideNav">
      <router-outlet></router-outlet>
    </main>

    <!-- Sticky Footer -->
    <footer class="app-footer" *ngIf="!hideNav">
      <div class="footer-container">
        <div class="footer-brand">
          <span class="footer-title">&lt;weekly/<span class="footer-accent">plannerz</span>&gt;</span>
        </div>
        <div class="footer-actions">
          <button class="footer-btn download" (click)="downloadData()" [disabled]="footerBusy" title="Download backup">
            <span class="fb-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></span> <span class="fb-label">Download</span>
          </button>
          <button class="footer-btn load" (click)="fileInput.click()" [disabled]="footerBusy" title="Load from file">
            <span class="fb-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg></span> <span class="fb-label">Load</span>
          </button>
          <button class="footer-btn seed" (click)="seedSampleData()" [disabled]="footerBusy" title="Seed sample data">
            <span class="fb-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="14"></line><line x1="9" y1="11" x2="15" y2="11"></line></svg></span> <span class="fb-label">Seed</span>
          </button>
          <span class="footer-divider"></span>
          <button class="footer-btn reset" (click)="confirmReset()" [disabled]="footerBusy" title="Reset all data">
            <span class="fb-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg></span> <span class="fb-label">Reset</span>
          </button>
        </div>
      </div>
      <input #fileInput type="file" accept=".json" (change)="onFileSelected($event)" style="display:none" />
    </footer>

    <!-- Confirm Modal -->
    <div class="modal-backdrop" *ngIf="showConfirm" (click)="showConfirm = false">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-icon" [innerHTML]="confirmIcon"></div>
        <h3 class="modal-title">{{ confirmTitle }}</h3>
        <p class="modal-msg">{{ confirmMessage }}</p>
        <div class="modal-actions">
          <button class="mbtn cancel" (click)="showConfirm = false">Cancel</button>
          <button class="mbtn confirm" [class.danger]="confirmDanger" (click)="onConfirm()">{{ confirmAction }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; background: var(--bg-base, #0f1117); }
    .navbar {
      background: var(--navbar-bg, #1e2228); border-bottom: 1px solid var(--border, #30363d);
      position: sticky; top: 0; z-index: 1000;
    }
    .nav-container { max-width: 1280px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 24px; height: 56px; }
    .nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; color: inherit; }
    .brand-logo { font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace; font-size: 18px; font-weight: 700; color: var(--text-secondary, #8b949e); letter-spacing: -0.5px; white-space: nowrap; }
    .brand-accent { color: var(--accent, #1f6feb); }
    .nav-links { list-style: none; margin: 0; padding: 0; display: flex; gap: 2px; flex: 1; }
    .nav-links a {
      color: var(--text-secondary, #8b949e); text-decoration: none; font-weight: 500; font-size: 13px;
      padding: 7px 14px; border-radius: 8px; transition: all 0.2s;
      display: flex; align-items: center; gap: 6px; white-space: nowrap;
    }
    .nav-icon { display: flex; align-items: center; }
    .nav-links a:hover { color: var(--text-heading, #f0f6fc); background: var(--bg-tertiary, #21262d); }
    .nav-links a.active { color: #fff; background: var(--accent, #1f6feb); box-shadow: 0 2px 8px rgba(31,111,235,0.3); }

    /* Theme Toggle */
    .theme-toggle {
      width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--border, #30363d);
      background: var(--bg-tertiary, #21262d); cursor: pointer; font-size: 16px;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.25s; flex-shrink: 0;
    }
    .theme-toggle:hover { border-color: var(--border-hover, #58a6ff); background: var(--bg-card-hover, #1c2129); transform: scale(1.1); }

    /* User Switcher */
    .user-area { position: relative; }
    .current-user { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border, #30363d); background: var(--bg-input, #0d1117); transition: all 0.2s; }
    .current-user:hover { border-color: var(--border-hover, #58a6ff); background: var(--bg-card, #161b22); }
    .user-avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--bg-tertiary, #30363d); display: flex; align-items: center; justify-content: center; color: var(--text-primary, #e1e4e8); font-weight: 700; font-size: 13px; flex-shrink: 0; }
    .user-avatar.lead { background: var(--accent, #1f6feb); color: #fff; }
    .user-info { display: flex; flex-direction: column; }
    .user-name { color: var(--text-heading, #f0f6fc); font-size: 13px; font-weight: 600; white-space: nowrap; }
    .user-role { color: var(--text-secondary, #8b949e); font-size: 11px; }
    .switch-icon { color: var(--text-secondary, #8b949e); font-size: 14px; margin-left: 4px; }

    .switcher-dropdown { position: absolute; top: calc(100% + 6px); right: 0; background: var(--bg-card, #161b22); border: 1px solid var(--border, #30363d); border-radius: 10px; min-width: 220px; box-shadow: 0 8px 24px var(--shadow, rgba(0,0,0,0.4)); z-index: 1001; overflow: hidden; }
    .switcher-header { padding: 10px 14px; font-size: 12px; color: var(--text-secondary, #8b949e); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--bg-tertiary, #21262d); }
    .switcher-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 14px; border: none; background: none; cursor: pointer; text-align: left; color: var(--text-primary, #e1e4e8); transition: background 0.15s; }
    .switcher-item:hover { background: var(--bg-tertiary, #21262d); }
    .switcher-item.active { background: var(--bg-card-hover, #1c2129); border-left: 3px solid var(--accent, #1f6feb); }
    .sw-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--bg-tertiary, #30363d); display: flex; align-items: center; justify-content: center; color: var(--text-primary, #e1e4e8); font-weight: 700; font-size: 12px; flex-shrink: 0; }
    .sw-avatar.lead { background: var(--accent, #1f6feb); color: #fff; }
    .sw-name { display: block; font-size: 13px; font-weight: 500; color: var(--text-heading, #f0f6fc); }
    .sw-role { display: block; font-size: 11px; color: var(--text-secondary, #8b949e); }

    .main-content { flex: 1; max-width: 1280px; margin: 0 auto; width: 100%; padding: 0 24px; }
    .main-content.full-page { max-width: 100%; padding: 0; }
    .main-content.has-footer { padding-bottom: 70px; }

    /* Sticky Footer */
    .app-footer {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: var(--navbar-bg, #1e2228); border-top: 1px solid var(--border, #30363d);
      z-index: 999; padding: 10px 0;
    }
    .footer-container {
      max-width: 1280px; margin: 0 auto; padding: 0 24px;
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
    }
    .footer-brand { display: flex; align-items: center; gap: 8px; }
    .footer-title { font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace; font-size: 13px; font-weight: 600; color: var(--text-secondary, #8b949e); white-space: nowrap; }
    .footer-accent { color: var(--accent, #1f6feb); }
    .footer-actions { display: flex; gap: 8px; align-items: center; }
    .footer-divider { width: 1px; height: 24px; background: var(--border, #30363d); }
    .footer-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 14px; border-radius: 8px; border: 1px solid var(--border, #30363d);
      font-size: 13px; font-weight: 500; cursor: pointer;
      transition: all 0.25s; background: var(--bg-tertiary, #21262d); color: var(--text-secondary, #8b949e);
    }
    .footer-btn:hover:not(:disabled) { border-color: var(--border-hover, #58a6ff); color: var(--text-heading, #f0f6fc); background: var(--bg-card-hover, #272d36); transform: translateY(-1px); }
    .footer-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .fb-icon { display: flex; align-items: center; }
    .footer-btn.download { border-color: rgba(31,111,235,0.3); color: var(--accent); }
    .footer-btn.download:hover:not(:disabled) { background: var(--accent-subtle); border-color: var(--accent); }
    .footer-btn.load { border-color: rgba(139,92,246,0.3); color: #a78bfa; }
    .footer-btn.load:hover:not(:disabled) { background: rgba(139,92,246,0.1); border-color: #8b5cf6; }
    .footer-btn.seed { border-color: rgba(34,197,94,0.3); color: var(--success); }
    .footer-btn.seed:hover:not(:disabled) { background: rgba(34,197,94,0.1); border-color: var(--success); }
    .footer-btn.reset { border-color: rgba(239,68,68,0.3); color: var(--danger); }
    .footer-btn.reset:hover:not(:disabled) { background: rgba(239,68,68,0.1); border-color: var(--danger); }

    /* Confirm Modal */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6);
      display: flex; align-items: center; justify-content: center;
      z-index: 2000; backdrop-filter: blur(4px);
    }
    .modal-card {
      background: var(--bg-card, #161b22); border: 1px solid var(--border, #30363d); border-radius: 14px;
      padding: 28px 32px; max-width: 420px; width: 90%; text-align: center;
      box-shadow: 0 12px 40px var(--shadow, rgba(0,0,0,0.5));
    }
    .modal-icon { font-size: 36px; margin-bottom: 12px; }
    .modal-title { color: var(--text-heading, #f0f6fc); font-size: 18px; font-weight: 600; margin: 0 0 8px; }
    .modal-msg { color: var(--text-secondary, #8b949e); font-size: 14px; margin: 0 0 20px; line-height: 1.5; }
    .modal-actions { display: flex; gap: 10px; justify-content: center; }
    .mbtn {
      padding: 10px 24px; border-radius: 8px; font-size: 14px;
      font-weight: 600; cursor: pointer; border: none; transition: all 0.2s;
    }
    .mbtn.cancel { background: var(--bg-tertiary, #21262d); color: var(--text-primary, #c9d1d9); border: 1px solid var(--border, #30363d); }
    .mbtn.cancel:hover { background: var(--bg-card-hover, #30363d); color: var(--text-heading, #f0f6fc); }
    .mbtn.confirm { background: var(--accent, #1f6feb); color: #fff; }
    .mbtn.confirm:hover { background: var(--accent-hover, #388bfd); }
    .mbtn.confirm.danger { background: var(--danger, #da3633); }
    .mbtn.confirm.danger:hover { background: var(--danger-hover, #f85149); }

    @media (max-width: 768px) {
      .nav-container { padding: 8px 12px; gap: 12px; flex-wrap: wrap; }
      .nav-brand h1 { font-size: 15px; }
      .nav-links a { padding: 5px 8px; font-size: 12px; }
      .nav-icon { display: none; }
      .main-content { padding: 0 12px; }
      .user-info { display: none; }
      .footer-container { padding: 0 12px; flex-direction: column; gap: 8px; }
      .footer-brand { display: none; }
      .footer-actions { flex-wrap: wrap; justify-content: center; }
      .footer-btn { padding: 6px 10px; font-size: 12px; }
      .fb-label { display: none; }
      .footer-divider { display: none; }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  currentUser: TeamMember | null = null;
  allMembers: TeamMember[] = [];
  showSwitcher = false;
  hideNav = false;
  footerBusy = false;
  isDark = true;

  // Confirm modal
  showConfirm = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction = '';
  confirmIcon = '';
  confirmDanger = false;
  private pendingAction: (() => void) | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private userContext: UserContextService,
    private store: Store<AppStoreState>,
    private router: Router,
    private dataMgmt: DataManagementService,
    private toast: ToastService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.store.dispatch(TeamActions.loadTeamMembers());

    // Track theme
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(theme => {
      this.isDark = theme === 'dark';
    });

    // Track current user
    this.userContext.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user;
    });

    // Track all members for switcher
    this.store.select(TeamSelectors.selectAllTeamMembers).pipe(takeUntil(this.destroy$)).subscribe(members => {
      this.allMembers = members;
      if (members.length > 0) {
        this.userContext.refreshFromMembers(members);
        if (!this.currentUser) {
          const lead = members.find(m => m.role === UserRole.TeamLead);
          this.userContext.setCurrentUser(lead || members[0]);
        }
      }
    });

    // Hide nav + footer on setup page
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.hideNav = this.router.url === '/setup';
    });
    // Also check immediately on init
    this.hideNav = this.router.url === '/setup';

    // Redirect to /setup if no team members after initial load
    combineLatest([
      this.store.select(TeamSelectors.selectAllTeamMembers),
      this.store.select(TeamSelectors.selectTeamLoaded)
    ]).pipe(
      filter(([_, loaded]) => loaded),
      first(),
      takeUntil(this.destroy$)
    ).subscribe(([members]) => {
      if (members.length === 0 && this.router.url !== '/setup') {
        this.userContext.clearCurrentUser();
        this.router.navigate(['/setup']);
      }
    });
  }

  switchUser(member: TeamMember): void {
    this.userContext.setCurrentUser(member);
    this.showSwitcher = false;
    this.router.navigate(['/home']);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  // ── Data Management ──

  downloadData(): void {
    this.footerBusy = true;
    this.dataMgmt.exportData().subscribe({
      next: (data) => {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        a.download = `weeklyplantracker-backup-${ts}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.toast.success('Data downloaded successfully');
        this.footerBusy = false;
      },
      error: () => {
        this.toast.error('Failed to download data');
        this.footerBusy = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result as string);
        // Normalize from sample format (isLead → role, etc.)
        const payload = this.normalizeImport(raw);
        this.openConfirm(
          '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>', 'Load Data From File',
          `This will replace ALL current data with the contents of "${file.name}". Continue?`,
          'Load Data', false,
          () => this.executeImport(payload)
        );
      } catch {
        this.toast.error('Invalid JSON file');
      }
      input.value = '';
    };
    reader.readAsText(file);
  }

  private normalizeImport(raw: any): any {
    const d = raw.data || raw;
    const payload: any = {};

    // Team members: handle both old format (isLead) and new format (role)
    if (d.teamMembers) {
      payload.teamMembers = d.teamMembers.map((m: any) => ({
        id: m.id || crypto.randomUUID(),
        name: m.name,
        role: m.role ?? (m.isLead ? 2 : 1),
        createdAt: m.createdAt || new Date().toISOString()
      }));
    }

    // Backlog items: handle category string → int mapping
    const catMap: Record<string, number> = {
      'CLIENT_FOCUSED': 1, 'TECH_DEBT': 2, 'R_AND_D': 3
    };
    if (d.backlogEntries || d.backlogItems) {
      const items = d.backlogEntries || d.backlogItems;
      payload.backlogItems = items.map((b: any) => ({
        id: b.id || crypto.randomUUID(),
        title: b.title,
        description: b.description || '',
        category: typeof b.category === 'string' ? (catMap[b.category] || 1) : b.category,
        estimatedHours: b.estimatedHours ?? b.estimatedEffort ?? 0,
        isArchived: b.isArchived ?? (b.status === 'ARCHIVED'),
        createdAt: b.createdAt || new Date().toISOString()
      }));
    }

    // Planning weeks
    if (d.planningWeeks || d.planningCycles) {
      const weeks = d.planningWeeks || d.planningCycles;
      if (weeks.length > 0) {
        payload.planningWeeks = weeks.map((w: any) => ({
          id: w.id, planningDate: w.planningDate, startDate: w.startDate, endDate: w.endDate,
          status: w.status, isFrozen: w.isFrozen ?? false,
          clientPercent: w.clientPercent ?? 0, techDebtPercent: w.techDebtPercent ?? 0,
          rndPercent: w.rndPercent ?? 0, createdAt: w.createdAt
        }));
      }
    }

    // Week members
    if (d.weekMembers || d.memberPlans) {
      const wms = d.weekMembers || d.memberPlans;
      if (wms.length > 0) {
        payload.weekMembers = wms.map((wm: any) => ({
          id: wm.id, weekId: wm.weekId, memberId: wm.memberId,
          totalPlannedHours: wm.totalPlannedHours ?? 0,
          totalActualHours: wm.totalActualHours ?? 0,
          hasSubmitted: wm.hasSubmitted ?? false
        }));
      }
    }

    // Member tasks
    if (d.memberTasks || d.taskAssignments) {
      const tasks = d.memberTasks || d.taskAssignments;
      if (tasks.length > 0) {
        payload.memberTasks = tasks.map((t: any) => ({
          id: t.id, weekMemberId: t.weekMemberId, backlogItemId: t.backlogItemId,
          plannedHours: t.plannedHours ?? 0, actualHours: t.actualHours ?? 0,
          progressPercent: t.progressPercent ?? 0
        }));
      }
    }

    return payload;
  }

  private executeImport(payload: any): void {
    this.footerBusy = true;
    this.dataMgmt.importData(payload).subscribe({
      next: () => {
        this.toast.success('Data loaded successfully');
        this.userContext.clearCurrentUser();
        this.store.dispatch(TeamActions.loadTeamMembers());
        this.footerBusy = false;
        this.router.navigate(['/home']);
      },
      error: () => {
        this.toast.error('Failed to load data');
        this.footerBusy = false;
      }
    });
  }

  seedSampleData(): void {
    this.openConfirm(
      '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="14"></line><line x1="9" y1="11" x2="15" y2="11"></line></svg>', 'Seed Sample Data',
      'This will replace ALL current data with sample data (4 members, 10 backlog items). Continue?',
      'Seed Data', false,
      () => {
        this.footerBusy = true;
        this.dataMgmt.seedData().subscribe({
          next: () => {
            this.toast.success('Sample data seeded');
            this.userContext.clearCurrentUser();
            this.store.dispatch(TeamActions.loadTeamMembers());
            this.footerBusy = false;
            this.router.navigate(['/home']);
          },
          error: () => {
            this.toast.error('Failed to seed data');
            this.footerBusy = false;
          }
        });
      }
    );
  }

  confirmReset(): void {
    this.openConfirm(
      '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f85149" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>', 'Reset Application',
      'This will permanently delete ALL data (team members, backlog items, planning weeks). This cannot be undone.',
      'Reset Everything', true,
      () => {
        this.footerBusy = true;
        this.dataMgmt.resetData().subscribe({
          next: () => {
            this.toast.success('All data has been reset');
            this.userContext.clearCurrentUser();
            this.allMembers = [];
            this.currentUser = null;
            this.store.dispatch(TeamActions.loadTeamMembers());
            this.footerBusy = false;
            this.router.navigate(['/setup']);
          },
          error: () => {
            this.toast.error('Failed to reset data');
            this.footerBusy = false;
          }
        });
      }
    );
  }

  private openConfirm(icon: string, title: string, message: string, action: string, danger: boolean, fn: () => void): void {
    this.confirmIcon = icon;
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.confirmAction = action;
    this.confirmDanger = danger;
    this.pendingAction = fn;
    this.showConfirm = true;
  }

  onConfirm(): void {
    this.showConfirm = false;
    this.pendingAction?.();
    this.pendingAction = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
