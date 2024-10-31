import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessPiechartComponent } from './access-piechart.component';

describe('AccessPiechartComponent', () => {
  let component: AccessPiechartComponent;
  let fixture: ComponentFixture<AccessPiechartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessPiechartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessPiechartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
