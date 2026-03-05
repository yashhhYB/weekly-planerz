import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Store } from '@ngrx/store';
import { Observable, of, throwError } from 'rxjs';
import { PlanningEffects } from './planning.effects';
import { PlanningService } from '../../core/services';
import * as PlanningActions from './planning.actions';
import { PlanningWeek, PlanningStatus } from '../../models';

describe('PlanningEffects', () => {
  let effects: PlanningEffects;
  let planningService: jasmine.SpyObj<PlanningService>;
  let actions$: Observable<any>;

  const mockPlanningWeek: PlanningWeek = {
    id: '1',
    planningDate: new Date('2026-01-07'),
    startDate: new Date('2026-01-08'),
    endDate: new Date('2026-01-13'),
    status: PlanningStatus.InProgress,
    isFrozen: false,
    clientPercent: 34,
    techDebtPercent: 33,
    rndPercent: 33,
    createdAt: new Date()
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