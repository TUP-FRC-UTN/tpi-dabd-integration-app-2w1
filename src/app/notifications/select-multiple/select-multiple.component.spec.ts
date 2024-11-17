import { ComponentFixture, TestBed } from '@angular/core/testing';

<<<<<<<< HEAD:src/app/notifications/select-multiple/select-multiple.component.spec.ts
import { SelectMultipleComponent } from './select-multiple.component';

describe('SelectMultipleComponent', () => {
  let component: SelectMultipleComponent;
  let fixture: ComponentFixture<SelectMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectMultipleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectMultipleComponent);
========
import { UsersHomeComponent } from './users-home.component';

describe('UsersHomeComponent', () => {
  let component: UsersHomeComponent;
  let fixture: ComponentFixture<UsersHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersHomeComponent);
>>>>>>>> developer:src/app/common/components/users-home/users-home.component.spec.ts
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
