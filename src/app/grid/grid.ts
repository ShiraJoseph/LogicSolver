import {Component, computed, inject, linkedSignal, OnInit, signal} from '@angular/core';
import { DataService } from '../../services/data.service';
import { TileService } from '../../services/tile.service';
import { Header } from '../header/header';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { NgClass } from '@angular/common';
import {CellText, Tile, TileType} from '../../services/tile.model';
import { DataStore } from '../../services/data.store';
import {CellId, FeatureId, OptionId} from '../../services/entities.model';
import {EntityId} from '@ngrx/signals/entities';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.html',
  styleUrl: './grid.css',
  imports: [Header, MatGridList, MatGridTile, NgClass],
})
export class Grid implements OnInit {
  store = inject(DataStore);
  tileService = inject(TileService);
  dataService = inject(DataService);
  selectedTile2 = signal<undefined | EntityId>(undefined)

  ngOnInit() {
    this.tileService.buildGrid();
    // todo: to continue
    // (just use tiles directly)
  }

  // use directly
  getTiles() {
    return this.tileService.getTiles();
  }

  columnCount2 = computed(() => this.store.optionCountPerFeature() * (this.store.featureCount()-1) + 5);
  getColumnCount() {
    return this.tileService.getColumnCount();
  }

  addFeature2(){
    this.dataService.addNewFeature2();
  }
  addFeature() {
    this.dataService.addFeature();
    this.tileService.buildGrid();
  }

  addOption2(){
    this.dataService.addNewOptionToAllFeatures2();
  }
  addOption() {
    this.dataService.addOption();
    this.tileService.buildGrid();
  }

  // we might not need this after we use the new x-o-toggle ui
  switchOut2(newTile: Tile){
    this.selectedTile2.set(newTile.objectId2);
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


  updateTile2(tile: Tile, value: string) {
    // we might not need this after we use the new x-o-toggle ui
    if(this.selectedTile2() === tile.objectId2){
      this.selectedTile2.set(undefined);
    }

    if(tile.type === TileType.CELL_INACTIVE || tile.type === TileType.CELL_ACTIVE) {
      this.store.updateCell(tile.objectId2 as CellId, {value});
    } else if(tile.type === TileType.TOP_OPTION_HEADER || tile.type === TileType.LEFT_OPTION_HEADER) {
      this.store.updateOption(tile.objectId2 as OptionId, {name: value});
    } else if (tile.type === TileType.TOP_FEATURE_HEADER || tile.type === TileType.LEFT_FEATURE_HEADER){
      this.store.updateOption(tile.objectId2 as FeatureId, {name: value});
    }
  }
  updateTile(tile: Tile, text: string) {
    tile.text = text;
    tile.type = TileType.CELL_INACTIVE;
    this.dataService.setCell(tile.objectId, text);
    this.dataService.updateCells();
    this.tileService.buildGrid();
  }

  getBorder2(tile: Tile){
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
    const lastOptionIndex = this.store.optionCountPerFeature() - 1;
    const cell = this.store.cellById(tile.objectId2 as CellId);
    const option = this.store.optionById(tile.objectId2 as OptionId);
    const feature = this.store.featureById(tile.objectId2 as FeatureId);

    if (cell) {
      const [leftOptionId, topOptionId] = cell.optionIds || [];
      topCellIndex = this.store.indexOfFeatureOption(topOptionId);
      leftCellIndex = this.store.indexOfFeatureOption(leftOptionId);
    }

    if (option) {
      optionIndex =this.store.indexOfFeatureOption(option);
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
    const cell = this.dataService.getCell(tile.objectId); // done
    const option = this.dataService.getOption(tile.objectId); // done
    const feature = this.dataService.getFeature(tile.objectId); // done

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

  clearCells2() {
    this.dataService.clearCells2();
  }
  clearCells() {
    this.dataService.clearCells();
    this.tileService.buildGrid();
  }

  protected readonly CellText = CellText;
}
