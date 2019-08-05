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

  clearCells() {
    console.log('clearing');
    this.dataService.clearCells();
    this.tileService.buildGrid();
  }
}
