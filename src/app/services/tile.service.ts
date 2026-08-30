import {computed, inject, Service} from '@angular/core';
import {CellText, Tile} from '../types/tile.model';
import {GridStore} from '../store/store';
import {Cell, Feature, OptionId} from '../types/entities.model';
import {CELL_TILE, CORNER_BLANK_TILE, FILLER_BLANK_TILE, LEFT_FEATURE_TILE, LEFT_OPTION_TILE, NEW_FEATURE_BUTTON_TILE, NEW_OPTION_BUTTON_TILE, RIGHT_BLANK_TILE, TOP_FEATURE_TILE, TOP_OPTION_TILE} from '../constants/tile.const';
import {BOTTOM_BORDER, RIGHT_BORDER} from '../constants/grid.const';

/** Builds the ordered list of tiles the grid renders from the features, options, and cells in the store. */
@Service()
export class TileService {
  store = inject(GridStore);

  /**
   * Pushes the array of tile data for the grid, one row at a time.
   * Tiles that span multiple rows are treated as existing only in their top row, in terms of tile order.
   *
   * @example
   * ```markdown
   * The following diagram indicates where each tile type would go in the grid if the grid had
   * three features with two options each.
   *
   * Legend:
   *   NF  = NEW_FEATURE_BUTTON_TILE
   *   NO  = NEW_OPTION_BUTTON_TILE
   *   RB  = RIGHT_BLANK_TILE
   *   ┄   = no border visible in the UI but the tile ends there
   *   0-9 = address in the grid (not visible in the UI)
   *
   *        0         1     2     3        4          5            6           7         8
   *    ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄╔═══════════════════════╦═══════════════════════╦═══════╗
   * 0 ┆                             ║   TOP_FEATURE_TILE    ║   TOP_FEATURE_TILE    ║  NF   ║
   *   ┆                             ╠═══════════╦═══════════╬═══════════╦═══════════╬═══════╣
   * 1 ┆      CORNER_BLANK_TILE      ║   TOP_    ║   TOP_    ║   TOP_    ║   TOP_    ║       ║
   * 2 ┆                             ║  OPTION_  ║  OPTION_  ║  OPTION_  ║  OPTION_  ║  NO   ║
   * 3 ┆                             ║   TILE    ║   TILE    ║   TILE    ║   TILE    ║       ║
   *   ╔══════════╦══════════════════╬═══════════╬═══════════╬═══════════╬═══════════╬═══════╝
   * 4 ║  LEFT_   ║ LEFT_OPTION_TILE ║ CELL_TILE ║ CELL_TILE ║ CELL_TILE ║ CELL_TILE ║       ┆
   *   ║ FEATURE_ ╠══════════════════╬═══════════╬═══════════╬═══════════╬═══════════╣  RB   ┆
   * 5 ║   TILE   ║ LEFT_OPTION_TILE ║ CELL_TILE ║ CELL_TILE ║ CELL_TILE ║ CELL_TILE ║       ┆
   *   ╠══════════╬══════════════════╬═══════════╬═══════════╬═══════════╩═══════════╝┄┄┄┄┄┄┄
   * 6 ║  LEFT_   ║ LEFT_OPTION_TILE ║ CELL_TILE ║ CELL_TILE ║                       ┆       ┆
   *   ║ FEATURE_ ╠══════════════════╬═══════════╬═══════════╣   FILLER_BLANK_TILE   ┆  RB   ┆
   * 7 ║   TILE   ║ LEFT_OPTION_TILE ║ CELL_TILE ║ CELL_TILE ║                       ┆       ┆
   *   ╚══════════╩══════════════════╩═══════════╩═══════════╝┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ┄┄┄┄┄┄┄
   *
   * Continuing the same example, the order that these tiles would be pushed into the tiles array would be:
   * [
   *    CORNER_BLANK_TILE, TOP_FEATURE_TILE, TOP_FEATURE_TILE, NEW_FEATURE_BUTTON_TILE,
   *    TOP_OPTION_TILE, TOP_OPTION_TILE, TOP_OPTION_TILE, TOP_OPTION_TILE, NEW_OPTION_BUTTON_TILE,
   *    LEFT_FEATURE_TILE, LEFT_OPTION_TILE, CELL_TILE, CELL_TILE, CELL_TILE CELL_TILE, RIGHT_BLANK_TILE,
   *    LEFT_OPTION_TILE, CELL_TILE, CELL_TILE, CELL_TILE CELL_TILE,
   *    LEFT_FEATURE_TILE, LEFT_OPTION_TILE, CELL_TILE, CELL_TILE, CELL_TILE CELL_TILE, FILLER_BLANK_TILE, RIGHT_BLANK_TILE,
   *    LEFT_OPTION_TILE, CELL_TILE, CELL_TILE, CELL_TILE CELL_TILE,
   * ]
   * ```
   */
  tiles = computed(() => {
    const tiles: Array<Tile> = [];
    const topOptionTiles: Array<Tile> = [];
    const optionCount: number = this.store.optionCountPerFeature();
    const featureCount = this.store.featureCount();

    tiles.push(CORNER_BLANK_TILE);
    this.pushTopFeatures(tiles, optionCount, topOptionTiles);
    tiles.push(NEW_FEATURE_BUTTON_TILE);
    tiles.push(...topOptionTiles);
    tiles.push(NEW_OPTION_BUTTON_TILE);
    this.pushGridRows(featureCount, optionCount, tiles, topOptionTiles);

    return tiles;
  });

  /**
   * Pushes the corner, then a header per feature after the first, collecting their option headers for the row below.
   * @param tiles
   * @param optionCount
   * @param topOptionTiles
   * @private
   */
  private pushTopFeatures(tiles: Tile[], optionCount: number, topOptionTiles: Tile[]) {
    this.store.features().forEach((feature: Feature, index) => {
      if (index > 0) {
        tiles.push({...TOP_FEATURE_TILE, text: feature.name, entityId: feature.id, cols: optionCount});
        this.store.optionsByFeature(feature)?.forEach((option, indexInFeature) => topOptionTiles.push({
          ...TOP_OPTION_TILE,
          text: option.name,
          entityId: option.id,
          borders: this.joinBorders(TOP_OPTION_TILE.borders, indexInFeature === optionCount - 1 && RIGHT_BORDER)
        }));
      }
    });
  }

  /**
   * Pushes rows of tiles per left feature, stopping when a feature crosses itself.
   *
   * @example
   * ```markdown
   * No cells are needed from where feature C on the left crosses feature C at the top,
   * and no cells needed to the right of that since they are repeated elsewhere:
   *
   *   || B  | C  | D  |
   *   ----------------
   * A || AB | AC | AD |
   * D || DB | DC | x  |
   * C || CB | x  | xx |
   *
   * x No such thing as a feature matching itself
   * xx We already have DC so we don't need CD
   * ```
   * @param featureCount
   * @param optionCount
   * @param tiles
   * @param topOptionTiles
   * @private
   */
  private pushGridRows(featureCount: number, optionCount: number, tiles: Tile[], topOptionTiles: Tile[]) {
    const blankTiles: Array<Tile> = [];

    this.store.gridAxes().leftFeatureIds.forEach((featureId, blockIndex) => {
      const feature = this.store.featureById(featureId) as Feature;

      tiles.push({...LEFT_FEATURE_TILE, text: feature?.name, entityId: feature?.id, rows: optionCount});
      this.fillOptionRowsForFeature(feature, tiles, (featureCount - 1 - blockIndex) * optionCount, topOptionTiles, blankTiles, optionCount);
      blankTiles.push({...FILLER_BLANK_TILE, cols: optionCount, rows: optionCount});
    });
  }

  /**
   * Pushes one row per option of the given left feature: the option header, the cells, and the blanks on the right side that hold the grid shape.
   * @param feature
   * @param tiles
   * @param rowCellCount
   * @param topOptionTiles
   * @param blankTiles
   * @param optionCount
   * @private
   */
  private fillOptionRowsForFeature(feature: Feature, tiles: Tile[], rowCellCount: number, topOptionTiles: Tile[], blankTiles: Tile[], optionCount: number) {
    const lastOptionIndex = optionCount - 1;

    this.store.optionsByFeature(feature)?.forEach((leftOption, rowInFeature) => {
      const isLastRowInBlock = rowInFeature === lastOptionIndex;

      tiles.push({
        ...LEFT_OPTION_TILE,
        text: leftOption.name,
        entityId: leftOption.id,
        borders: this.joinBorders(LEFT_OPTION_TILE.borders, isLastRowInBlock && BOTTOM_BORDER)
      });

      for (let i = 0; i < rowCellCount; i++) {
        const cell = this.store.cellByOptions(leftOption.id, topOptionTiles[i]?.entityId as OptionId) as Cell;
        tiles.push({
          ...CELL_TILE,
          text: cell?.userValue || CellText.EMPTY,
          entityId: cell?.id,
          borders: this.joinBorders(i % optionCount === lastOptionIndex && RIGHT_BORDER, isLastRowInBlock && BOTTOM_BORDER)
        });
      }

      if (rowInFeature === 0) {
        tiles.push(...blankTiles, {...RIGHT_BLANK_TILE, rows: optionCount});
      }
    });
  }

  /**
   * Joins the border classes for a tile into a single string
   * @param borders
   * @private
   */
  private joinBorders = (...borders: Array<string | false | undefined>): string => borders.filter(Boolean).join(' ');
}
