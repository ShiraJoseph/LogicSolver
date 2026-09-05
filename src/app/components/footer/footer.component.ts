import {Component, computed, ElementRef, inject} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseDirective} from '../../directives/base.directive';
import {UndoRedoService} from '../../services/undo-redo.service';
import {BruteForceService} from '../../services/brute-force.service';
import {MoveFnEnum} from '../../types/move.model';
import {SOLUTION_LIMIT} from '../../constants/grid.const';

/** The bar below the grid, holding undo, redo, brute force, clear cells and the invalid grid tag. */
@Component({
  selector: 'app-footer',
  imports: [TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent extends BaseDirective {
  undoRedoService = inject(UndoRedoService);
  bruteForceService = inject(BruteForceService);
  element = inject(ElementRef<HTMLElement>);

  /** The translation key for the brute force button, replaced by a solution count when a run finds any number but one */
  protected bruteForceLabel = computed(() => {
    const solutionCount = this.store.solutionCount();

    if (solutionCount == undefined) return 'footer.bruteForce';

    return solutionCount > SOLUTION_LIMIT ? 'footer.moreThanMaxSolutions' : 'footer.solutionCount';
  });

  protected readonly SOLUTION_LIMIT = SOLUTION_LIMIT;

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
   * Runs the solver, which fills the grid in when it finds exactly one solution and otherwise puts the number
   * of solutions it found on the button.
   */
  protected onClickBruteForce() {
    this.bruteForceService.solve();
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
