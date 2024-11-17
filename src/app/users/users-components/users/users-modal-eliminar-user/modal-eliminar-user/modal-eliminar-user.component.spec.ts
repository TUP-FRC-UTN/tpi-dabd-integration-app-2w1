import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEliminarUserComponent } from './modal-eliminar-user.component';

describe('ModalEliminarUserComponent', () => {
  let component: ModalEliminarUserComponent;
  let fixture: ComponentFixture<ModalEliminarUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalEliminarUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEliminarUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
