import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersModaInfoPlotComponent } from './users-moda-info-plot.component';

describe('UsersModaInfoPlotComponent', () => {
  let component: UsersModaInfoPlotComponent;
  let fixture: ComponentFixture<UsersModaInfoPlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersModaInfoPlotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersModaInfoPlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
