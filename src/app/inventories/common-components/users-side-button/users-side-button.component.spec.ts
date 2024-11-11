import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersSideButtonComponent } from './users-side-button.component';

describe('UsersSideButtonComponent', () => {
  let component: UsersSideButtonComponent;
  let fixture: ComponentFixture<UsersSideButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersSideButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersSideButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
