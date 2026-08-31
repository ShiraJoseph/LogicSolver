import {CellText} from '../types/tile.model';

export const NON_CELL_COLUMN_COUNT = 5;
export const CELL_SIZE = '60px';
export const TOP_BORDER = 'top-border';
export const RIGHT_BORDER = 'right-border';
export const BOTTOM_BORDER = 'bottom-border';
export const LEFT_BORDER = 'left-border';
export const MIN_FEATURE_COUNT = 2;
export const MIN_OPTION_COUNT = 2;
/** The value one click moves a cell on to, from the value it shows now */
export const NEXT_CELL_TEXT: Record<CellText, CellText> = {
  [CellText.EMPTY]: CellText.X,
  [CellText.X]: CellText.O,
  [CellText.O]: CellText.EMPTY
};
