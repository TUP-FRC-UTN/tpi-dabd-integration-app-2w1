import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltiesSanctionsListComponent } from './penalties-list-sanctions.component';

describe('PenaltiesSanctionsListComponent', () => {
  let component: PenaltiesSanctionsListComponent;
  let fixture: ComponentFixture<PenaltiesSanctionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PenaltiesSanctionsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PenaltiesSanctionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
