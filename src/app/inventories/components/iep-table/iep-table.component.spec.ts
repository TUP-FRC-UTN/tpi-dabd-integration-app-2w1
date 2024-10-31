import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IepTableComponent } from './iep-table.component';

describe('IepTableComponent', () => {
  let component: IepTableComponent;
  let fixture: ComponentFixture<IepTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IepTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IepTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
