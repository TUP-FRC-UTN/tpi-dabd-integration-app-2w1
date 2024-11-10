import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepPerformancelistComponent } from './iep-performancelist.component';

describe('IepPerformancelistComponent', () => {
  let component: IepPerformancelistComponent;
  let fixture: ComponentFixture<IepPerformancelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepPerformancelistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepPerformancelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
