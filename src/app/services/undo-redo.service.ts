import {inject, Service} from '@angular/core';
import {MoveArgs, MoveEntityEnum, MoveFnEnum} from '../types/move.model';
import {GridStore} from '../store/store';
import {CellText} from '../types/tile.model';
import {addEntities, removeEntities} from '@ngrx/signals/entities';
import {CELL_CONFIG, FEATURE_CONFIG, OPTION_CONFIG} from '../store/entity-config';
import {patchState} from '@ngrx/signals';

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
        this.deleteMultiple(move.moveArgs);
        break;
      case MoveFnEnum.DELETE:
        this.addMultiple(move.moveArgs);
        break;
      case MoveFnEnum.UPDATE:
        this.updateSingle(move.moveArgs, true);
        break;
      case MoveFnEnum.CLEAR:
        this.store.upsertCells(move.moveArgs.oldCells);
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
        this.addMultiple(move.moveArgs);
        break;
      case MoveFnEnum.DELETE:
        this.deleteMultiple(move.moveArgs);
        break;
      case MoveFnEnum.UPDATE:
        this.updateSingle(move.moveArgs, false);
        break;
      case MoveFnEnum.CLEAR:
        this.store.updateAllCells({userValue: CellText.EMPTY});
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
  updateSingle(moveArgs: MoveArgs<MoveFnEnum.UPDATE, MoveEntityEnum>, isUndo: boolean) {
    const value = isUndo ? moveArgs.oldValue : moveArgs.newValue;
    if ('cellId' in moveArgs) {
      this.store.updateCell(moveArgs.cellId, {userValue: value as CellText});
    } else if ('optionId' in moveArgs) {
      this.store.updateOption(moveArgs.optionId, {name: value});
    } else {
      this.store.updateFeature(moveArgs.featureId, {name: value});
    }
  }

  /**
   * Puts the recorded entities back on the grid, each in the slot it came from.
   * @param moveArgs
   */
  addMultiple(moveArgs: MoveArgs<MoveFnEnum.ADD>) {
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
  deleteMultiple(moveArgs: MoveArgs<MoveFnEnum.DELETE>) {
    const deletes = [
      ...moveArgs.features ? [removeEntities(moveArgs.features.map(feature => feature.id), FEATURE_CONFIG)] : [],
      ...moveArgs.options ? [removeEntities(moveArgs.options.map(option => option.id), OPTION_CONFIG)] : [],
      ...moveArgs.cells ? [removeEntities(moveArgs.cells.map(cell => cell.id), CELL_CONFIG)] : [],
      ...moveArgs.optionCountPerFeature != undefined ? [{optionCountPerFeature: moveArgs.optionCountPerFeature - 1}] : []
    ];

    patchState(this.store, ...deletes);
  }
}
