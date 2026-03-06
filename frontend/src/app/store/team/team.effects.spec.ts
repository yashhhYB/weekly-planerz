import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { TeamEffects } from './team.effects';
import { TeamService } from '../../core/services/team.service';
import { ToastService } from '../../core/services/toast.service';
import * as TeamActions from './team.actions';
import { TeamMember, UserRole } from '../../models';
/**
 * Unit tests for Team Effects
 * Validates side-effect handlers for team member CRUD operations and toast notifications
 */
describe('TeamEffects', () => {
  let effects: TeamEffects;
  let teamService: jasmine.SpyObj<TeamService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let actions$: Observable<any>;

  const mockMember: TeamMember = {
    id: '1', name: 'Alice', role: UserRole.TeamMember, createdAt: new Date()
  };

  beforeEach(() => {
    const teamSpy = jasmine.createSpyObj('TeamService', [
      'getAllMembers', 'createMember', 'updateMember', 'deleteMember', 'setTeamLead'
    ]);
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    actions$ = of({ type: 'INIT' });

    TestBed.configureTestingModule({
      providers: [
        TeamEffects,
        provideMockActions(() => actions$),
        { provide: TeamService, useValue: teamSpy },
        { provide: ToastService, useValue: toastSpy }
      ]
    });

    effects = TestBed.inject(TeamEffects);
    teamService = TestBed.inject(TeamService) as jasmine.SpyObj<TeamService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  // --- loadTeamMembers$ ---
  describe('loadTeamMembers$', () => {
    it('should dispatch loadTeamMembersSuccess on success', (done) => {
      const members = [mockMember];
      teamService.getAllMembers.and.returnValue(of(members));
      actions$ = of(TeamActions.loadTeamMembers());

      // Re-create effects with new actions$
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TeamEffects,
          provideMockActions(() => actions$),
          { provide: TeamService, useValue: teamService },
          { provide: ToastService, useValue: toastService }
        ]
      });
      effects = TestBed.inject(TeamEffects);

      effects.loadTeamMembers$.subscribe(action => {
        expect(action).toEqual(TeamActions.loadTeamMembersSuccess({ members }));
        done();
      });
    });

    it('should dispatch loadTeamMembersFailure on error', (done) => {
      teamService.getAllMembers.and.returnValue(throwError(() => new Error('fail')));
      actions$ = of(TeamActions.loadTeamMembers());

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TeamEffects,
          provideMockActions(() => actions$),
          { provide: TeamService, useValue: teamService },
          { provide: ToastService, useValue: toastService }
        ]
      });
      effects = TestBed.inject(TeamEffects);

      effects.loadTeamMembers$.subscribe(action => {
        expect(action).toEqual(TeamActions.loadTeamMembersFailure({ error: 'fail' }));
        done();
      });
    });
  });

  // --- createTeamMember$ ---
  describe('createTeamMember$', () => {
    it('should dispatch createTeamMemberSuccess on success', (done) => {
      teamService.createMember.and.returnValue(of(mockMember));
      actions$ = of(TeamActions.createTeamMember({ request: { name: 'Alice' } }));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TeamEffects,
          provideMockActions(() => actions$),
          { provide: TeamService, useValue: teamService },
          { provide: ToastService, useValue: toastService }
        ]
      });
      effects = TestBed.inject(TeamEffects);

      effects.createTeamMember$.subscribe(action => {
        expect(action).toEqual(TeamActions.createTeamMemberSuccess({ member: mockMember }));
        done();
      });
    });
  });

  // --- deleteTeamMember$ ---
  describe('deleteTeamMember$', () => {
    it('should dispatch deleteTeamMemberSuccess on success', (done) => {
      teamService.deleteMember.and.returnValue(of(true));
      actions$ = of(TeamActions.deleteTeamMember({ id: '1' }));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TeamEffects,
          provideMockActions(() => actions$),
          { provide: TeamService, useValue: teamService },
          { provide: ToastService, useValue: toastService }
        ]
      });
      effects = TestBed.inject(TeamEffects);

      effects.deleteTeamMember$.subscribe(action => {
        expect(action).toEqual(TeamActions.deleteTeamMemberSuccess({ id: '1' }));
        done();
      });
    });
  });

  // --- setTeamLead$ ---
  describe('setTeamLead$', () => {
    it('should dispatch setTeamLeadSuccess on success', (done) => {
      const lead = { ...mockMember, role: UserRole.TeamLead };
      teamService.setTeamLead.and.returnValue(of(lead));
      actions$ = of(TeamActions.setTeamLead({ id: '1' }));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TeamEffects,
          provideMockActions(() => actions$),
          { provide: TeamService, useValue: teamService },
          { provide: ToastService, useValue: toastService }
        ]
      });
      effects = TestBed.inject(TeamEffects);

      effects.setTeamLead$.subscribe(action => {
        expect(action).toEqual(TeamActions.setTeamLeadSuccess({ member: lead }));
        done();
      });
    });
  });

  // --- Toast effects ---
  describe('toast notifications', () => {
    it('should show success toast on createTeamMemberSuccess', (done) => {
      actions$ = of(TeamActions.createTeamMemberSuccess({ member: mockMember }));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          TeamEffects,
          provideMockActions(() => actions$),
          { provide: TeamService, useValue: teamService },
          { provide: ToastService, useValue: toastService }
        ]
      });
      effects = TestBed.inject(TeamEffects);
      toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;

      effects.createSuccess$.subscribe(() => {
        expect(toastService.success).toHaveBeenCalledWith('Team member added');
        done();
      });
    });
  });
});
