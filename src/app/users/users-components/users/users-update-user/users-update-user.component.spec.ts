import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersUpdateUserComponent } from './users-update-user.component';

describe('UsersUpdateUserComponent', () => {
  let component: UsersUpdateUserComponent;
  let fixture: ComponentFixture<UsersUpdateUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersUpdateUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersUpdateUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
