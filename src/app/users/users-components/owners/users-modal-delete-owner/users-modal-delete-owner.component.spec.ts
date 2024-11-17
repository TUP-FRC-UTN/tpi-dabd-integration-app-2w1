import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersModalDeleteOwnerComponent } from './users-modal-delete-owner.component';

describe('UsersModalDeleteOwnerComponent', () => {
  let component: UsersModalDeleteOwnerComponent;
  let fixture: ComponentFixture<UsersModalDeleteOwnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersModalDeleteOwnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersModalDeleteOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
