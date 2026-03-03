import * as fromPlanningSelectors from './planning.selectors';
import { PlanningState } from './planning.reducer';
import { PlanningWeek } from '../../models';

describe('PlanningSelectors', () => {
  const mockPlanningWeek: PlanningWeek = {
    id: '1',
    weekStartDate: '2026-01-07',
    weekEndDate: '2026-01-13',
    goals: 'Test goals',
    keyActivities: 'Test activities',
    reflection: 'Test reflection',
    healthScore: 8,
    productivity: 85,
    isFrozenAtCreation: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockState: PlanningState = {
    weeks: [mockPlanningWeek],
    selectedWeek: null,
    loading: false,
    error: null
  };

  it('should select all planning weeks', () => {
    const result = fromPlanningSelectors.selectAllPlanningWeeks.projector(mockState);
    expect(result).toEqual([mockPlanningWeek]);
  });

  it('should select loading state', () => {
    const result = fromPlanningSelectors.selectPlanningLoading.projector(mockState);
    expect(result).toBe(false);
  });

  it('should select error state', () => {
    const result = fromPlanningSelectors.selectPlanningError.projector(mockState);
    expect(result).toBeNull();
  });

  it('should select planning weeks count', () => {
    const result = fromPlanningSelectors.selectPlanningWeeksCount.projector([mockPlanningWeek]);
    expect(result).toBe(1);
  });

  it('should select planning week by id', () => {
    const selector = fromPlanningSelectors.selectPlanningWeekById('1');
    const result = selector.projector([mockPlanningWeek]);
    expect(result).toEqual(mockPlanningWeek);
  });

  it('should return undefined for non-existent planning week', () => {
    const selector = fromPlanningSelectors.selectPlanningWeekById('99');
    const result = selector.projector([mockPlanningWeek]);
    expect(result).toBeUndefined();
  });

  it('should handle empty weeks array', () => {
    const emptyState: PlanningState = {
      weeks: [],
      selectedWeek: null,
      loading: false,
      error: null
    };
    const result = fromPlanningSelectors.selectAllPlanningWeeks.projector(emptyState);
    expect(result).toEqual([]);
  });

  it('should handle multiple weeks', () => {
    const week2: PlanningWeek = { ...mockPlanningWeek, id: '2' };
    const multiState: PlanningState = {
      weeks: [mockPlanningWeek, week2],
      selectedWeek: null,
      loading: false,
      error: null
    };
    const result = fromPlanningSelectors.selectPlanningWeeksCount.projector([mockPlanningWeek, week2]);
    expect(result).toBe(2);
  });
});
