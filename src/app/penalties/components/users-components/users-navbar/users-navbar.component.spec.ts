import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersNavbarComponent } from './users-navbar.component';

describe('UsersNavbarComponent', () => {
  let component: UsersNavbarComponent;
  let fixture: ComponentFixture<UsersNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});