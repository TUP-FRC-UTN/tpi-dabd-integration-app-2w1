import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessAreachartComponent } from './access-areachart.component';

describe('AccessAreachartComponent', () => {
  let component: AccessAreachartComponent;
  let fixture: ComponentFixture<AccessAreachartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessAreachartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessAreachartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
