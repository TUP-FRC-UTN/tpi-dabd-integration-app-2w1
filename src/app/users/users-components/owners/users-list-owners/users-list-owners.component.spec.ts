import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersListOwnersComponent } from './users-list-owners.component';

describe('UsersListOwnersComponent', () => {
  let component: UsersListOwnersComponent;
  let fixture: ComponentFixture<UsersListOwnersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersListOwnersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersListOwnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
