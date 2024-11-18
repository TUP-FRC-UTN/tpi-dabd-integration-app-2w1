import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessTimeRangeVisitorsEditComponent } from './access-time-range-visitors-edit.component';

describe('AccessTimeRangeVisitorsEditComponent', () => {
  let component: AccessTimeRangeVisitorsEditComponent;
  let fixture: ComponentFixture<AccessTimeRangeVisitorsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessTimeRangeVisitorsEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessTimeRangeVisitorsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
