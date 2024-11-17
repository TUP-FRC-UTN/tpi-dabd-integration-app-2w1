import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessReportNeighboorComponent } from './access-report-neighboor.component';

describe('AccessReportNeighboorComponent', () => {
  let component: AccessReportNeighboorComponent;
  let fixture: ComponentFixture<AccessReportNeighboorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessReportNeighboorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessReportNeighboorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
