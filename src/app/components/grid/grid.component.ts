import {Component, computed, inject} from '@angular/core';
import {TileService} from '../../services/tile.service';
import {HeaderComponent} from './header/header.component';
import {HEADER_TILE_TYPES, Tile} from '../../types/tile.model';
import {CellComponent} from './cell/cell.component';
import {CELL_SIZE, NON_CELL_COLUMN_COUNT} from '../../constants/grid.const';
import {BaseDirective} from '../../directives/base.directive';

/** Lays the tiles out on one CSS grid, sized to the current feature and option counts. */
@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.css',
  imports: [HeaderComponent, CellComponent],
})
export class GridComponent extends BaseDirective {
  tileService: TileService = inject(TileService);

  /** A column per option of every feature after the first, plus the header and button columns. */
  columnCount = computed(() => this.store.optionCountPerFeature() * (this.store.featureCount() - 1) + NON_CELL_COLUMN_COUNT);

  protected readonly CELL_SIZE = CELL_SIZE;
}
