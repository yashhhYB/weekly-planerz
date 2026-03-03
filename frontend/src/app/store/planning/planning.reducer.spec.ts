import { PlanningState, planningReducer, initialPlanningState } from './planning.reducer';
import * as PlanningActions from './planning.actions';
import { PlanningWeek } from '../../models';

describe('PlanningReducer', () => {
  const mockPlanningWeek: PlanningWeek = {
    id: '1',
    weekStartDate: new Date('2026-01-07'),
    weekEndDate: new Date('2026-01-13'),
    goals: 'Test goals',
    keyActivities: 'Test activities',
    reflection: 'Test reflection',
    healthScore: 8,
    productivity: 85,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it('should return the initial state', () => {
    const action = { type: 'UNKNOWN' };
    const result = planningReducer(undefined, action as any);
    expect(result).toEqual(initialPlanningState);
  });

  it('should handle loadPlanningWeeks', () => {
    const action = PlanningActions.loadPlanningWeeks({ skip: 0, take: 50 });
    const state = planningReducer(initialPlanningState, action);
    expect(state.loading).toBe(true);
  });

  it('should handle loadPlanningWeeksSuccess', () => {
    const state = planningReducer(
      { ...initialPlanningState, loading: true },
      PlanningActions.loadPlanningWeeksSuccess({ weeks: [mockPlanningWeek] })
    );
    expect(state.loading).toBe(false);
    expect(state.weeks.length).toBe(1);
    expect(state.error).toBeNull();
  });

  it('should handle loadPlanningWeeksFailure', () => {
    const errorMsg = 'Failed to load';
    const state = planningReducer(
      { ...initialPlanningState, loading: true },
      PlanningActions.loadPlanningWeeksFailure({ error: errorMsg })
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe(errorMsg);
  });

  it('should handle createPlanningWeek', () => {
    const action = PlanningActions.createPlanningWeek({ 
      request: {
        weekStartDate: '2026-01-07',
        goals: 'New goals',
        keyActivities: 'New activities',
        healthScore: 7,
        productivity: 80
      }
    });
    const state = planningReducer(initialPlanningState, action);
    expect(state.loading).toBe(true);
  });

  it('should handle createPlanningWeekSuccess', () => {
    const state = planningReducer(
      { ...initialPlanningState, loading: true },
      PlanningActions.createPlanningWeekSuccess({ week: mockPlanningWeek })
    );
    expect(state.loading).toBe(false);
    expect(state.weeks.length).toBe(1);
    expect(state.weeks[0].goals).toBe('Test goals');
  });

  it('should handle updatePlanningWeek', () => {
    const state = planningReducer(
      { ...initialPlanningState, weeks: [mockPlanningWeek] },
      PlanningActions.updatePlanningWeek({ 
        id: '1', 
        request: { 
          goals: 'Updated',
          keyActivities: 'Updated activities',
          reflection: '',
          healthScore: 8,
          productivity: 85
        }
      })
    );
    expect(state.loading).toBe(true);
  });

  it('should handle updatePlanningWeekSuccess', () => {
    const updated = { ...mockPlanningWeek, goals: 'Updated' };
    const state = planningReducer(
      { ...initialPlanningState, loading: true, weeks: [mockPlanningWeek] },
      PlanningActions.updatePlanningWeekSuccess({ week: updated })
    );
    expect(state.loading).toBe(false);
    expect(state.weeks[0].goals).toBe('Updated');
  });

  it('should handle freezePlanningWeek success', () => {
    const frozen = { ...mockPlanningWeek, goals: 'Frozen goals' };
    const state = planningReducer(
      { ...initialPlanningState, weeks: [mockPlanningWeek] },
      PlanningActions.freezePlanningWeekSuccess({ week: frozen })
    );
    expect(state.weeks[0].goals).toBe('Frozen goals');
  });

  it('should handle deletePlanningWeek', () => {
    const state = planningReducer(
      { ...initialPlanningState, weeks: [mockPlanningWeek] },
      PlanningActions.deletePlanningWeek({ id: '1' })
    );
    expect(state.loading).toBe(true);
  });

  it('should handle deletePlanningWeekSuccess', () => {
    const state = planningReducer(
      { 
        ...initialPlanningState, 
        loading: true, 
        weeks: [mockPlanningWeek] 
      },
      PlanningActions.deletePlanningWeekSuccess({ id: '1' })
    );
    expect(state.loading).toBe(false);
    expect(state.weeks.length).toBe(0);
  });

  it('should handle clearPlanningError', () => {
    const state = planningReducer(
      { ...initialPlanningState, error: 'Some error' },
      PlanningActions.clearPlanningError()
    );
    expect(state.error).toBeNull();
  });
});
