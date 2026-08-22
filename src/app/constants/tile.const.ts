import {CellText, Tile, TileType} from '../types/tile.model';
import {BOTTOM_BORDER, LEFT_BORDER, RIGHT_BORDER, TOP_BORDER} from './grid.const';

/** First tile in the grid */
export const CORNER_BLANK_TILE: Tile = {
  borders: `${RIGHT_BORDER} ${BOTTOM_BORDER}`,
  text: CellText.EMPTY,
  cols: 4,
  rows: 4,
  type: TileType.CORNER_BLANK
};

/** Last tile in the first row of the grid, next to the top features */
export const NEW_FEATURE_BUTTON_TILE: Tile = {
  borders: `${TOP_BORDER} ${RIGHT_BORDER} ${BOTTOM_BORDER}`,
  text: '+',
  cols: 1,
  rows: 1,
  type: TileType.ADD_FEATURE
};

/** Last tile in the second row of the grid, next to the top options */
export const NEW_OPTION_BUTTON_TILE: Tile = {
  borders: `${RIGHT_BORDER} ${BOTTOM_BORDER}`,
  text: '+',
  cols: 1,
  rows: 3,
  type: TileType.ADD_OPTION
};

/** Horizontal tiles at the top of the grid */
export const TOP_FEATURE_TILE: Tile = {
  borders: `${TOP_BORDER} ${RIGHT_BORDER} ${BOTTOM_BORDER}`,
  text: CellText.EMPTY,
  cols: 1,
  rows: 1,
  type: TileType.TOP_FEATURE_HEADER
};

/** Vertical tiles in the second row of the grid */
export const TOP_OPTION_TILE: Tile = {
  borders: BOTTOM_BORDER,
  text: CellText.EMPTY,
  cols: 1,
  rows: 3,
  type: TileType.TOP_OPTION_HEADER
};

/** Vertical tiles going down the first column in the grid */
export const LEFT_FEATURE_TILE: Tile = {
  borders: `${LEFT_BORDER} ${RIGHT_BORDER} ${BOTTOM_BORDER}`,
  text: CellText.EMPTY,
  cols: 1,
  rows: 1,
  type: TileType.LEFT_FEATURE_HEADER
};

/** Horizontal tiles in the second column of the grid */
export const LEFT_OPTION_TILE: Tile = {
  borders: RIGHT_BORDER,
  text: CellText.EMPTY,
  cols: 3,
  rows: 1,
  type: TileType.LEFT_OPTION_HEADER
};

/** All the tiles that can have an X or an O in them */
export const CELL_TILE: Tile = {
  text: CellText.EMPTY,
  cols: 1,
  rows: 1,
  type: TileType.CELL
};

/** Blank space for Feature A at Feature B where we already filled out cells for Feature B at Feature A or for where a feature crosses itself */
export const FILLER_BLANK_TILE: Tile = {
  text: CellText.EMPTY,
  cols: 1,
  rows: 1,
  type: TileType.FILLER_BLANK
};

/** Column of blank tiles going down the rightmost side of the grid to fill out the space below the add feature/option buttons */
export const RIGHT_BLANK_TILE: Tile = {
  text: CellText.EMPTY,
  cols: 1,
  rows: 1,
  type: TileType.RIGHT_BLANK
};
