import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessEntryComponent } from './access-entry.component';

describe('AccessEntryComponent', () => {
  let component: AccessEntryComponent;
  let fixture: ComponentFixture<AccessEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessEntryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
