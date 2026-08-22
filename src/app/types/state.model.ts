import {CellId} from './entities.model';

/** The grid state that belongs to no single entity. */
export interface GridState {
  optionCountPerFeature: number;
  selectedCellId?: CellId;
}

export const initialState: GridState = {
  optionCountPerFeature: 0,
  selectedCellId: undefined,
};
