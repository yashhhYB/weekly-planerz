import { TeamState, teamReducer, initialTeamState } from './team.reducer';
import * as TeamActions from './team.actions';
import { TeamMember, UserRole } from '../../models';

/**
 * Unit tests for the Team Reducer
 * Validates all state transitions for team member CRUD operations and role management
 */
describe('TeamReducer', () => {
  /** Mock team member used across tests */
  const mockMember: TeamMember = {
    id: '1',
    name: 'Alice',
    role: UserRole.TeamMember,
    createdAt: new Date()
  };

  const mockLead: TeamMember = {
    id: '2',
    name: 'Bob',
    role: UserRole.TeamLead,
    createdAt: new Date()
  };

  it('should return the initial state for unknown action', () => {
    const action = { type: 'UNKNOWN' };
    const result = teamReducer(undefined, action as any);
    expect(result).toEqual(initialTeamState);
  });

  // --- Load ---
  it('should set loading=true on loadTeamMembers', () => {
    const state = teamReducer(initialTeamState, TeamActions.loadTeamMembers());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should populate members on loadTeamMembersSuccess', () => {
    const members = [mockMember, mockLead];
    const state = teamReducer(
      { ...initialTeamState, loading: true },
      TeamActions.loadTeamMembersSuccess({ members })
    );
    expect(state.loading).toBe(false);
    expect(state.loaded).toBe(true);
    expect(state.members.length).toBe(2);
  });

  it('should set error on loadTeamMembersFailure', () => {
    const state = teamReducer(
      { ...initialTeamState, loading: true },
      TeamActions.loadTeamMembersFailure({ error: 'Network error' })
    );
    expect(state.loading).toBe(false);
    expect(state.loaded).toBe(true);
    expect(state.error).toBe('Network error');
  });

  // --- Create ---
  it('should set loading=true on createTeamMember', () => {
    const state = teamReducer(
      initialTeamState,
      TeamActions.createTeamMember({ request: { name: 'New' } })
    );
    expect(state.loading).toBe(true);
  });

  it('should append member on createTeamMemberSuccess', () => {
    const state = teamReducer(
      { ...initialTeamState, members: [mockLead], loading: true },
      TeamActions.createTeamMemberSuccess({ member: mockMember })
    );
    expect(state.loading).toBe(false);
    expect(state.members.length).toBe(2);
    expect(state.members[1].name).toBe('Alice');
  });

  it('should set error on createTeamMemberFailure', () => {
    const state = teamReducer(
      { ...initialTeamState, loading: true },
      TeamActions.createTeamMemberFailure({ error: 'Create failed' })
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Create failed');
  });

  // --- Update ---
  it('should set loading=true on updateTeamMember', () => {
    const state = teamReducer(
      { ...initialTeamState, members: [mockMember] },
      TeamActions.updateTeamMember({ id: '1', request: { name: 'Alice2' } })
    );
    expect(state.loading).toBe(true);
  });

  it('should replace member on updateTeamMemberSuccess', () => {
    const updated = { ...mockMember, name: 'Alice Updated' };
    const state = teamReducer(
      { ...initialTeamState, members: [mockMember], loading: true },
      TeamActions.updateTeamMemberSuccess({ member: updated })
    );
    expect(state.loading).toBe(false);
    expect(state.members[0].name).toBe('Alice Updated');
  });

  it('should set error on updateTeamMemberFailure', () => {
    const state = teamReducer(
      { ...initialTeamState, loading: true },
      TeamActions.updateTeamMemberFailure({ error: 'Update failed' })
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Update failed');
  });

  // --- Delete ---
  it('should set loading=true on deleteTeamMember', () => {
    const state = teamReducer(
      { ...initialTeamState, members: [mockMember] },
      TeamActions.deleteTeamMember({ id: '1' })
    );
    expect(state.loading).toBe(true);
  });

  it('should remove member on deleteTeamMemberSuccess', () => {
    const state = teamReducer(
      { ...initialTeamState, members: [mockMember, mockLead], loading: true },
      TeamActions.deleteTeamMemberSuccess({ id: '1' })
    );
    expect(state.loading).toBe(false);
    expect(state.members.length).toBe(1);
    expect(state.members[0].id).toBe('2');
  });

  it('should set error on deleteTeamMemberFailure', () => {
    const state = teamReducer(
      { ...initialTeamState, loading: true },
      TeamActions.deleteTeamMemberFailure({ error: 'Delete failed' })
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Delete failed');
  });

  // --- Set Lead ---
  it('should set loading=true on setTeamLead', () => {
    const state = teamReducer(
      { ...initialTeamState, members: [mockMember] },
      TeamActions.setTeamLead({ id: '1' })
    );
    expect(state.loading).toBe(true);
  });

  it('should promote member and demote old lead on setTeamLeadSuccess', () => {
    const promoted = { ...mockMember, role: UserRole.TeamLead };
    const state = teamReducer(
      { ...initialTeamState, members: [mockMember, mockLead], loading: true },
      TeamActions.setTeamLeadSuccess({ member: promoted })
    );
    expect(state.loading).toBe(false);
    // The promoted member should now be lead
    const alice = state.members.find(m => m.id === '1');
    expect(alice?.role).toBe(UserRole.TeamLead);
    // The old lead (role === 2) should be demoted to member (role === 1)
    const bob = state.members.find(m => m.id === '2');
    expect(bob?.role).toBe(UserRole.TeamMember);
  });

  it('should set error on setTeamLeadFailure', () => {
    const state = teamReducer(
      { ...initialTeamState, loading: true },
      TeamActions.setTeamLeadFailure({ error: 'Lead failed' })
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Lead failed');
  });

  // --- Clear Error ---
  it('should clear error on clearTeamError', () => {
    const state = teamReducer(
      { ...initialTeamState, error: 'Some error' },
      TeamActions.clearTeamError()
    );
    expect(state.error).toBeNull();
  });
});
