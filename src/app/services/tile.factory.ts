import {Tile, TileType} from '../types/tile.model';
import {Cell, Feature, Option} from '../types/entities.model';

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

/**
 * Feature header backgrounds paired with their label text color, applied in
 * the order features appear on the grid. Wraps when there are more features
 * than colors.
 */
export const FEATURE_COLORS = [
  {background: '#7733FF', text: 'white'},
  {background: '#FF3377', text: 'white'},
  {background: '#3377FF', text: 'white'},
  {background: '#33FF77', text: 'black'},
  {background: '#FF7733', text: 'black'},
  {background: '#77FF33', text: 'black'},
  {background: '#BB33FF', text: 'white'},
  {background: '#FF33BB', text: 'black'},
  {background: '#33BBFF', text: 'black'},
  {background: '#33FFBB', text: 'black'},
  {background: '#FFBB33', text: 'black'},
  {background: '#BBFF33', text: 'black'},
  {background: '#7733BB', text: 'white'},
  {background: '#BB3377', text: 'white'},
  {background: '#3377BB', text: 'white'},
  {background: '#33BB77', text: 'white'},
  {background: '#BB7733', text: 'white'},
  {background: '#77BB33', text: 'black'},
];

export const featureColor = (position: number): string => FEATURE_COLORS[position % FEATURE_COLORS.length].background;

export const featureTextColor = (position: number): string => FEATURE_COLORS[position % FEATURE_COLORS.length].text;

export const CORNER_BLANK_TILE: Tile = {
  text: '',
  cols: 4,
  rows: 4,
  backgroundColor: 'white',
  type: TileType.CORNER_BLANK
};

export const TOP_FEATURE_TILE = (feature: Feature, optionCount: number, position: number): Tile => ({
  text: feature.name,
  cols: optionCount,
  rows: 1,
  backgroundColor: featureColor(position),
  textColor: featureTextColor(position),
  type: TileType.TOP_FEATURE_HEADER,
  objectId2: feature.id2,
});

export const NEW_FEATURE_BUTTON_TILE: Tile = {
  text: '+',
  cols: 1,
  rows: 1,
  backgroundColor: 'white',
  type: TileType.ADD_FEATURE
};

export const TOP_OPTION_TILE = (option: Option): Tile => ({
  text: option.name,
  cols: 1,
  rows: 3,
  backgroundColor: 'lightgray',
  type: TileType.TOP_OPTION_HEADER,
  objectId2: option.id2,
});

export const NEW_OPTION_BUTTON_TILE: Tile = {
  text: '+',
  cols: 1,
  rows: 3,
  backgroundColor: 'white',
  type: TileType.ADD_OPTION
};

export const LEFT_FEATURE_TILE = (feature: any, optionCount: number, position: number): Tile => ({
  text: feature.name,
  cols: 1,
  rows: optionCount,
  backgroundColor: featureColor(position),
  textColor: featureTextColor(position),
  type: TileType.LEFT_FEATURE_HEADER,
  objectId2: feature.id2,
});

export const LEFT_OPTION_TILE = (leftOption: Option): Tile => ({
  text: leftOption.name,
  cols: 3,
  rows: 1,
  backgroundColor: 'lightgray',
  type: TileType.LEFT_OPTION_HEADER,
  objectId2: leftOption.id2,
});

export const CELL_TILE = (currCell: Cell): Tile => ({
  text: currCell?.value2 || '',
  cols: 1,
  rows: 1,
  backgroundColor: 'white',
  type: TileType.CELL,
  objectId2: currCell?.id2,
});

export const FILLER_BLANK_TILE = (optionCount: number): Tile => ({
  text: '',
  cols: optionCount,
  rows: optionCount,
  backgroundColor: 'white',
  type: TileType.FILLER_BLANK,
});

export const RIGHT_BLANK_TILE = (optionCount: number): Tile => ({
  text: '',
  cols: 1,
  rows: optionCount,
  type: TileType.RIGHT_BLANK,
});
