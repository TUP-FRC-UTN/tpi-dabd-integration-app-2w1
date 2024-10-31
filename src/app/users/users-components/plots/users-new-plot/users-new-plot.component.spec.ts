import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersNewPlotComponent } from './users-new-plot.component';

describe('UsersNewPlotComponent', () => {
  let component: UsersNewPlotComponent;
  let fixture: ComponentFixture<UsersNewPlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersNewPlotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersNewPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
