import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { PastWeeksComponent } from './past-weeks.component';
import { PlanningStatus } from '../../../../models';

describe('PastWeeksComponent', () => {
  let component: PastWeeksComponent;
  let fixture: ComponentFixture<PastWeeksComponent>;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    storeSpy.select.and.returnValue(of([
      { id: '1', planningDate: new Date(), startDate: new Date(), endDate: new Date(), status: PlanningStatus.Completed, isFrozen: true, clientPercent: 34, techDebtPercent: 33, rndPercent: 33, createdAt: new Date() },
      { id: '2', planningDate: new Date(), startDate: new Date(), endDate: new Date(), status: PlanningStatus.Archived, isFrozen: true, clientPercent: 40, techDebtPercent: 30, rndPercent: 30, createdAt: new Date() }
    ]));

    await TestBed.configureTestingModule({
      imports: [PastWeeksComponent, RouterTestingModule],
      providers: [
        { provide: Store, useValue: storeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PastWeeksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to all filter', () => {
    expect(component.filter).toBe('all');
  });

  it('should format dates', () => {
    const result = component.formatDate(new Date('2026-01-07'));
    expect(result).toContain('Jan');
  });

  it('should get status label', () => {
    expect(component.getStatusLabel(PlanningStatus.Completed)).toBe('Completed');
    expect(component.getStatusLabel(PlanningStatus.Archived)).toBe('Archived');
  });
});
