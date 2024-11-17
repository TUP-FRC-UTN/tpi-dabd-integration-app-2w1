import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessContainerVisitorsEditComponent } from './access-container-visitors-edit.component';

describe('AccessContainerVisitorsEditComponent', () => {
  let component: AccessContainerVisitorsEditComponent;
  let fixture: ComponentFixture<AccessContainerVisitorsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessContainerVisitorsEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessContainerVisitorsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
