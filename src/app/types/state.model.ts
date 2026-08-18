import {CellId} from './entities.model';

export interface GridState {
  optionCountPerFeature: number;
  selectedCellId?: CellId;
}

export const initialState: GridState = {
  optionCountPerFeature: 0,
  selectedCellId: undefined,
};
