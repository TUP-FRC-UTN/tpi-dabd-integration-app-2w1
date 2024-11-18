import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessGridVisitorsEditComponent } from './access-grid-visitors-edit.component';

describe('AccessGridVisitorsEditComponent', () => {
  let component: AccessGridVisitorsEditComponent;
  let fixture: ComponentFixture<AccessGridVisitorsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessGridVisitorsEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessGridVisitorsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
