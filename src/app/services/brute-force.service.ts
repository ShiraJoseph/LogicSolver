import {inject, Service} from '@angular/core';
import {GridStore} from '../store/store';
import {StoreService} from './store.service';
import {LogicService} from './logic.service';
import {UndoRedoService} from './undo-redo.service';
import {CellId} from '../types/entities.model';
import {CellText} from '../types/tile.model';
import {MoveFnEnum} from '../types/move.model';
import {SOLUTION_LIMIT, SOLVER_VALUES, SOLUTIONS_SOUGHT} from '../constants/grid.const';

/** The value the solver chose for each cell it guessed, keyed by cell id. */
type SolvedCells = Map<CellId, CellText>;

/** Solves the grid by trying an X and an O in every cell the deduction rules leave empty. */
@Service()
export class BruteForceService {
  store = inject(GridStore);
  storeService = inject(StoreService);
  logicService = inject(LogicService);
  undoRedoService = inject(UndoRedoService);

  /**
   * Fills in every empty cell when the grid has exactly one solution.
   * Any other number of solutions leaves the cells as the user left them and stores that number in
   * `solutionCount` instead. A grid the deduction rules already complete needs no guesses, so nothing is
   * filled in. The filled-in values are recorded as a single move, so one undo removes all of them.
   */
  solve() {
    const rootMoveCount = this.store.undoStack().length;
    const solutions: Array<SolvedCells> = [];

    this.search(new Map(), solutions);
    this.rollBackTo(rootMoveCount);

    if (solutions.length !== SOLUTIONS_SOUGHT) {
      this.store.clearRedoStack();
      this.store.setSolutionCount(solutions.length);

      return;
    }

    if (solutions[0].size) {
      this.applySolution(solutions[0]);
    }
  }

  /**
   * Tries an X and then an O in the first empty cell, and calls itself again to guess the next empty cell.
   * Undoes each guess before trying the next value, so the grid ends up as this call found it.
   * Returns true once the search has found more solutions than SOLUTION_LIMIT, which stops the search.
   * @param placedCells
   * @param solutions
   * @private
   */
  private search(placedCells: SolvedCells, solutions: Array<SolvedCells>): boolean {
    const openCellId = this.openCellId();

    if (!openCellId) {
      solutions.push(new Map(placedCells));

      return solutions.length > SOLUTION_LIMIT;
    }

    return SOLVER_VALUES.some(value => {
      const moveCount = this.store.undoStack().length;
      const hasSeenEnough = this.place(openCellId, value) && this.search(placedCells.set(openCellId, value), solutions);

      placedCells.delete(openCellId);
      this.rollBackTo(moveCount);

      return hasSeenEnough;
    });
  }

  /**
   * Writes the value into the cell and returns whether the cell kept it. A value that contradicts the rest of
   * the grid does not stay: StoreService takes it back off the cell and records it in `invalidCellValues`.
   * @param cellId
   * @param value
   * @private
   */
  private place(cellId: CellId, value: CellText) {
    this.storeService.updateCellValue(cellId, value);

    return this.store.cellById(cellId)!.userValue === value;
  }

  /**
   * The id of the first cell with no value, entered or deduced, and undefined once every cell has one.
   * @private
   */
  private openCellId() {
    return this.store.cells()
      .find(cell => this.logicService.deducedValue(cell.id) === CellText.EMPTY)?.id;
  }

  /**
   * Undoes moves one at a time until the undo stack is back down to moveCount moves.
   * @param moveCount
   * @private
   */
  private rollBackTo(moveCount: number) {
    while (this.store.undoStack().length > moveCount) {
      this.undoRedoService.undo();
    }
  }

  /**
   * Writes the solution's values into their cells, records those cell ids in `solvedCellIds` so the cells can
   * show that the solver filled them in, and records the whole solution as a single move.
   * @param solvedCells
   * @private
   */
  private applySolution(solvedCells: SolvedCells) {
    solvedCells.forEach((solvedValue, cellId) => this.store.updateCell(cellId, {userValue: solvedValue}));

    this.store.setSolvedCellIds(new Set(solvedCells.keys()));
    this.store.recordMove({moveFn: MoveFnEnum.SOLVE, moveArgs: {solvedCells}});
  }
}
