import {Component, computed, inject, input} from '@angular/core';
import {CellText, Tile} from '../../../types/tile.model';
import {CellId} from '../../../types/entities.model';
import {GridStore} from '../../../store/store';
import {LogicService} from '../../../services/logic.service';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrl: './cell.component.css',
})
export class CellComponent {
  store = inject(GridStore);
  logicService = inject(LogicService);

  tile = input.required<Tile>();

  isSelected = computed(() => this.store.selectedCellId?.() === this.tile().entityId);
  cellValue = computed(() => {
    const [leftOptionId, topOptionId] = this.store.cellById(this.tile().entityId as CellId)!.optionIds!;
    const possibleTopOptions = this.logicService.candidates().get(leftOptionId)!
      .get(this.store.optionById(topOptionId)!.featureId!)!;


    return !possibleTopOptions.has(topOptionId) ?
      CellText.X : possibleTopOptions.size === 1 ?
        CellText.O :
        CellText.EMPTY;
  });

  updateCell(tile: Tile, value: CellText) {
    this.store.updateCell(tile.entityId as CellId, {userValue: value});
    this.store.setSelectedCellId(undefined);
  }

  selectCell() {
    this.store.setSelectedCellId(this.tile().entityId as CellId);
  }

  protected readonly CellText = CellText;
}
