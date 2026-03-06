import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap } from 'rxjs/operators';
import { TeamService, ToastService } from '../../core/services';
import * as TeamActions from './team.actions';

/**
 * NgRx side-effects for the Team feature.
 *
 * Each effect listens for a dispatched action, delegates to {@link TeamService}
 * for HTTP calls, and maps the response to a success or failure action.
 * Non-dispatching effects display toast notifications for user feedback.
 */
@Injectable()
export class TeamEffects {
  constructor(
    private actions$: Actions,
    private teamService: TeamService,
    private toast: ToastService
  ) {}

  /** Fetches all team members from the API. */
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

  /** Creates a new team member via the API. */
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

  /** Updates an existing team member via the API. */
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

  /** Deletes a team member by ID via the API. */
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

  /** Promotes a member to Team Lead via the API. */
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

  /* ---------- Toast notification effects (non-dispatching) ---------- */

  /** Shows a success toast when a member is created. */
  createSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.createTeamMemberSuccess),
      tap(() => this.toast.success('Team member added'))
    ), { dispatch: false }
  );

  /** Shows a success toast when a member is deleted. */
  deleteSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.deleteTeamMemberSuccess),
      tap(() => this.toast.success('Team member removed'))
    ), { dispatch: false }
  );

  /** Shows a success toast when a new Team Lead is set. */
  setLeadSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.setTeamLeadSuccess),
      tap(({ member }) => this.toast.success(`${member.name} is now Team Lead`))
    ), { dispatch: false }
  );

  /** Displays an error toast for any team-related failure action. */
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
