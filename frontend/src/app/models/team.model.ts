export enum UserRole {
  TeamMember = 1,
  TeamLead = 2
}

export interface TeamMember {
  id: string;
  name: string;
  role: number;
  roleLabel?: string;
  createdAt: Date;
}

export interface CreateTeamMemberRequest {
  name: string;
  role?: number;
}

export interface UpdateTeamMemberRequest {
  name: string;
}

export interface WeekMember {
  id: string;
  weekId: string;
  memberId: string;
  memberName: string;
  memberRole: number;
  totalPlannedHours: number;
  totalActualHours: number;
  hasSubmitted: boolean;
  tasks: MemberTask[];
}

export interface MemberTask {
  id: string;
  weekMemberId: string;
  backlogItemId: string;
  backlogTitle: string;
  backlogCategory: number;
  estimatedHours: number;
  plannedHours: number;
  actualHours: number;
  progressPercent: number;
}

export interface AssignTaskRequest {
  backlogItemId: string;
  plannedHours: number;
}

export interface UpdateProgressRequest {
  actualHours: number;
  progressPercent: number;
}

export interface Dashboard {
  weekId: string;
  weekLabel: string;
  status: number;
  isFrozen: boolean;
  totalPlannedHours: number;
  totalActualHours: number;
  completionPercent: number;
  clientFocused: CategoryBreakdown;
  techDebt: CategoryBreakdown;
  rnD: CategoryBreakdown;
  members: MemberProgress[];
  tasks: TaskProgress[];
}

export interface CategoryBreakdown {
  allocatedPercent: number;
  plannedHours: number;
  actualHours: number;
}

export interface MemberProgress {
  weekMemberId: string;
  name: string;
  plannedHours: number;
  actualHours: number;
  progressPercent: number;
  hasSubmitted: boolean;
}

export interface TaskProgress {
  taskTitle: string;
  memberName: string;
  plannedHours: number;
  actualHours: number;
  progressPercent: number;
}
