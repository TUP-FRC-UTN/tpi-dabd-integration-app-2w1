import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesesVisitorsTempComponent } from './acceses-visitors-temp.component';

describe('AccesesVisitorsTempComponent', () => {
  let component: AccesesVisitorsTempComponent;
  let fixture: ComponentFixture<AccesesVisitorsTempComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccesesVisitorsTempComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccesesVisitorsTempComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
