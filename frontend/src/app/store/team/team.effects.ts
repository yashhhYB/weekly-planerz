import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap } from 'rxjs/operators';
import { TeamService, ToastService } from '../../core/services';
import * as TeamActions from './team.actions';

@Injectable()
export class TeamEffects {
  constructor(
    private actions$: Actions,
    private teamService: TeamService,
    private toast: ToastService
  ) {}

  loadTeamMembers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.loadTeamMembers),
      exhaustMap(() =>
        this.teamService.getAllMembers().pipe(
          map(members => TeamActions.loadTeamMembersSuccess({ members })),
          catchError(error => of(TeamActions.loadTeamMembersFailure({ error: error.message })))
        )
      )
    )
  );

  createTeamMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.createTeamMember),
      exhaustMap(({ request }) =>
        this.teamService.createMember(request).pipe(
          map(member => TeamActions.createTeamMemberSuccess({ member })),
          catchError(error => of(TeamActions.createTeamMemberFailure({ error: error.message })))
        )
      )
    )
  );

  updateTeamMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.updateTeamMember),
      exhaustMap(({ id, request }) =>
        this.teamService.updateMember(id, request).pipe(
          map(member => TeamActions.updateTeamMemberSuccess({ member })),
          catchError(error => of(TeamActions.updateTeamMemberFailure({ error: error.message })))
        )
      )
    )
  );

  deleteTeamMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.deleteTeamMember),
      exhaustMap(({ id }) =>
        this.teamService.deleteMember(id).pipe(
          map(() => TeamActions.deleteTeamMemberSuccess({ id })),
          catchError(error => of(TeamActions.deleteTeamMemberFailure({ error: error.message })))
        )
      )
    )
  );

  setTeamLead$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.setTeamLead),
      exhaustMap(({ id }) =>
        this.teamService.setTeamLead(id).pipe(
          map(member => TeamActions.setTeamLeadSuccess({ member })),
          catchError(error => of(TeamActions.setTeamLeadFailure({ error: error.message })))
        )
      )
    )
  );

  // Toast notifications
  createSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.createTeamMemberSuccess),
      tap(() => this.toast.success('Team member added'))
    ), { dispatch: false }
  );

  deleteSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.deleteTeamMemberSuccess),
      tap(() => this.toast.success('Team member removed'))
    ), { dispatch: false }
  );

  setLeadSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.setTeamLeadSuccess),
      tap(({ member }) => this.toast.success(`${member.name} is now Team Lead`))
    ), { dispatch: false }
  );

  errors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        TeamActions.createTeamMemberFailure,
        TeamActions.deleteTeamMemberFailure,
        TeamActions.setTeamLeadFailure
      ),
      tap(({ error }) => this.toast.error(error))
    ), { dispatch: false }
  );
}
