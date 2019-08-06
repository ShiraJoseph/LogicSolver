import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { TileService, Tile, TileType } from '../tile.service';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit {

  constructor(private dataService: DataService, private tileService: TileService) {
  }

  ngOnInit() {
    this.tileService.buildGrid();
  }

  getTiles() {
    return this.tileService.getTiles();
  }

  getColumnCount() {
    return this.tileService.getColumnCount();
  }

  addFeature() {
    this.dataService.addFeature();
    this.tileService.buildGrid();
  }

  addOption() {
    this.dataService.addOption();
    this.tileService.buildGrid();
  }

  // deactivates all tiles except the currently selected one.
  switchOut(newTile: Tile) {
    this.tileService.tiles.forEach((tile) => {
      if (tile.type === TileType.CELL_ACTIVE) {
        tile.type = TileType.CELL_INACTIVE;
      }
    });
    newTile.type = TileType.CELL_ACTIVE;
  }

  updateTile(tile: Tile, text: string) {
    tile.text = text;
    tile.type = TileType.CELL_INACTIVE;
    this.dataService.setCell(tile.objectId, text);
    this.dataService.updateCells();
    this.tileService.buildGrid();
  }

  getBorder(tile: Tile) {
    let topCellIndex = -1;
    let leftCellIndex = -1;
    let optionIndex = -1;
    const top = tile.type === TileType.TOP_OPTION_HEADER;
    const left = tile.type === TileType.LEFT_OPTION_HEADER;
    const last = this.dataService.optionCount - 1;

    const cell = this.dataService.getCell(tile.objectId);
    const option = this.dataService.getOption(tile.objectId);
    const feature = this.dataService.getFeature(tile.objectId);

    const all = feature || tile.type === TileType.ADD_OPTION || tile.type === TileType.ADD_FEATURE;
    if (cell) {
      topCellIndex = this.dataService.getFeatureOptions(this.dataService.getOption(cell.topOptionId).featureId)
        .findIndex(topOption => topOption.id === cell.topOptionId);
      leftCellIndex = this.dataService.getFeatureOptions(this.dataService.getOption(cell.leftOptionId).featureId)
        .findIndex(leftOption => leftOption.id === cell.leftOptionId);
    }
    if (option) {
      optionIndex = this.dataService.getFeature(option.featureId).optionsIds.findIndex(id => id === option.id);
    }

    return {
      left: all || (cell && topCellIndex === 0) || (option && (left || (top && optionIndex === 0))),
      right: all || (cell && topCellIndex === last) || (option && (left || (top && optionIndex === last))),
      top: all || (cell && leftCellIndex === 0) || (option && (top || (left && optionIndex === 0))),
      bottom: all || (cell && leftCellIndex === last) || (option && (top || (left && optionIndex === last))),
    };
  }

  clearCells() {
    console.log('clearing');
    this.dataService.clearCells();
    this.tileService.buildGrid();
  }
}
