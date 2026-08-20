import {Component, computed, inject} from '@angular/core';
import {TileService} from '../../services/tile.service';
import {HeaderComponent} from './header/header.component';
import {HEADER_TILE_TYPES, Tile} from '../../types/tile.model';
import {CellComponent} from './cell/cell.component';
import {CELL_SIZE, NON_CELL_COLUMN_COUNT} from '../../constants/grid.const';
import {BaseComponent} from '../base/base.component';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.css',
  imports: [HeaderComponent, CellComponent],
})
export class GridComponent extends BaseComponent {
  tileService: TileService = inject(TileService);

  columnCount = computed(() => this.store.optionCountPerFeature() * (this.store.featureCount() - 1) + NON_CELL_COLUMN_COUNT);

  isHeader = (tile: Tile) => HEADER_TILE_TYPES.has(tile.type!);

  protected readonly CELL_SIZE = CELL_SIZE;
}
