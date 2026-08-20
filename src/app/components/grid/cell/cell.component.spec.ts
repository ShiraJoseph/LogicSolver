import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellComponent } from './cell.component';
import { CELL_TILE } from '../../../constants/tile.const';
import { GridStore } from '../../../store/store';
import { StoreService } from '../../../store/store.service';

describe('CellComponent', () => {
  let component: CellComponent;
  let fixture: ComponentFixture<CellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellComponent]
    })
    .compileComponents();

    TestBed.inject(StoreService);
    const store = TestBed.inject(GridStore);

    fixture = TestBed.createComponent(CellComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tile', {...CELL_TILE, entityId: store.cellIds()[0]});
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
