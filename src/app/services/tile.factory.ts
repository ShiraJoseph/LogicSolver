import {CellText, Tile, TileType} from '../types/tile.model';
import {Cell, Feature, Option} from '../types/entities.model';
import {FEATURE_COLORS} from '../types/constants';

/**
 * A set of tile factories for each tile type.
 *
 * The following diagram indicates where each tile type would go in the grid if the grid had three features with two options each.
 *
 * Legend:
 *   NF = NEW_FEATURE_BUTTON_TILE
 *   NO = NEW_OPTION_BUTTON_TILE
 *   RB = RIGHT_BLANK_TILE
 *   ┄ = no border in the UI but the tile ends there
 *
 *  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄╔═══════════════════════╦═══════════════════════╦═══════╗
 * ┆                             ║   TOP_FEATURE_TILE    ║   TOP_FEATURE_TILE    ║  NF   ║
 * ┆                             ╠═══════════╦═══════════╬═══════════╦═══════════╬═══════╣
 * ┆      CORNER_BLANK_TILE      ║   TOP_    ║   TOP_    ║   TOP_    ║   TOP_    ║       ║
 * ┆                             ║  OPTION_  ║  OPTION_  ║  OPTION_  ║  OPTION_  ║  NO   ║
 * ┆                             ║   TILE    ║   TILE    ║   TILE    ║   TILE    ║       ║
 * ╔══════════╦══════════════════╬═══════════╬═══════════╬═══════════╬═══════════╬═══════╝
 * ║  LEFT_   ║ LEFT_OPTION_TILE ║ CELL_TILE ║ CELL_TILE ║ CELL_TILE ║ CELL_TILE ║       ┆
 * ║ FEATURE_ ╠══════════════════╬═══════════╬═══════════╬═══════════╬═══════════╣  RB   ┆
 * ║   TILE   ║ LEFT_OPTION_TILE ║ CELL_TILE ║ CELL_TILE ║ CELL_TILE ║ CELL_TILE ║       ┆
 * ╠══════════╬══════════════════╬═══════════╬═══════════╬═══════════╩═══════════╝┄┄┄┄┄┄┄
 * ║  LEFT_   ║ LEFT_OPTION_TILE ║ CELL_TILE ║ CELL_TILE ║                       ┆       ┆
 * ║ FEATURE_ ╠══════════════════╬═══════════╬═══════════╣   FILLER_BLANK_TILE   ┆  RB   ┆
 * ║   TILE   ║ LEFT_OPTION_TILE ║ CELL_TILE ║ CELL_TILE ║                       ┆       ┆
 * ╚══════════╩══════════════════╩═══════════╩═══════════╝┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ┄┄┄┄┄┄┄
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
 */

export const createCornerBlankTile = (): Tile => ({
  text: CellText.EMPTY,
  cols: 4,
  rows: 4,
  backgroundColor: 'white',
  type: TileType.CORNER_BLANK
});

export const createTopFeatureTile = (feature: Feature, optionCount: number, position: number): Tile => ({
  text: feature.name,
  cols: optionCount,
  rows: 1,
  backgroundColor: featureColor(position),
  textColor: featureTextColor(position),
  type: TileType.TOP_FEATURE_HEADER,
  entityId: feature.id,
});

export const createAddFeatureButtonTile = (): Tile => ({
  text: '+',
  cols: 1,
  rows: 1,
  backgroundColor: 'white',
  type: TileType.ADD_FEATURE
});

export const createTopOptionTile = (option: Option): Tile => ({
  text: option.name,
  cols: 1,
  rows: 3,
  backgroundColor: 'lightgray',
  type: TileType.TOP_OPTION_HEADER,
  entityId: option.id,
});

export const createAddOptionButtonTile = (): Tile => ({
  text: '+',
  cols: 1,
  rows: 3,
  backgroundColor: 'white',
  type: TileType.ADD_OPTION
});

export const createLeftFeatureTile = (feature: Feature, optionCount: number, position: number): Tile => ({
  text: feature.name,
  cols: 1,
  rows: optionCount,
  backgroundColor: featureColor(position),
  textColor: featureTextColor(position),
  type: TileType.LEFT_FEATURE_HEADER,
  entityId: feature.id,
});

export const createLeftOptionTile = (leftOption: Option): Tile => ({
  text: leftOption.name,
  cols: 3,
  rows: 1,
  backgroundColor: 'lightgray',
  type: TileType.LEFT_OPTION_HEADER,
  entityId: leftOption.id,
});

export const createCellTile = (currCell: Cell): Tile => ({
  text: currCell?.userValue || CellText.EMPTY,
  cols: 1,
  rows: 1,
  backgroundColor: 'white',
  type: TileType.CELL,
  entityId: currCell?.id,
});

export const createFillerBlankTile = (optionCount: number): Tile => ({
  text: CellText.EMPTY,
  cols: optionCount,
  rows: optionCount,
  backgroundColor: 'white',
  type: TileType.FILLER_BLANK,
});

export const createRightBlankTile = (optionCount: number): Tile => ({
  text: CellText.EMPTY,
  cols: 1,
  rows: optionCount,
  type: TileType.RIGHT_BLANK,
});

// Color helpers

const featureColor = (position: number): string => FEATURE_COLORS[position % FEATURE_COLORS.length].background;

const featureTextColor = (position: number): string => FEATURE_COLORS[position % FEATURE_COLORS.length].text;
