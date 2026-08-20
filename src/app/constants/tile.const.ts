import {CellText, Tile, TileType} from '../types/tile.model';
import {BOTTOM_BORDER, LEFT_BORDER, RIGHT_BORDER, TOP_BORDER} from './grid.const';

/**
 * The starting shape of every tile type. A tile that stands for an entity is spread and
 * given its own text, entityId, and span where it is pushed onto the grid.
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
 *
 */

export const CORNER_BLANK_TILE: Tile = {
  borders: `${RIGHT_BORDER} ${BOTTOM_BORDER}`,
  text: CellText.EMPTY,
  cols: 4,
  rows: 4,
  type: TileType.CORNER_BLANK
};

export const NEW_FEATURE_BUTTON_TILE: Tile = {
  borders: `${TOP_BORDER} ${RIGHT_BORDER} ${BOTTOM_BORDER}`,
  text: '+',
  cols: 1,
  rows: 1,
  type: TileType.ADD_FEATURE
};

export const NEW_OPTION_BUTTON_TILE: Tile = {
  borders: `${RIGHT_BORDER} ${BOTTOM_BORDER}`,
  text: '+',
  cols: 1,
  rows: 3,
  type: TileType.ADD_OPTION
};

export const TOP_FEATURE_TILE: Tile = {
  borders: `${TOP_BORDER} ${RIGHT_BORDER} ${BOTTOM_BORDER}`,
  text: CellText.EMPTY,
  cols: 1,
  rows: 1,
  type: TileType.TOP_FEATURE_HEADER
};

export const TOP_OPTION_TILE: Tile = {
  borders: BOTTOM_BORDER,
  text: CellText.EMPTY,
  cols: 1,
  rows: 3,
  type: TileType.TOP_OPTION_HEADER
};

export const LEFT_FEATURE_TILE: Tile = {
  borders: `${LEFT_BORDER} ${RIGHT_BORDER} ${BOTTOM_BORDER}`,
  text: CellText.EMPTY,
  cols: 1,
  rows: 1,
  type: TileType.LEFT_FEATURE_HEADER
};

export const LEFT_OPTION_TILE: Tile = {
  borders: RIGHT_BORDER,
  text: CellText.EMPTY,
  cols: 3,
  rows: 1,
  type: TileType.LEFT_OPTION_HEADER
};

export const CELL_TILE: Tile = {
  text: CellText.EMPTY,
  cols: 1,
  rows: 1,
  type: TileType.CELL
};

export const FILLER_BLANK_TILE: Tile = {
  text: CellText.EMPTY,
  cols: 1,
  rows: 1,
  type: TileType.FILLER_BLANK
};

export const RIGHT_BLANK_TILE: Tile = {
  text: CellText.EMPTY,
  cols: 1,
  rows: 1,
  type: TileType.RIGHT_BLANK
};
