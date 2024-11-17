import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersGraphicPlotComponent } from './users-graphic-plot.component';

describe('UsersGraphicPlotComponent', () => {
  let component: UsersGraphicPlotComponent;
  let fixture: ComponentFixture<UsersGraphicPlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersGraphicPlotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersGraphicPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
