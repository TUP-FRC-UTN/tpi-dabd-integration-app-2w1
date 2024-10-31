import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersUpdatePlotComponent } from './users-update-plot.component';

describe('UsersUpdatePlotComponent', () => {
  let component: UsersUpdatePlotComponent;
  let fixture: ComponentFixture<UsersUpdatePlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersUpdatePlotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersUpdatePlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
