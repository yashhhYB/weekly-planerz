import { createAction, props } from '@ngrx/store';
import { TeamMember, CreateTeamMemberRequest, UpdateTeamMemberRequest } from '../../models';

/**
 * Team Member Actions
 * NgRx actions for loading, creating, updating, deleting team members and assigning the lead role
 */

// Load all team members from the API
export const loadTeamMembers = createAction('[Team] Load Team Members');
export const loadTeamMembersSuccess = createAction('[Team] Load Team Members Success', props<{ members: TeamMember[] }>());
export const loadTeamMembersFailure = createAction('[Team] Load Team Members Failure', props<{ error: string }>());

// Create a new team member
export const createTeamMember = createAction('[Team] Create Team Member', props<{ request: CreateTeamMemberRequest }>());
export const createTeamMemberSuccess = createAction('[Team] Create Team Member Success', props<{ member: TeamMember }>());
export const createTeamMemberFailure = createAction('[Team] Create Team Member Failure', props<{ error: string }>());

// Update an existing team member's details
export const updateTeamMember = createAction('[Team] Update Team Member', props<{ id: string; request: UpdateTeamMemberRequest }>());
export const updateTeamMemberSuccess = createAction('[Team] Update Team Member Success', props<{ member: TeamMember }>());
export const updateTeamMemberFailure = createAction('[Team] Update Team Member Failure', props<{ error: string }>());

// Remove a team member from the team
export const deleteTeamMember = createAction('[Team] Delete Team Member', props<{ id: string }>());
export const deleteTeamMemberSuccess = createAction('[Team] Delete Team Member Success', props<{ id: string }>());
export const deleteTeamMemberFailure = createAction('[Team] Delete Team Member Failure', props<{ error: string }>());

// Promote a team member to the Team Lead role (demotes current lead)
export const setTeamLead = createAction('[Team] Set Team Lead', props<{ id: string }>());
export const setTeamLeadSuccess = createAction('[Team] Set Team Lead Success', props<{ member: TeamMember }>());
export const setTeamLeadFailure = createAction('[Team] Set Team Lead Failure', props<{ error: string }>());

// Reset the team error state
export const clearTeamError = createAction('[Team] Clear Error');
