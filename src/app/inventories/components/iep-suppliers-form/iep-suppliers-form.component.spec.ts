import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepSuppliersFormComponent } from './iep-suppliers-form.component';

describe('IepSuppliersFormComponent', () => {
  let component: IepSuppliersFormComponent;
  let fixture: ComponentFixture<IepSuppliersFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepSuppliersFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepSuppliersFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
