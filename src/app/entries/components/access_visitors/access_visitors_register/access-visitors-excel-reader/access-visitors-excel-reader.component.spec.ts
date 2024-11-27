import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessVisitorsExcelReaderComponent } from './access-visitors-excel-reader.component';

describe('AccessVisitorsExcelReaderComponent', () => {
  let component: AccessVisitorsExcelReaderComponent;
  let fixture: ComponentFixture<AccessVisitorsExcelReaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessVisitorsExcelReaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessVisitorsExcelReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
