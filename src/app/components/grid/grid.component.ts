import {Component, computed, inject} from '@angular/core';
import {DataService} from '../../services/data.service';
import {TileService} from '../../services/tile.service';
import {HeaderComponent} from '../header/header.component';
import {NgClass} from '@angular/common';
import {Tile, TileType} from '../../types/tile.model';
import {DataStore} from '../../services/data.store';
import {CellId, FeatureId, OptionId} from '../../types/entities.model';
import {ActiveCell} from './active-tile/active-cell.component';

const HEADER_LAYER = 2;
const CORNER_LAYER = 3;

/**
 * The tiles that stay in view while the rest of the grid scrolls under them, keyed by tile type.
 * `row` and `column` are offsets in grid units from the top and left edges of the header bands:
 * the top band is rows 1-4 (feature names, then option names), the left band is columns 1-4.
 * A tile with only a `row` pins on vertical scroll, only a `column` pins on horizontal scroll,
 * and the corner pins on both, so it paints above the two bands that meet under it.
 */
const STICKY_BY_TYPE: Partial<Record<TileType, {row?: number, column?: number, layer: number}>> = {
  [TileType.CORNER_BLANK]: {row: 0, column: 0, layer: CORNER_LAYER},
  [TileType.TOP_FEATURE_HEADER]: {row: 0, layer: HEADER_LAYER},
  [TileType.ADD_FEATURE]: {row: 0, layer: HEADER_LAYER},
  [TileType.TOP_OPTION_HEADER]: {row: 1, layer: HEADER_LAYER},
  [TileType.ADD_OPTION]: {row: 1, layer: HEADER_LAYER},
  [TileType.LEFT_FEATURE_HEADER]: {column: 0, layer: HEADER_LAYER},
  [TileType.LEFT_OPTION_HEADER]: {column: 1, layer: HEADER_LAYER},
};

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.css',
  imports: [HeaderComponent, NgClass, ActiveCell],
})
export class GridComponent {
  store = inject(DataStore);
  tileService = inject(TileService);
  dataService = inject(DataService);

  stickyByType = STICKY_BY_TYPE;

  columnCount2 = computed(() => this.store.optionCountPerFeature() * (this.store.featureCount() - 1) + 5);

  addFeature2() {
    this.dataService.addNewFeature2();
  }

  addOption2() {
    this.dataService.addNewOptionToAllFeatures2();
  }

  // we might not need this after we use the new x-o-toggle ui
  /** Deactivates all tiles except the currently selected one. */
  switchOut2(newTile: Tile) {
    this.store.setSelectedCellId(newTile.objectId2 as CellId);
  }

  getBorder2(tile: Tile) {
    let topCellIndex: number | undefined = -1;
    let leftCellIndex: number | undefined = -1;
    let optionIndex: number | undefined = -1;
    const isTopOption = tile.type === TileType.TOP_OPTION_HEADER;
    const isLeftOption = tile.type === TileType.LEFT_OPTION_HEADER;
    const isTopFeature = tile.type === TileType.TOP_FEATURE_HEADER;
    const isLeftFeature = tile.type === TileType.LEFT_FEATURE_HEADER;
    const isTopButton = tile.type === TileType.ADD_FEATURE;
    const isBottomButton = tile.type === TileType.ADD_OPTION;
    const isCorner = tile.type === TileType.CORNER_BLANK;
    const lastOptionIndex = this.store.optionCountPerFeature() - 1;
    const cell = this.store.cellById(tile.objectId2 as CellId);
    const option = this.store.optionById(tile.objectId2 as OptionId);
    const feature = this.store.featureById(tile.objectId2 as FeatureId);

    if (cell) {
      const [leftOptionId, topOptionId] = cell.optionIds || [];
      topCellIndex = this.store.indexOfFeatureOption(topOptionId);
      leftCellIndex = this.store.indexOfFeatureOption(leftOptionId);
    }

    if (option) {
      optionIndex = this.store.indexOfFeatureOption(option);
    }

    return {
      left: isLeftFeature,
      right:
        isCorner ||
        feature ||
        isBottomButton ||
        isTopButton ||
        (cell && topCellIndex === lastOptionIndex) ||
        isLeftOption ||
        (isTopOption && optionIndex === lastOptionIndex),
      top: isTopFeature || isTopButton,
      bottom:
        isCorner ||
        feature ||
        isBottomButton ||
        isTopButton ||
        (cell && leftCellIndex === lastOptionIndex) ||
        isTopOption ||
        (isLeftOption && optionIndex === lastOptionIndex),
    };
  }

  clearCells2() {
    this.dataService.clearCells2();
  }
}
