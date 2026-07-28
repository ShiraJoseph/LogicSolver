import {CellId} from "./entities.model";

export interface DataState {
  optionCountPerFeature: number;
  selectedCellId?: CellId;
}

export const initialState: DataState = {
  optionCountPerFeature: 0,
  selectedCellId: undefined,
};
