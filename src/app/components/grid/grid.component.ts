import {Component, computed, inject} from '@angular/core';
import {TileService} from '../../services/tile.service';
import {HeaderComponent} from './header/header.component';
import {CellComponent} from './cell/cell.component';
import {CELL_SIZE, NON_CELL_COLUMN_COUNT} from '../../constants/grid.const';
import {BaseDirective} from '../../directives/base.directive';
import {MoveFnEnum} from '../../types/move.model';
import {UndoRedoService} from '../../services/undo-redo.service';

/** Lays the tiles out on one CSS grid, sized to the current feature and option counts. */
@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.css',
  imports: [HeaderComponent, CellComponent],
  host: {'(document:keydown)': 'onKeydown($event)'},
})
export class GridComponent extends BaseDirective {
  tileService: TileService = inject(TileService);
  undoRedoService: UndoRedoService = inject(UndoRedoService);

  /** A column per option of every feature after the first, plus the header and button columns. */
  columnCount = computed(() => this.store.optionCountPerFeature() * (this.store.featureCount() - 1) + NON_CELL_COLUMN_COUNT);

  protected readonly CELL_SIZE = CELL_SIZE;

  /** Adds a feature with a full set of options, and records it as one move. */
  protected onClickAddFeature() {
    const moveArgs = this.storeService.addNewFeature();
    this.store.recordMove({moveFn: MoveFnEnum.ADD, moveArgs});
  }

  /** Adds one option to every feature, and records it as one move. */
  protected onClickAddOption() {
    const moveArgs = this.storeService.addNewOptionToAllFeatures();
    this.store.recordMove({moveFn: MoveFnEnum.ADD, moveArgs});
  }

  /** Walks the grid back one move. */
  protected undo(){
    this.undoRedoService.undo();
  }

  /** Makes the newest undone move again. */
  protected redo(){
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

    if (key !== 'z' && key !== 'y') return;

    event.preventDefault();

    if (key === 'y' || event.shiftKey) {
      this.redo();
    } else {
      this.undo();
    }
  }

  /** Empties every cell, recording how they stood so the values can come back. */
  protected onClickClearCells() {
    this.store.recordMove({moveFn: MoveFnEnum.CLEAR, moveArgs: {oldCells: this.store.cells()}});
    this.storeService.clearCells();
  }
}
