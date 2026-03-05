import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TeamState } from './team.reducer';

export const selectTeamState = createFeatureSelector<TeamState>('team');

export const selectAllTeamMembers = createSelector(selectTeamState, (state) => state.members);
export const selectTeamLoading = createSelector(selectTeamState, (state) => state.loading);
export const selectTeamError = createSelector(selectTeamState, (state) => state.error);
export const selectTeamLead = createSelector(selectTeamState, (state) => state.members.find(m => m.role === 2));
export const selectTeamMemberCount = createSelector(selectTeamState, (state) => state.members.length);
export const selectTeamLoaded = createSelector(selectTeamState, (state) => state.loaded);
