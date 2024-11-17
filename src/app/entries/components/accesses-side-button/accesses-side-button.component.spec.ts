import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessesSideButtonComponent } from './accesses-side-button.component';

describe('AccessesSideButtonComponent', () => {
  let component: AccessesSideButtonComponent;
  let fixture: ComponentFixture<AccessesSideButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessesSideButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessesSideButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
