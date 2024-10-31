import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessDailyFetchComponent } from './access-daily-fetch.component';

describe('AccessDailyFetchComponent', () => {
  let component: AccessDailyFetchComponent;
  let fixture: ComponentFixture<AccessDailyFetchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessDailyFetchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessDailyFetchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
