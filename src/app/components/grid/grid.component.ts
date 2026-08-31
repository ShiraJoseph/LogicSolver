import {Component, ElementRef, inject} from '@angular/core';
import {TileService} from '../../services/tile.service';
import {FeatureComponent} from './feature/feature.component';
import {OptionComponent} from './option/option.component';
import {CellComponent} from './cell/cell.component';
import {CELL_SIZE} from '../../constants/grid.const';
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
  tileService = inject(TileService);
  undoRedoService = inject(UndoRedoService);
  element = inject(ElementRef<HTMLElement>);

  protected readonly CELL_SIZE = CELL_SIZE;

  /**
   * Sends Tab off the last header on into the grid cells, and Tab off a cell on to the buttons below the grid,
   * so the one cell Tab reaches sits after every header rather than in the row it belongs to. Leaving the cells
   * lets go of the selected one.
   * @param event
   */
  protected onTabForward(event: Event) {
    if (this.isCell(event.target)) {
      this.moveFocus(event, this.gridButton());
      this.store.setSelectedCellId(undefined);
    } else if (event.target === this.headerInputs().at(-1)) {
      this.moveFocus(event, this.cellTabStop());
    }
  }

  /**
   * Sends Shift Tab off a cell back to the last header, letting go of the selected cell.
   * @param event
   */
  protected onTabBack(event: Event) {
    if (this.isCell(event.target)) {
      this.moveFocus(event, this.headerInputs().at(-1));
      this.store.setSelectedCellId(undefined);
    }
  }

  /**
   * Sends Shift Tab off the first button below the grid back into the cells.
   * @param event
   */
  protected onTabBackIntoGrid(event: Event) {
    if (event.target !== this.gridButton()) return;

    this.moveFocus(event, this.cellTabStop());
  }

  /**
   * Puts the keyboard on the element and holds the browser's own Tab, leaving it alone when there is no element
   * to move to.
   * @param event
   * @param element
   * @private
   */
  private moveFocus(event: Event, element?: HTMLElement | null) {
    if (!element) return;

    event.preventDefault();
    element.focus();
  }

  /**
   * Whether the keyboard is on one of the grid's cells.
   * @param target
   * @private
   */
  private isCell(target: EventTarget | null) {
    return target instanceof HTMLElement && target.classList.contains('cell');
  }

  /**
   * Every header name field, in the order they run through the grid.
   * @private
   */
  private headerInputs() {
    return [...this.element.nativeElement.querySelectorAll('.grid input')] as Array<HTMLInputElement>;
  }

  /**
   * The one cell Tab reaches: the selected cell, or the first one while none is selected.
   * @private
   */
  private cellTabStop() {
    return this.element.nativeElement.querySelector('.cell.tab-stop') as HTMLButtonElement | null;
  }

  /**
   * The first button below the grid the keyboard can reach.
   * @private
   */
  private gridButton() {
    return this.element.nativeElement.querySelector('.grid-buttons button:not(:disabled)') as HTMLButtonElement | null;
  }

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
    this.store.recordMove({
      moveFn: MoveFnEnum.CLEAR,
      moveArgs: {oldCells: this.store.cells(), oldInvalidCellValues: this.store.invalidCellValues()}
    });
    this.storeService.clearCells();
  }
}
