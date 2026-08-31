import {inject, Service} from '@angular/core';
import {MoveArgs, MoveEntityEnum, MoveFnEnum} from '../types/move.model';
import {GridStore} from '../store/store';
import {CellText} from '../types/tile.model';
import {addEntities, removeEntities} from '@ngrx/signals/entities';
import {patchState} from '@ngrx/signals';
import {CELL_CONFIG, FEATURE_CONFIG, OPTION_CONFIG} from "../constants/store.const";
import {CellId} from '../types/entities.model';

/** Walks the grid back and forward through the moves the store recorded. */
@Service()
export class UndoRedoService {
  store = inject(GridStore);

  /**
   * Puts the grid back the way it stood before the newest move, and hands that move to the redo stack.
   */
  undo() {
    const move = this.store.popUndoMove();

    if (!move) return;

    switch (move.moveFn) {
      case MoveFnEnum.ADD:
        this.deleteMultipleEntities(move.moveArgs);
        break;
      case MoveFnEnum.DELETE:
        this.addMultipleEntities(move.moveArgs);
        break;
      case MoveFnEnum.UPDATE:
        this.updateSingleEntity(move.moveArgs, true);
        break;
      case MoveFnEnum.CLEAR:
        this.store.upsertCells(move.moveArgs.oldCells);
        this.store.setInvalidCellValues(move.moveArgs.oldInvalidCellValues);
        break;
      default:
        return;
    }
  }

  /**
   * Makes the newest undone move again, and hands it back to the undo stack.
   */
  redo() {
    const move = this.store.popRedoMove();

    if (!move) return;

    switch (move.moveFn) {
      case MoveFnEnum.ADD:
        this.addMultipleEntities(move.moveArgs);
        break;
      case MoveFnEnum.DELETE:
        this.deleteMultipleEntities(move.moveArgs);
        break;
      case MoveFnEnum.UPDATE:
        this.updateSingleEntity(move.moveArgs, false);
        break;
      case MoveFnEnum.CLEAR:
        this.store.updateAllCells({userValue: CellText.EMPTY});
        this.store.setInvalidCellValues(new Map());
        break;
      default:
        return;
    }
  }

  /**
   * Writes one of the two recorded values onto the cell, option or feature the move names.
   * @param moveArgs
   * @param isUndo whether to write the value from before the move rather than the one from after it
   */
  updateSingleEntity(moveArgs: MoveArgs<MoveFnEnum.UPDATE, MoveEntityEnum>, isUndo: boolean) {
    const value = isUndo ? moveArgs.oldValue : moveArgs.newValue;

    if ('cellId' in moveArgs) {
      this.store.updateCell(moveArgs.cellId, {userValue: value as CellText});
      this.store.setInvalidCellValue(moveArgs.cellId, isUndo ? moveArgs.oldInvalidValue : moveArgs.newInvalidValue);
      this.setNewlyValidCells(moveArgs.newlyValidCells, isUndo);
    } else if ('optionId' in moveArgs) {
      this.store.updateOption(moveArgs.optionId, {name: value});
    } else {
      this.store.updateFeature(moveArgs.featureId, {name: value});
    }
  }

  /**
   * Holds the values the move put back aside again, or puts them back on the grid a second time.
   * @param newlyValidCells
   * @param isUndo whether to hold the values aside rather than put them back on the grid
   * @private
   */
  private setNewlyValidCells(newlyValidCells: Map<CellId, CellText>, isUndo: boolean) {
    newlyValidCells.forEach((newlyValidValue, cellId) => {
      this.store.updateCell(cellId, {userValue: isUndo ? CellText.EMPTY : newlyValidValue});
      this.store.setInvalidCellValue(cellId, isUndo ? newlyValidValue : CellText.EMPTY);
    });
  }

  /**
   * Puts the recorded entities back on the grid, each in the slot it came from.
   * @param moveArgs
   */
  addMultipleEntities(moveArgs: MoveArgs<MoveFnEnum.ADD>) {
    const {features, options, cells, optionCountPerFeature, featureIndex, optionIndex} = moveArgs;
    const adds = [
      ...features ? [addEntities(features, FEATURE_CONFIG)] : [],
      ...options ? [addEntities(options, OPTION_CONFIG)] : [],
      ...cells ? [addEntities(cells, CELL_CONFIG)] : [],
      ...optionCountPerFeature != undefined ? [{optionCountPerFeature}] : []
    ];

    patchState(this.store, ...adds);

    if (featureIndex != null && features?.[0]) {
      this.store.moveFeatureToIndex(features[0], featureIndex);
    }
    if (optionIndex != null) {
      options?.forEach(option => {
        this.store.moveFeatureOptionToIndex(option, optionIndex);
      });
    }
  }

  /**
   * Takes the recorded entities off the grid, leaving the option count as it stands without them.
   * @param moveArgs
   */
  deleteMultipleEntities(moveArgs: MoveArgs<MoveFnEnum.DELETE>) {
    const deletes = [
      ...moveArgs.features ? [removeEntities(moveArgs.features.map(feature => feature.id), FEATURE_CONFIG)] : [],
      ...moveArgs.options ? [removeEntities(moveArgs.options.map(option => option.id), OPTION_CONFIG)] : [],
      ...moveArgs.cells ? [removeEntities(moveArgs.cells.map(cell => cell.id), CELL_CONFIG)] : [],
      ...moveArgs.optionCountPerFeature != undefined ? [{optionCountPerFeature: moveArgs.optionCountPerFeature - 1}] : []
    ];

    patchState(this.store, ...deletes);
  }
}
