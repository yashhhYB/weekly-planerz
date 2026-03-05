import { createAction, props } from '@ngrx/store';
import { TeamMember, CreateTeamMemberRequest, UpdateTeamMemberRequest } from '../../models';

// Load all
export const loadTeamMembers = createAction('[Team] Load Team Members');
export const loadTeamMembersSuccess = createAction('[Team] Load Team Members Success', props<{ members: TeamMember[] }>());
export const loadTeamMembersFailure = createAction('[Team] Load Team Members Failure', props<{ error: string }>());

// Create
export const createTeamMember = createAction('[Team] Create Team Member', props<{ request: CreateTeamMemberRequest }>());
export const createTeamMemberSuccess = createAction('[Team] Create Team Member Success', props<{ member: TeamMember }>());
export const createTeamMemberFailure = createAction('[Team] Create Team Member Failure', props<{ error: string }>());

// Update
export const updateTeamMember = createAction('[Team] Update Team Member', props<{ id: string; request: UpdateTeamMemberRequest }>());
export const updateTeamMemberSuccess = createAction('[Team] Update Team Member Success', props<{ member: TeamMember }>());
export const updateTeamMemberFailure = createAction('[Team] Update Team Member Failure', props<{ error: string }>());

// Delete
export const deleteTeamMember = createAction('[Team] Delete Team Member', props<{ id: string }>());
export const deleteTeamMemberSuccess = createAction('[Team] Delete Team Member Success', props<{ id: string }>());
export const deleteTeamMemberFailure = createAction('[Team] Delete Team Member Failure', props<{ error: string }>());

// Set Lead
export const setTeamLead = createAction('[Team] Set Team Lead', props<{ id: string }>());
export const setTeamLeadSuccess = createAction('[Team] Set Team Lead Success', props<{ member: TeamMember }>());
export const setTeamLeadFailure = createAction('[Team] Set Team Lead Failure', props<{ error: string }>());

// Clear
export const clearTeamError = createAction('[Team] Clear Error');
