import {EntityId} from '@ngrx/signals/entities';

/** One square of the grid, ready to render. */
export interface Tile {
  /** The border classes this tile draws, space separated. */
  borders?: string;
  cols: number;
  rows: number;
  text: string;
  type?: TileType;
  /** The feature, option or cell this tile stands for, if it stands for one. */
  entityId?: EntityId;
}

export enum TileType {
  CELL = 'CELL',
  TOP_FEATURE_HEADER = 'TOP_FEATURE_HEADER',
  TOP_OPTION_HEADER = 'TOP_OPTION_HEADER',
  LEFT_FEATURE_HEADER = 'LEFT_FEATURE_HEADER',
  LEFT_OPTION_HEADER = 'LEFT_OPTION_HEADER',
  ADD_FEATURE = 'ADD_FEATURE',
  ADD_OPTION = 'ADD_OPTION',
  CORNER_BLANK = 'CORNER_BLANK',
  RIGHT_BLANK = 'RIGHT_BLANK',
  FILLER_BLANK = 'FILLER_BLANK',
}

/** The four tile types that render an editable header label. */
export const HEADER_TILE_TYPES = new Set([
  TileType.TOP_FEATURE_HEADER,
  TileType.TOP_OPTION_HEADER,
  TileType.LEFT_FEATURE_HEADER,
  TileType.LEFT_OPTION_HEADER,
]);

export enum CellText {
  X = 'X',
  O = 'O',
  EMPTY = ''
}
