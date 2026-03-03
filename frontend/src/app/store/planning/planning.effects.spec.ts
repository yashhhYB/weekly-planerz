import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Store } from '@ngrx/store';
import { Observable, of, throwError } from 'rxjs';
import { PlanningEffects } from './planning.effects';
import { PlanningService } from '../../services/planning.service';
import * as PlanningActions from './planning.actions';
import { PlanningWeek } from '../../models';

describe('PlanningEffects', () => {
  let effects: PlanningEffects;
  let planningService: jasmine.SpyObj<PlanningService>;
  let store: any;

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

  beforeEach(() => {
    const planningServiceSpy = jasmine.createSpyObj('PlanningService', [
      'getPlanningWeeks',
      'getPlanningWeekById',
      'createPlanningWeek',
      'updatePlanningWeek',
      'deletePlanningWeek'
    ]);

    TestBed.configureTestingModule({
      providers: [
        PlanningEffects,
        provideMockStore({ initialState: {} }),
        { provide: PlanningService, useValue: planningServiceSpy }
      ]
    });

    effects = TestBed.inject(PlanningEffects);
    planningService = TestBed.inject(PlanningService) as jasmine.SpyObj<PlanningService>;
    store = TestBed.inject(Store);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});