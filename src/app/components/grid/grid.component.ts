import {Component, computed, inject} from '@angular/core';
import {StoreService} from '../../store/store.service';
import {TileService} from '../../services/tile.service';
import {HeaderComponent} from './header/header.component';
import {NgClass} from '@angular/common';
import {HEADER_TILE_TYPES, Tile, TileType} from '../../types/tile.model';
import {GridStore} from '../../store/store';
import {CellId, FeatureId, OptionId} from '../../types/entities.model';
import {CellComponent} from './cell/cell.component';
import {CELL_SIZE, NON_OPTION_COLUMN_COUNT} from '../../types/constants';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.css',
  imports: [HeaderComponent, NgClass, CellComponent],
})
export class GridComponent {
  store = inject(GridStore);
  tileService: TileService = inject(TileService);
  storeService: StoreService = inject(StoreService);

  columnCount = computed(() => this.store.optionCountPerFeature() * (this.store.featureCount() - 1) + NON_OPTION_COLUMN_COUNT);

  isHeader = (tile: Tile) => HEADER_TILE_TYPES.has(tile.type!);

  addFeature() {
    this.storeService.addNewFeature();
  }

  addOption() {
    this.storeService.addNewOptionToAllFeatures();
  }

  getBorder(tile: Tile) {
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
    const cell = this.store.cellById(tile.entityId as CellId);
    const option = this.store.optionById(tile.entityId as OptionId);
    const feature = this.store.featureById(tile.entityId as FeatureId);

    if (cell) {
      const [leftOptionId, topOptionId] = cell.optionIds || [];
      topCellIndex = this.store.indexOfFeatureOption(topOptionId);
      leftCellIndex = this.store.indexOfFeatureOption(leftOptionId);
    }

    if (option) {
      optionIndex = this.store.indexOfFeatureOption(option);
    }

    return {
      'left-border': isLeftFeature,
      'right-border':
        isCorner ||
        feature ||
        isBottomButton ||
        isTopButton ||
        (cell && topCellIndex === lastOptionIndex) ||
        isLeftOption ||
        (isTopOption && optionIndex === lastOptionIndex),
      'top-border': isTopFeature || isTopButton,
      'bottom-border':
        isCorner ||
        feature ||
        isBottomButton ||
        isTopButton ||
        (cell && leftCellIndex === lastOptionIndex) ||
        isTopOption ||
        (isLeftOption && optionIndex === lastOptionIndex),
    };
  }

  clearCells() {
    this.storeService.clearCells();
  }

  protected readonly CELL_SIZE = CELL_SIZE;
}
