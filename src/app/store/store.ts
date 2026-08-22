import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {removeAllEntities, setAllEntities, withEntities} from '@ngrx/signals/entities';
import {withDevtools} from '@angular-architects/ngrx-toolkit';
import {CellId} from '../types/entities.model';
import {withEntityAccessors, withEntityRelationship, withTransitiveRelationship} from 'signalkin';
import {GridState, initialState} from '../types/state.model';
import {cellConfig, featureConfig, optionConfig} from './entityConfig';
import {NON_CELL_COLUMN_COUNT} from '../constants/grid.const';

/** Holds the features, options and cells of the grid, and the relationships between them. */
export const GridStore = signalStore(
  {providedIn: 'root', protectedState: false},
  withState<GridState>(initialState),
  withEntities(featureConfig),
  withEntities(optionConfig),
  withEntities(cellConfig),
  withEntityAccessors(featureConfig, optionConfig, cellConfig),
  withEntityRelationship({...featureConfig, count: 1}, {...optionConfig, count: 'many'}),
  withEntityRelationship({...optionConfig, count: 2}, {...cellConfig, count: 'many'}),
  withTransitiveRelationship({from: 'feature', to: 'cell', through: 'option'}),
  withMethods((store) => ({
    setOptionCountPerFeature: (optionCountPerFeature: number) => {
      patchState(store, {optionCountPerFeature});
    },
    setSelectedCellId: (selectedCellId: CellId | undefined) => {
      patchState(store, {selectedCellId});
    },
    takeSnapshot: () => {
      const {features, options, cells, optionCountPerFeature} = store;
      patchState(store, {redoStack: [], undoStack: [...store.undoStack(), {features: features(), options: options(), cells: cells(), optionCountPerFeature: optionCountPerFeature()}]});
    },
    undo: () => {
      const undoState = store.undoStack()[store.undoStack().length - 1];
      if (undoState) {
        patchState(store,
          {
            redoStack: [...store.redoStack(), undoState],
            undoStack: store.undoStack().slice(0, -1)
          },
          removeAllEntities(cellConfig),
          removeAllEntities(optionConfig),
          setAllEntities(undoState.features, featureConfig),
          {optionCountPerFeature: undoState.optionCountPerFeature},
          setAllEntities(undoState.options, optionConfig),
          setAllEntities(undoState.cells, cellConfig)
        );
      }
    },
    redo: () => {
      const redoState = store.redoStack()[store.redoStack().length - 1];
      if (redoState) {
        patchState(store,
          {
            undoStack: [...store.undoStack(), redoState],
            redoStack: store.redoStack().slice(0, -1)
          },
          removeAllEntities(cellConfig),
          removeAllEntities(optionConfig),
          setAllEntities(redoState.features, featureConfig),
          {optionCountPerFeature: redoState.optionCountPerFeature},
          setAllEntities(redoState.options, optionConfig),
          setAllEntities(redoState.cells, cellConfig)
        );
      }
    }
  })),
  withComputed(store => ({
    /** Each feature id mapped to the order its feature appears in. */
    featurePositions: () => {
      const positionMap = new Map();
      store.featureIds().forEach((id, index) => {
        if (id && index != undefined) {
          positionMap.set(id, index);
        }
      });
      return positionMap;
    },
    /** A column per option of every feature after the first, plus the header and button columns. */
    columnCount: () => store.optionCountPerFeature() * (store.featureCount() - 1) + NON_CELL_COLUMN_COUNT,
    canUndo: () => store.undoStack().length > 0,
    canRedo: () => store.redoStack().length > 0,
  })),
  withDevtools('logicSolver')
);
