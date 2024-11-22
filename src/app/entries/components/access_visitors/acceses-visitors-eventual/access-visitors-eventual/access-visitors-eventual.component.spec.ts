import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessVisitorsEventualComponent } from './access-visitors-eventual.component';

describe('AccessVisitorsEventualComponent', () => {
  let component: AccessVisitorsEventualComponent;
  let fixture: ComponentFixture<AccessVisitorsEventualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessVisitorsEventualComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessVisitorsEventualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
