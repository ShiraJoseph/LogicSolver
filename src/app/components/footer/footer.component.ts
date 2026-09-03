import {Component, ElementRef, inject} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseDirective} from '../../directives/base.directive';
import {UndoRedoService} from '../../services/undo-redo.service';
import {MoveFnEnum} from '../../types/move.model';

/** The bar below the grid, holding undo, redo, clear cells and the invalid grid tag. */
@Component({
  selector: 'app-footer',
  imports: [TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent extends BaseDirective {
  undoRedoService = inject(UndoRedoService);
  element = inject(ElementRef<HTMLElement>);

  /**
   * The first button the keyboard can reach.
   */
  firstButton() {
    return this.element.nativeElement.querySelector('button:not(:disabled)') as HTMLButtonElement | null;
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
