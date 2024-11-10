import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MOCKUsersNavbarComponent } from './users-navbar.component';

describe('UsersNavbarComponent', () => {
  let component: MOCKUsersNavbarComponent;
  let fixture: ComponentFixture<MOCKUsersNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MOCKUsersNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MOCKUsersNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});