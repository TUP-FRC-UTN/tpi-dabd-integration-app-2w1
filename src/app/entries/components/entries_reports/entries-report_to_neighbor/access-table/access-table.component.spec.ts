import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessTableComponent } from './access-table.component';

describe('AccessTableComponent', () => {
  let component: AccessTableComponent;
  let fixture: ComponentFixture<AccessTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
