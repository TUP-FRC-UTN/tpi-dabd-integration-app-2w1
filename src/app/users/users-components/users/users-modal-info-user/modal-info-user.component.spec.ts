import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInfoUserComponent } from './modal-info-user.component';

describe('ModalInfoUserComponent', () => {
  let component: ModalInfoUserComponent;
  let fixture: ComponentFixture<ModalInfoUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalInfoUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalInfoUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
