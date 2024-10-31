import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalComplaintsListComponent } from './penalties-list-complaints-modal.component';

describe('ModalComplaintsListComponent', () => {
  let component: ModalComplaintsListComponent;
  let fixture: ComponentFixture<ModalComplaintsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComplaintsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalComplaintsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
