import {Component, computed, inject, input} from '@angular/core';
import {CellText, Tile} from '../../../types/tile.model';
import {Cell, CellId} from '../../../types/entities.model';
import {LogicService} from '../../../services/logic.service';
import {BaseDirective} from '../../../directives/base.directive';
import {MoveFnEnum} from '../../../types/move.model';
import {TranslatePipe} from '@ngx-translate/core';

/** One square where two options cross, showing its deduced X or O and the buttons for entering one. */
@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  imports: [TranslatePipe],
  styleUrl: './cell.component.css',
})
export class CellComponent extends BaseDirective {
  logicService = inject(LogicService);

  tile = input.required<Tile>();

  /** The background this cell takes from the hovered row and column. */
  hoverColor = computed(() => this.colorService.getCellColor(this.tile()));

  /** If this cell's buttons are open */
  isSelected = computed(() => this.store.selectedCellId?.() === this.tile().entityId);

  /** An O once one candidate is left for the pairing, an X once it is ruled out, and empty while neither is settled. */
  cellValue = computed(() => {
    const [leftOptionId, topOptionId] = this.store.cellById(this.tile().entityId as CellId)!.optionIds!;
    const possibleTopOptions = this.logicService.candidates().get(leftOptionId)!
      .get(this.store.optionById(topOptionId)!.featureId!)!;

    return !possibleTopOptions.has(topOptionId) ?
      CellText.X : possibleTopOptions.size === 1 ?
        CellText.O :
        CellText.EMPTY;
  });

  /**
   * Writes the value onto the cell and closes it.
   * @param tile
   * @param value
   */
  updateCell(tile: Tile, value: CellText) {
    this.store.recordMove({moveFn: MoveFnEnum.UPDATE, moveArgs: {cellId: tile.entityId as CellId, oldValue: tile.text as CellText, newValue: value}});
    this.store.updateCell(tile.entityId as CellId, {userValue: value});
    this.store.setSelectedCellId(undefined);
  }

  /**
   * Sets the current cell as selected
   */
  selectCell() {
    this.store.setSelectedCellId(this.tile().entityId as CellId);
  }

  /**
   * Clears out selection from all cells
   */
  deselectCell() {
    this.store.setSelectedCellId(undefined);
  }

  /**
   * Sets the current cell as hovered to trigger color highlighting changes
   */
  onHover() {
    this.colorService.hoveredCellId.set(this.tile().entityId as CellId);
  }

  protected readonly CellText = CellText;
}
