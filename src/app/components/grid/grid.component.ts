import {Component, computed, inject} from '@angular/core';
import {TileService} from '../../services/tile.service';
import {FeatureComponent} from './feature/feature.component';
import {OptionComponent} from './option/option.component';
import {CellComponent} from './cell/cell.component';
import {CELL_SIZE, NON_CELL_COLUMN_COUNT} from '../../constants/grid.const';
import {BaseDirective} from '../../directives/base.directive';
import {MoveFnEnum} from '../../types/move.model';
import {UndoRedoService} from '../../services/undo-redo.service';
import {TranslatePipe} from '@ngx-translate/core';
import {REDO_KEY, UNDO_KEY} from '../../constants/keyboard.const';

/** Lays the tiles out on one CSS grid, sized to the current feature and option counts. */
@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.css',
  imports: [FeatureComponent, OptionComponent, CellComponent, TranslatePipe],
  host: {'(document:keydown)': 'onKeydown($event)'},
})
export class GridComponent extends BaseDirective {
  tileService: TileService = inject(TileService);
  undoRedoService: UndoRedoService = inject(UndoRedoService);

  /** A column per option of every feature after the first, plus the header and button columns. */
  columnCount = computed(() => this.store.optionCountPerFeature() * (this.store.featureCount() - 1) + NON_CELL_COLUMN_COUNT);

  protected readonly CELL_SIZE = CELL_SIZE;

  /**
   * Adds a feature with a full set of options, and records it as one move.
   */
  protected onClickAddFeature() {
    const moveArgs = this.storeService.addNewFeature();
    this.store.recordMove({moveFn: MoveFnEnum.ADD, moveArgs});
  }

  /**
   * Adds one option to every feature, and records it as one move.
   */
  protected onClickAddOption() {
    const moveArgs = this.storeService.addNewOptionToAllFeatures();
    this.store.recordMove({moveFn: MoveFnEnum.ADD, moveArgs});
  }

  /**
   * Undoes the last user move.
   */
  protected undo() {
    this.undoRedoService.undo();
  }

  /**
   * Makes the newest undone move again.
   */
  protected redo() {
    this.undoRedoService.redo();
  }

  /**
   * Walks the grid back on ctrl or cmd z, and forward on ctrl or cmd shift z or y.
   * Leaves the shortcut to the browser while a header is being typed in.
   * @param event
   */
  protected onKeydown(event: KeyboardEvent) {
    if (!(event.ctrlKey || event.metaKey) || event.target instanceof HTMLInputElement) return;

    const key = event.key.toLowerCase();

    if (key !== UNDO_KEY && key !== REDO_KEY) return;

    event.preventDefault();

    if (key === REDO_KEY || event.shiftKey) {
      this.redo();
    } else {
      this.undo();
    }
  }

  /**
   * Empties every cell, recording how they stood so the values can come back.
   */
  protected onClickClearCells() {
    this.store.recordMove({moveFn: MoveFnEnum.CLEAR, moveArgs: {oldCells: this.store.cells()}});
    this.storeService.clearCells();
  }
}
