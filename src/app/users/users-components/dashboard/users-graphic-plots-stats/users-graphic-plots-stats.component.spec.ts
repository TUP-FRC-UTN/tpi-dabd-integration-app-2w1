import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersGraphicPlotsComponent } from './users-graphic-plots-stats.component';

describe('UsersGraphicPlotsComponent', () => {
  let component: UsersGraphicPlotsComponent;
  let fixture: ComponentFixture<UsersGraphicPlotsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersGraphicPlotsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersGraphicPlotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
