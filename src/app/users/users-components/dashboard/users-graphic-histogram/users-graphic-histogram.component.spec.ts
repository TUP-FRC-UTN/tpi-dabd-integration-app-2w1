import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersGraphicHistogramComponent } from './users-graphic-histogram.component';

describe('UsersGraphicHistogramComponent', () => {
  let component: UsersGraphicHistogramComponent;
  let fixture: ComponentFixture<UsersGraphicHistogramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersGraphicHistogramComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersGraphicHistogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
