import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersRecoveryPasswordComponent } from './users-recovery-password.component';

describe('UsersRecoveryPasswordComponent', () => {
  let component: UsersRecoveryPasswordComponent;
  let fixture: ComponentFixture<UsersRecoveryPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersRecoveryPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersRecoveryPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
