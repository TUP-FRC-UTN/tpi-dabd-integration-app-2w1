import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersFamiliarGroupComponent } from './users-familiar-group.component';

describe('UsersFamiliarGroupComponent', () => {
  let component: UsersFamiliarGroupComponent;
  let fixture: ComponentFixture<UsersFamiliarGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersFamiliarGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersFamiliarGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
