import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepKpiComponent } from './iep-kpi.component';

describe('IepKpiComponent', () => {
  let component: IepKpiComponent;
  let fixture: ComponentFixture<IepKpiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepKpiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
