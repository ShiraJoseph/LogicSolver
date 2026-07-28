import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveCell } from './active-cell.component';

describe('ActiveTile', () => {
  let component: ActiveCell;
  let fixture: ComponentFixture<ActiveCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveCell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveCell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
