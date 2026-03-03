import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Store } from '@ngrx/store';
import { Observable, of, throwError } from 'rxjs';
import { PlanningEffects } from './planning.effects';
import { PlanningService } from '../../core/services';
import * as PlanningActions from './planning.actions';
import { PlanningWeek } from '../../models';

describe('PlanningEffects', () => {
  let effects: PlanningEffects;
  let planningService: jasmine.SpyObj<PlanningService>;
  let actions$: Observable<any>;

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

  beforeEach(() => {
    const planningServiceSpy = jasmine.createSpyObj('PlanningService', [
      'getPlanningWeeks',
      'getPlanningWeekById',
      'createPlanningWeek',
      'updatePlanningWeek',
      'deletePlanningWeek'
    ]);

    actions$ = of({ type: 'INIT' });

    TestBed.configureTestingModule({
      providers: [
        PlanningEffects,
        provideMockActions(() => actions$),
        { provide: PlanningService, useValue: planningServiceSpy }
      ]
    });

    effects = TestBed.inject(PlanningEffects);
    planningService = TestBed.inject(PlanningService) as jasmine.SpyObj<PlanningService>;
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});