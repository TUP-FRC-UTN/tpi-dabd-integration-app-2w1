import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersSelectMultipleComponent } from './users-select-multiple.component';

describe('UsersSelectMultipleComponent', () => {
  let component: UsersSelectMultipleComponent;
  let fixture: ComponentFixture<UsersSelectMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersSelectMultipleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersSelectMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
