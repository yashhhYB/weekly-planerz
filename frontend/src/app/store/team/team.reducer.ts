import { createReducer, on } from '@ngrx/store';
import { TeamMember } from '../../models';
import * as TeamActions from './team.actions';

/**
 * Team Reducer
 * Manages the team members state: loading, CRUD operations, and lead role assignment.
 * When a new lead is set, the previous lead is automatically demoted.
 */

export interface TeamState {
  members: TeamMember[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

export const initialTeamState: TeamState = {
  members: [],
  loading: false,
  loaded: false,
  error: null
};

export const teamReducer = createReducer(
  initialTeamState,

  on(TeamActions.loadTeamMembers, (state) => ({ ...state, loading: true, error: null })),
  on(TeamActions.loadTeamMembersSuccess, (state, { members }) => ({ ...state, members, loading: false, loaded: true })),
  on(TeamActions.loadTeamMembersFailure, (state, { error }) => ({ ...state, loading: false, loaded: true, error })),

  on(TeamActions.createTeamMember, (state) => ({ ...state, loading: true })),
  on(TeamActions.createTeamMemberSuccess, (state, { member }) => ({
    ...state, members: [...state.members, member], loading: false
  })),
  on(TeamActions.createTeamMemberFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(TeamActions.updateTeamMember, (state) => ({ ...state, loading: true })),
  on(TeamActions.updateTeamMemberSuccess, (state, { member }) => ({
    ...state,
    members: state.members.map(m => m.id === member.id ? member : m),
    loading: false
  })),
  on(TeamActions.updateTeamMemberFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(TeamActions.deleteTeamMember, (state) => ({ ...state, loading: true })),
  on(TeamActions.deleteTeamMemberSuccess, (state, { id }) => ({
    ...state,
    members: state.members.filter(m => m.id !== id),
    loading: false
  })),
  on(TeamActions.deleteTeamMemberFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(TeamActions.setTeamLead, (state) => ({ ...state, loading: true })),
  on(TeamActions.setTeamLeadSuccess, (state, { member }) => ({
    ...state,
    members: state.members.map(m => {
      if (m.id === member.id) return member;
      if (m.role === 2) return { ...m, role: 1 };
      return m;
    }),
    loading: false
  })),
  on(TeamActions.setTeamLeadFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(TeamActions.clearTeamError, (state) => ({ ...state, error: null }))
);
