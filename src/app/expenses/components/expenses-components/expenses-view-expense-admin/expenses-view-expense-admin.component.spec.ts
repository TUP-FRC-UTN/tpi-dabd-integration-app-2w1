import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGastosAdminComponent } from './expenses-view-expense-admin.component';

describe('ViewGastosAdminComponent', () => {
  let component: ViewGastosAdminComponent;
  let fixture: ComponentFixture<ViewGastosAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewGastosAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewGastosAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
