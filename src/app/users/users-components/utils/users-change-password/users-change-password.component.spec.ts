import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersChangePasswordComponent } from './users-change-password.component';

describe('UsersChangePasswordComponent', () => {
  let component: UsersChangePasswordComponent;
  let fixture: ComponentFixture<UsersChangePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersChangePasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
