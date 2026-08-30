import {computed, inject, Service, signal} from '@angular/core';
import {Tile, TileType} from '../types/tile.model';
import {CellId, FeatureId, OptionId} from '../types/entities.model';
import {GridStore} from '../store/store';
import {BLACK, FEATURE_COLORS, WHITE} from '../constants/color.const';

/** The colors each tile takes from its feature and from what the pointer is over. */
@Service()
export class ColorService {
  store = inject(GridStore);

  /** The cell the pointer is over, which lights its row and column. */
  hoveredCellId = signal<CellId | undefined>(undefined);

  /** The option on the left axis of the hovered cell. */
  hoveredLeftOptionId = computed(() => this.store.cellById(this.hoveredCellId() as CellId)?.optionIds?.[0]);

  /** The option on the top axis of the hovered cell. */
  hoveredTopOptionId = computed(() => this.store.cellById(this.hoveredCellId() as CellId)?.optionIds?.[1]);

  /**
   * White for non-hovered cells. Cells in a hovered row or column take a pale tint of that line's
   * feature color, and the hovered cell itself mixes both.  Once active the cell will be white.
   * @param tile
   */
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
      return `color-mix(in oklab, color-mix(in oklab, ${topOptionColor}, ${leftOptionColor}), ${WHITE} 80%)`;
    } else if (topOptionColor || leftOptionColor) {
      return `color-mix(in oklab, ${topOptionColor || leftOptionColor}, ${WHITE} 90%)`;
    }

    return WHITE;
  }

  /**
   * The option's feature color lightened with white, less of it while that option is hovered.
   * @param tile
   */
  getOptionColor(tile: Tile) {
    const featureIndex = this.store.featurePositions().get(this.store.featureIdByOption(tile.entityId as OptionId) as FeatureId);

    if (!(featureIndex >= 0)) return WHITE;

    const isOptionHovered = tile.type === TileType.LEFT_OPTION_HEADER && this.hoveredLeftOptionId() === tile.entityId as OptionId ||
      tile.type === TileType.TOP_OPTION_HEADER && this.hoveredTopOptionId() === tile.entityId as OptionId;

    return `color-mix(in oklab, ${WHITE} ${isOptionHovered ? 40 : 70}%, ${this.getFeatureColor(featureIndex)})`;
  }

  /**
   * The palette color for a feature in that position, wrapping when there are more features than colors.
   * @param position
   */
  getFeatureColor(position: number | undefined): string {
    return position !== undefined && position >= 0 ? FEATURE_COLORS[position % FEATURE_COLORS.length].background : 'transparent';
  }

  /**
   * The label color that reads against `getFeatureColor` for the same position.
   * @param position
   */
  getFeatureTextColor(position: number | undefined): string {
    return position !== undefined && position >= 0 ? FEATURE_COLORS[position % FEATURE_COLORS.length].text : BLACK;
  }
}
