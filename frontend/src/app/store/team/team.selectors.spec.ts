import { selectTeamState, selectAllTeamMembers, selectTeamLoading, selectTeamError, selectTeamLead, selectTeamMemberCount, selectTeamLoaded } from './team.selectors';
import { TeamState, initialTeamState } from './team.reducer';
import { TeamMember, UserRole } from '../../models';

/**
 * Unit tests for Team Selectors
 * Validates all derived state projections from the team feature state
 */
describe('TeamSelectors', () => {
  const mockMember: TeamMember = {
    id: '1', name: 'Alice', role: UserRole.TeamMember, createdAt: new Date()
  };
  const mockLead: TeamMember = {
    id: '2', name: 'Bob', role: UserRole.TeamLead, createdAt: new Date()
  };

  const populatedState: TeamState = {
    members: [mockMember, mockLead],
    loading: false,
    loaded: true,
    error: null
  };

  it('should select the team state', () => {
    const result = selectTeamState.projector(populatedState);
    expect(result).toEqual(populatedState);
  });

  it('should select all team members', () => {
    const result = selectAllTeamMembers.projector(populatedState);
    expect(result.length).toBe(2);
  });

  it('should select team loading flag', () => {
    const loadingState = { ...populatedState, loading: true };
    expect(selectTeamLoading.projector(loadingState)).toBe(true);
    expect(selectTeamLoading.projector(populatedState)).toBe(false);
  });

  it('should select team error', () => {
    const errorState = { ...populatedState, error: 'fail' };
    expect(selectTeamError.projector(errorState)).toBe('fail');
    expect(selectTeamError.projector(populatedState)).toBeNull();
  });

  it('should select team lead', () => {
    const lead = selectTeamLead.projector(populatedState);
    expect(lead).toBeTruthy();
    expect(lead?.name).toBe('Bob');
    expect(lead?.role).toBe(UserRole.TeamLead);
  });

  it('should return undefined when no team lead exists', () => {
    const noLeadState: TeamState = { ...populatedState, members: [mockMember] };
    expect(selectTeamLead.projector(noLeadState)).toBeUndefined();
  });

  it('should select team member count', () => {
    expect(selectTeamMemberCount.projector(populatedState)).toBe(2);
    expect(selectTeamMemberCount.projector(initialTeamState)).toBe(0);
  });

  it('should select team loaded flag', () => {
    expect(selectTeamLoaded.projector(populatedState)).toBe(true);
    expect(selectTeamLoaded.projector(initialTeamState)).toBe(false);
  });
});
