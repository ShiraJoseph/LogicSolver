import { EntityId } from '@ngrx/signals/entities';

export interface Tile {
  backgroundColor?: string;
  textColor?: string;
  cols: number;
  rows: number;
  text: string;
  type?: TileType;
  objectId?: number;
  objectId2?: EntityId;
  shouldShowMinus?: boolean;
}

export enum TileType {
  CELL = 'CELL',
  CELL_ACTIVE = 'CELL_ACTIVE',
  CELL_INACTIVE = 'CELL_INACTIVE',
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

export enum CellText {
  X = 'X',
  O = 'O',
  EMPTY = ''
}

export const CELL_SIZE = '60px';
