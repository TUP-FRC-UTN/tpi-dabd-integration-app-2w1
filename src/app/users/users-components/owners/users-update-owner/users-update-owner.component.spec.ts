import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersUpdateOwnerComponent } from './users-update-owner.component';

describe('UsersUpdateOwnerComponent', () => {
  let component: UsersUpdateOwnerComponent;
  let fixture: ComponentFixture<UsersUpdateOwnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersUpdateOwnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersUpdateOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
