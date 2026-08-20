import {computed, inject, Service, signal} from '@angular/core';
import {Tile, TileType} from '../types/tile.model';
import {CellId, FeatureId, OptionId} from '../types/entities.model';
import {GridStore} from '../store/store';
import {BLACK, FEATURE_COLORS, WHITE} from '../constants/colors.const';

@Service()
export class ColorService {
  store = inject(GridStore);

  hoveredCellId = signal<CellId | undefined>(undefined);
  hoveredLeftOptionId = computed(() => this.store.cellById(this.hoveredCellId() as CellId)?.optionIds?.[0]);
  hoveredTopOptionId = computed(() => this.store.cellById(this.hoveredCellId() as CellId)?.optionIds?.[1]);

  getCellColor(tile: Tile) {
    const cellId = tile.entityId as CellId;

    if (cellId === this.store.selectedCellId?.()) return WHITE;

    const [leftOptionId, topOptionId] = this.store.cellById(cellId)?.optionIds || [];
    let topOptionColor = '';
    let leftOptionColor = '';

    if (leftOptionId === this.hoveredLeftOptionId()) {
      leftOptionColor = this.getFeatureColor(this.store.featurePositions().get(this.store.featureIdByOption(leftOptionId) as FeatureId));
    }

    if (topOptionId === this.hoveredTopOptionId()) {
      topOptionColor = this.getFeatureColor(this.store.featurePositions().get(this.store.featureIdByOption(topOptionId) as FeatureId));
    }

    if (this.hoveredCellId() === tile.entityId) {
      return `color-mix(in oklab, color-mix(in oklab, ${topOptionColor}, ${leftOptionColor}), white 80%)`;
    } else if (topOptionColor || leftOptionColor) {
      return `color-mix(in oklab, ${topOptionColor || leftOptionColor}, white 90%)`;
    }

    return WHITE;
  }

  getOptionColor(tile: Tile) {
    const featureIndex = this.store.featurePositions().get(this.store.featureIdByOption(tile.entityId as OptionId) as FeatureId);

    if (!(featureIndex >= 0)) return WHITE;

    const isHovered = tile.type === TileType.LEFT_OPTION_HEADER && this.hoveredLeftOptionId() === tile.entityId as OptionId ||
      tile.type === TileType.TOP_OPTION_HEADER && this.hoveredTopOptionId() === tile.entityId as OptionId;

    return `color-mix(in oklab, ${WHITE} ${isHovered ? 40 : 70}%, ${this.getFeatureColor(featureIndex)})`;
  }

  getFeatureColor(position: number | undefined): string {
    return position != null && position >= 0 ? FEATURE_COLORS[position % FEATURE_COLORS.length].background : 'transparent';
  }

  getFeatureTextColor(position: number | undefined): string {
    return position != null && position >= 0 ? FEATURE_COLORS[position % FEATURE_COLORS.length].text : BLACK;
  }
}
