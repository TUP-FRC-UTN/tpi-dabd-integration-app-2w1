import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltiesPostDisclaimerComponent } from './penalties-post-disclaimer.component';

describe('PenaltiesPostDisclaimerComponent', () => {
  let component: PenaltiesPostDisclaimerComponent;
  let fixture: ComponentFixture<PenaltiesPostDisclaimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PenaltiesPostDisclaimerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PenaltiesPostDisclaimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
