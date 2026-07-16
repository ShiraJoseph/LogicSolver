import {Tile, TileType} from './tile.model';
import {Cell, Feature, Option} from './entities.model';

/**
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

export const CORNER_BLANK_TILE: Tile = {
  text: '',
  cols: 4,
  rows: 4,
  color: 'white',
  type: TileType.CORNER_BLANK
};

export const TOP_FEATURE_TILE = (feature: Feature, optionCount: number): Tile => ({
  text: feature.name,
  cols: optionCount,
  rows: 1,
  color: 'gray',
  type: TileType.TOP_FEATURE_HEADER,
  objectId2: feature.id2,
});

export const NEW_FEATURE_BUTTON_TILE: Tile = {
  text: '+',
  cols: 1,
  rows: 1,
  type: TileType.ADD_FEATURE
};

export const TOP_OPTION_TILE = (option: Option): Tile => ({
  text: option.name,
  cols: 1,
  rows: 3,
  color: 'lightgray',
  type: TileType.TOP_OPTION_HEADER,
  objectId2: option.id2,
});

export const NEW_OPTION_BUTTON_TILE: Tile = {
  text: '+',
  cols: 1,
  rows: 3,
  type: TileType.ADD_OPTION
};

export const LEFT_FEATURE_TILE = (feature: any, optionCount: number): Tile => ({
  text: feature.name,
  cols: 1,
  rows: optionCount,
  color: 'gray',
  type: TileType.LEFT_FEATURE_HEADER,
  objectId2: feature.id2,
});

export const LEFT_OPTION_TILE = (leftOption: Option): Tile => ({
  text: leftOption.name,
  cols: 3,
  rows: 1,
  color: 'lightgray',
  type: TileType.LEFT_OPTION_HEADER,
  objectId2: leftOption.id2,
});

export const CELL_TILE = (currCell: Cell): Tile => ({
  text: currCell?.value || '',
  cols: 1,
  rows: 1,
  color: 'white',
  type: TileType.CELL_INACTIVE,
  objectId2: currCell?.id2,
});

export const FILLER_BLANK_TILE = (optionCount: number): Tile => ({
  text: '',
  cols: optionCount,
  rows: optionCount,
  color: 'white',
  type: TileType.FILLER_BLANK,
});

export const RIGHT_BLANK_TILE = (optionCount: number): Tile => ({

  text: '',
  cols: 1,
  rows: optionCount,
  type: TileType.RIGHT_BLANK,
});
