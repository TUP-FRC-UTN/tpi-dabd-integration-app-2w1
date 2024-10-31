import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersModalInfoOwnerComponent } from './users-modal-info-owner.component';

describe('UsersModalInfoOwnerComponent', () => {
  let component: UsersModalInfoOwnerComponent;
  let fixture: ComponentFixture<UsersModalInfoOwnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersModalInfoOwnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersModalInfoOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
