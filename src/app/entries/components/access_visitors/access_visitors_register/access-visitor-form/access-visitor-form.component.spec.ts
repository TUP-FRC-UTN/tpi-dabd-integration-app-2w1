import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessVisitorFormComponent } from './access-visitor-form.component';

describe('AccessVisitorFormComponent', () => {
  let component: AccessVisitorFormComponent;
  let fixture: ComponentFixture<AccessVisitorFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessVisitorFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessVisitorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
