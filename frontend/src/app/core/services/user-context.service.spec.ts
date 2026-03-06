import { UserContextService } from './user-context.service';
import { TeamMember, UserRole } from '../../models';

/**
 * Unit tests for UserContextService
 * Validates user selection, localStorage persistence, role checks, and refresh logic
 */
describe('UserContextService', () => {
  let service: UserContextService;

  const mockLead: TeamMember = {
    id: '1', name: 'Alice', role: UserRole.TeamLead, createdAt: new Date()
  };
  const mockMember: TeamMember = {
    id: '2', name: 'Bob', role: UserRole.TeamMember, createdAt: new Date()
  };

  beforeEach(() => {
    localStorage.clear();
    service = new UserContextService();
  });

  afterEach(() => localStorage.clear());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null when no user is set', () => {
    expect(service.currentUser).toBeNull();
  });

  it('should set and get current user', () => {
    service.setCurrentUser(mockLead);
    expect(service.currentUser).toEqual(mockLead);
  });

  it('should persist user to localStorage', () => {
    service.setCurrentUser(mockMember);
    const stored = JSON.parse(localStorage.getItem('wp_current_user')!);
    expect(stored.name).toBe('Bob');
  });

  it('should load user from localStorage on construction', () => {
    localStorage.setItem('wp_current_user', JSON.stringify(mockLead));
    const svc = new UserContextService();
    expect(svc.currentUser?.name).toBe('Alice');
  });

  it('should clear current user', () => {
    service.setCurrentUser(mockLead);
    service.clearCurrentUser();
    expect(service.currentUser).toBeNull();
    expect(localStorage.getItem('wp_current_user')).toBeNull();
  });

  it('should emit isLead=true for lead user', (done) => {
    service.setCurrentUser(mockLead);
    service.isLead$.subscribe(val => {
      expect(val).toBe(true);
      done();
    });
  });

  it('should report isLead getter correctly', () => {
    service.setCurrentUser(mockLead);
    expect(service.isLead).toBe(true);
    service.setCurrentUser(mockMember);
    expect(service.isLead).toBe(false);
  });

  it('should emit isMember=true for team member', (done) => {
    service.setCurrentUser(mockMember);
    service.isMember$.subscribe(val => {
      expect(val).toBe(true);
      done();
    });
  });

  it('should refresh user from members list', () => {
    service.setCurrentUser(mockLead);
    const updatedAlice = { ...mockLead, name: 'Alice Updated' };
    service.refreshFromMembers([updatedAlice, mockMember]);
    expect(service.currentUser?.name).toBe('Alice Updated');
  });

  it('should not crash when refreshing with no current user', () => {
    expect(() => service.refreshFromMembers([mockMember])).not.toThrow();
  });

  it('should handle corrupt localStorage gracefully', () => {
    localStorage.setItem('wp_current_user', 'not-json');
    const svc = new UserContextService();
    expect(svc.currentUser).toBeNull();
  });
});
