import {Component, inject, input} from '@angular/core';
import {CellText, Tile, TileType} from '../../../types/tile.model';
import {CellId, FeatureId, OptionId} from '../../../types/entities.model';
import {DataStore} from '../../../services/data.store';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'app-active-cell',
  imports: [],
  templateUrl: './active-cell.component.html',
  styleUrl: './active-cell.component.css',
})
export class ActiveCell {
  store = inject(DataStore);
  dataService = inject(DataService);
  tile = input.required<Tile>();

  /** The tile only carries display text, so the typed value comes from the cell itself. */
  cellValue(): CellText | undefined {
    return this.store.cellById(this.tile().objectId2 as CellId)?.value2;
  }

  updateTile2(tile: Tile, value?: CellText) {
    // we might not need this after we use the new x-o-toggle ui

    if (tile.type === TileType.CELL) {
      if (this.store.selectedCellId?.() === tile.objectId2) {
        this.store.setSelectedCellId(undefined);
      }

      this.dataService.setCell2(tile.objectId2 as CellId, value, true);
    } else if (tile.type === TileType.TOP_OPTION_HEADER || tile.type === TileType.LEFT_OPTION_HEADER) {
      this.store.updateOption(tile.objectId2 as OptionId, {name: value});
    } else if (tile.type === TileType.TOP_FEATURE_HEADER || tile.type === TileType.LEFT_FEATURE_HEADER) {
      this.store.updateOption(tile.objectId2 as FeatureId, {name: value});
    }
  }

  protected readonly CellText = CellText;
}
