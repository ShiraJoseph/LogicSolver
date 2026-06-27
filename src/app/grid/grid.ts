import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Tile, TileService, TileType } from '../../services/tile.service';
import { Header } from '../header/header';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.html',
  styleUrl: './grid.css',
  imports: [Header, MatGridList, MatGridTile, NgClass],
})
export class Grid implements OnInit {
  constructor(
    private dataService: DataService,
    private tileService: TileService,
  ) {}

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

  /** Deactivates all tiles except the currently selected one. */
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
    let topCellIndex: number | undefined = -1;
    let leftCellIndex: number | undefined = -1;
    let optionIndex: number | undefined = -1;
    const isTopOption = tile.type === TileType.TOP_OPTION_HEADER;
    const isLeftOption = tile.type === TileType.LEFT_OPTION_HEADER;
    const isTopFeature = tile.type === TileType.TOP_FEATURE_HEADER;
    const isLeftFeature = tile.type === TileType.LEFT_FEATURE_HEADER;
    const isTopButton = tile.type === TileType.ADD_FEATURE;
    const isBottomButton = tile.type === TileType.ADD_OPTION;
    const isCorner = tile.type === TileType.CORNER_BLANK;
    const lastOptionIndex = this.dataService.optionCount - 1;
    const cell = this.dataService.getCell(tile.objectId);
    const option = this.dataService.getOption(tile.objectId);
    const feature = this.dataService.getFeature(tile.objectId);

    if (cell) {
      const topFeatureId = this.dataService.getOption(cell.topOptionId)?.featureId;
      const leftFeatureId = this.dataService.getOption(cell.leftOptionId)?.featureId;
      topCellIndex = this.dataService
        .getFeatureOptions(topFeatureId as number)
        ?.findIndex((topOption) => topOption.id === cell.topOptionId);
      leftCellIndex = this.dataService
        .getFeatureOptions(leftFeatureId as number)
        ?.findIndex((leftOption) => leftOption.id === cell.leftOptionId);
    }

    if (option) {
      optionIndex = this.dataService
        .getFeature(option.featureId)
        ?.optionsIds?.findIndex((id) => id === option.id);
    }

    return {
      left: isLeftFeature,
      right:
        isCorner ||
        feature ||
        isBottomButton ||
        isTopButton ||
        (cell && topCellIndex === lastOptionIndex) ||
        isLeftOption ||
        (isTopOption && optionIndex === lastOptionIndex),
      top: isTopFeature || isTopButton,
      bottom:
        isCorner ||
        feature ||
        isBottomButton ||
        isTopButton ||
        (cell && leftCellIndex === lastOptionIndex) ||
        isTopOption ||
        (isLeftOption && optionIndex === lastOptionIndex),
    };
  }

  clearCells() {
    this.dataService.clearCells();
    this.tileService.buildGrid();
  }
}
