import { Injectable } from '@angular/core';
import { Cell, Feature, Option } from './model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  cells: Cell[] = [];
  oldCells: Cell[] = [];
  features: Feature[] = [];
  options: Option[] = [];
  optionCount = 3;
  cellCount = 0;

  constructor() {
    this.buildDataTemplate();
  }

  getAllowDeleteFeatures(): boolean {
    return this.features.length > 2;
  }

  getAllowDeleteOptions(): boolean {
    return this.optionCount > 1;
  }

  buildDataTemplate() {
    for (let i = 0; i < 4; i++) {
      this.features.push(new Feature());
    }

    this.features.forEach((feature) => {
      feature.optionsIds = [];

      for (let i = 0; i < this.optionCount; i++) {
        const option = new Option();
        option.featureId = feature.id;
        this.options.push(option);
        feature.optionsIds.push(option.id);
      }
    });

    this.features[0].name = 'First Name';
    this.features[1].name = 'Last Name';
    this.features[2].name = 'Color';
    this.features[3].name = 'Vehicle';
    this.options[0].name = 'Bob';
    this.options[1].name = 'Missy';
    this.options[2].name = 'Jo';
    this.options[3].name = 'Smith';
    this.options[4].name = 'Johnson';
    this.options[5].name = 'Joseph';
    this.options[6].name = 'red';
    this.options[7].name = 'green';
    this.options[8].name = 'blue';
    this.options[9].name = 'car';
    this.options[10].name = 'boat';
    this.options[11].name = 'plane';
    this.updateCells();
  }

  /**
   * Rebuilds the cell list from the current features and options, reusing any
   * existing cell (and its value) that still matches a pair of options so the
   * board survives adding or renaming features.
   */
  updateCells() {
    this.oldCells = this.cells;
    this.cells = [];
    this.cellCount = 0;

    // for each left leftOptionId in left feature0
    this.features[0].optionsIds?.forEach((leftOptionId) => {
      // for each feature greater than left feature, as top feature
      for (let topFeatureIndex = 1; topFeatureIndex < this.features.length; topFeatureIndex++) {
        // for each top leftOptionId in top feature
        this.features[topFeatureIndex]?.optionsIds?.forEach((topOptionId) => {
          // create/push a cell with those two options
          let cell: Cell | undefined = this.getCellFromOptions(
            this.oldCells,
            leftOptionId,
            topOptionId,
          );

          if (!cell) {
            cell = new Cell();
            cell.leftOptionId = leftOptionId;
            cell.topOptionId = topOptionId;
          }

          this.cells.push(cell);
          cell = undefined;
          this.cellCount++;
        });
      }
    });

    // then start with the last feature going backwards until feature 2, as left feature
    for (
      let leftFeatureIndex = this.features.length - 1;
      leftFeatureIndex > 1;
      leftFeatureIndex--
    ) {
      // for each leftOptionId in left feature
      this.features[leftFeatureIndex].optionsIds?.forEach((leftOptionId) => {
        // for each feature after 1 until left feature exclusive, as top feature
        for (let topFeatureIndex = 1; topFeatureIndex < leftFeatureIndex; topFeatureIndex++) {
          // for each leftOptionId in top feature
          this.features[topFeatureIndex].optionsIds?.forEach((topOptionId) => {
            // create/push a cell with those two options
            let cell = this.getCellFromOptions(this.oldCells, leftOptionId, topOptionId);

            if (!cell) {
              cell = new Cell();
              cell.leftOptionId = leftOptionId;
              cell.topOptionId = topOptionId;
            }

            this.cells.push(cell);
            this.cellCount++;
          });
        }
      });
    }

    this.oldCells = [];
  }

  clearCells() {
    this.cells.forEach((cell) => (cell.value = ''));
    this.updateCells();
  }

  /** Finds an existing cell matching the two options in either order. */
  getCellFromOptions(cells: Cell[], option1Id: number, option2Id: number): Cell | undefined {
    return cells.find(
      (cell) =>
        (cell.leftOptionId === option1Id && cell.topOptionId === option2Id) ||
        (cell.leftOptionId === option2Id && cell.topOptionId === option1Id),
    );
  }

  addFeature() {
    const feature = new Feature();
    feature.name = '';
    feature.optionsIds = [];

    for (let i = 0; i < this.optionCount; i++) {
      const option = new Option();
      option.name = '';
      option.featureId = feature.id;
      feature.optionsIds.push(option.id);
      this.options.push(option);
    }

    this.features.push(feature);
    this.updateCells();
  }

  addOption() {
    this.optionCount++;

    this.features.forEach((feature) => {
      const option = new Option();
      option.name = '';
      option.featureId = feature.id;
      feature.optionsIds?.push(option.id);
      this.options.push(option);
    });

    this.updateCells();
  }

  deleteOption(id: number) {
    const featureId = this.getOption(id)?.featureId;
    if (!featureId) return;

    const indexToRemove =
      this.getFeature(featureId)?.optionsIds?.findIndex((optionId) => optionId === id) || -1;
    if (!indexToRemove) return;

    this.features.forEach((feature) => {
      const nextId = feature.optionsIds?.[indexToRemove];
      this.cells = this.cells.filter(
        (cell) => cell.leftOptionId !== nextId && cell.topOptionId !== nextId,
      );
      this.options = this.options.filter((option) => option.id !== nextId);
      feature.optionsIds?.splice(indexToRemove, 1);
    });

    this.optionCount--;
  }

  deleteFeature(id: number) {
    const featureToRemove = this.features.find((feature) => feature.id === id);
    const optionsToRemove = featureToRemove?.optionsIds;

    this.cells = this.cells.filter(
      (cell) =>
        cell.leftOptionId &&
        cell.topOptionId &&
        !optionsToRemove?.includes(cell.leftOptionId) &&
        !optionsToRemove?.includes(cell.topOptionId),
    );
    this.options = this.options.filter((option) => !optionsToRemove?.includes(option.id));
    this.features = this.features.filter((feature) => feature.id !== id);
  }

  setCell(
    id?: number,
    value?: string,
    topOptionId?: number,
    leftOptionId?: number,
    withLogic = true,
  ) {
    let cell = this.getCell(id);
    if (cell) {
      if (value !== cell.value && typeof value === 'string') {
        cell.value = value;

        if (value === 'O' && id != undefined) {
          const crossCells = this.getCrossCellIds(id);
          crossCells.forEach((cellId) => {
            this.setCell(cellId, 'X');
          });
        }

        if (withLogic) {
          this.runBasicRowLogic();
          this.runBasicColumnLogic();
          this.fillDeductions();
        }
      }
      cell = this.getCell(id);

      if (cell && topOptionId) {
        cell.topOptionId = topOptionId;
      }

      if (cell && leftOptionId) {
        cell.leftOptionId = leftOptionId;
      }
    }
  }

  setOption(id: number, name?: string, featureId?: number) {
    const option = this.getOption(id);
    if (option) {
      if (name) {
        option.name = name;
      }

      if (featureId) {
        option.featureId = featureId;
      }
    }
  }

  setFeature(id: number, name?: string, optionsIds?: number[]) {
    const feature = this.getFeature(id);
    if (feature) {
      if (name) {
        feature.name = name;
      }

      if (optionsIds) {
        feature.optionsIds = optionsIds;
      }

      this.updateCells();
    }
  }

  getCell(id?: number): Cell | undefined {
    return id != undefined ? this.cells.find((cell) => cell.id === id) : undefined;
  }

  getOption(id?: number): Option | undefined {
    return id != undefined ? this.options.find((option) => option.id === id) : undefined;
  }

  getFeature(id?: number): Feature | undefined {
    return id != undefined ? this.features.find((feature) => feature.id === id) : undefined;
  }

  getFeatureOptions(featureId?: number): Option[] | undefined {
    return featureId != undefined
      ? this.options.filter((option) => option.featureId === featureId)
      : undefined;
  }

  /**
   * Cells that share a feature-row or feature-column with this cell — the
   * ones forced to X when this cell becomes O.
   */
  getCrossCellIds(cellId: number): number[] {
    const leftOptionId = this.getCell(cellId)?.leftOptionId;
    const leftFeatureId = this.getOption(leftOptionId)?.featureId;
    const topOptionId = this.getCell(cellId)?.topOptionId;
    const topFeatureId = this.getOption(topOptionId)?.featureId;
    const crossCellIds: Array<number> = [];

    this.cells.forEach((cell) => {
      if (
        cell.id !== cellId &&
        ((cell.topOptionId === topOptionId &&
          this.getOption(cell.leftOptionId)?.featureId === leftFeatureId) ||
          (cell.leftOptionId === leftOptionId &&
            this.getOption(cell.topOptionId)?.featureId === topFeatureId))
      ) {
        crossCellIds.push(cell.id);
      }
    });

    return crossCellIds;
  }

  /**
   * Propagates known values along each row: gathers the values in the columns
   * crossed by a row's Os, then copies them onto the other Os in that row,
   * since parallel Os must share the same column values.
   */
  runBasicRowLogic() {
    const changedCellIds: number[] = [];

    this.options.forEach((leftOption) => {
      if (!changedCellIds.find((cellId) => this.getCell(cellId)?.leftOptionId === leftOption.id)) {
        // Find the 'O's in the next row
        const rowOfOs: Cell[] = this.cells.filter(
          (cell) => cell.leftOptionId === leftOption.id && cell.value === 'O',
        );
        const rowOfXs: Cell[] = this.cells.filter(
          (cell) => cell.leftOptionId === leftOption.id && cell.value === 'X',
        );
        const masterColumn: { leftOptionId: number; value: string }[] = [];
        rowOfXs.forEach((rowXCell) =>
          masterColumn.push({ leftOptionId: rowXCell.topOptionId as number, value: rowXCell.value }),
        );

        if (rowOfOs.length > 0) {
          // for each 'O', collect all the cells in that column
          rowOfOs.forEach((oCell) => {
            const columnCells: Cell[] = this.cells.filter(
              (cell) => cell.topOptionId === oCell.topOptionId,
            );
            columnCells.forEach((columnCell) => {
              // if a cell in that column has a value, add its leftOption to the master column (but no duplicates)
              if (
                columnCell.value &&
                columnCell.leftOptionId != undefined &&
                !masterColumn.find((record) => record.leftOptionId === columnCell.leftOptionId)
              ) {
                masterColumn.push({
                  leftOptionId: columnCell.leftOptionId,
                  value: columnCell.value,
                });
              }
            });
          });

          masterColumn.forEach((record) => {
            if (record.value === 'O') {
              const recordColumnCells = this.cells.filter(
                (cell) => cell.topOptionId === record.leftOptionId,
              );

              if (recordColumnCells.length > 0) {
                rowOfOs.push(recordColumnCells[0]);
                recordColumnCells.forEach((columnCell) => {
                  // if a cell in that column has a value, add its leftOption to the master column (but no duplicates)
                  if (
                    columnCell.value &&
                    columnCell.leftOptionId != undefined &&
                    !masterColumn.find(
                      (existingRecord) => existingRecord.leftOptionId === columnCell.leftOptionId,
                    )
                  ) {
                    masterColumn.push({
                      leftOptionId: columnCell.leftOptionId,
                      value: columnCell.value,
                    });
                  }
                });
              }
            }
          });

          // Go through each of the 'O's in the current row again
          rowOfOs.forEach((oCellInRow) => {
            // apply the master column data to each of the 'O''s columns
            masterColumn.forEach((record) => {
              const fillCell = this.getCellFromOptions(
                this.cells,
                oCellInRow.topOptionId as number,
                record.leftOptionId,
              );

              if (
                fillCell &&
                !changedCellIds.find((changedId) => changedId === fillCell.id) &&
                !fillCell.value
              ) {
                this.setCell(fillCell.id, record.value, undefined, undefined, false);
                // keep track so we don't repeat anything
                changedCellIds.push(fillCell.id);
              }
            });
          });
        }
      }
    });
  }

  /**
   * Mirror of runBasicRowLogic for columns: gathers the values in the rows
   * crossed by a column's Os and copies them onto the other Os in that column.
   */
  runBasicColumnLogic() {
    const changedCellIds: number[] = [];

    this.options.forEach((topOption) => {
      if (!changedCellIds.find((cellId) => this.getCell(cellId)?.topOptionId === topOption.id)) {
        // Find the 'O's in the next row
        const columnOfOs: Cell[] = this.cells.filter(
          (cell) => cell.topOptionId === topOption.id && cell.value === 'O',
        );
        const columnOfXs: Cell[] = this.cells.filter(
          (cell) => cell.topOptionId === topOption.id && cell.value === 'X',
        );
        const masterRow: { topOptionId: number; value: string }[] = [];
        columnOfXs.forEach((columnXCell) =>
          masterRow.push({
            topOptionId: columnXCell.leftOptionId as number,
            value: columnXCell.value,
          }),
        );

        if (columnOfOs.length > 0) {
          // for each 'O', collect all the cells in that column
          columnOfOs.forEach((oCell) => {
            const rowCells: Cell[] = this.cells.filter(
              (cell) => cell.leftOptionId === oCell.leftOptionId,
            );
            rowCells.forEach((rowCell) => {
              // if a cell in that column has a value, add its leftOption to the master column (but no duplicates)
              if (
                rowCell.value &&
                rowCell.topOptionId != undefined &&
                !masterRow.find((record) => record.topOptionId === rowCell.topOptionId)
              ) {
                masterRow.push({ topOptionId: rowCell.topOptionId, value: rowCell.value });
              }
            });
          });

          masterRow.forEach((record) => {
            if (record.value === 'O') {
              const recordRowCells = this.cells.filter(
                (cell) => cell.leftOptionId === record.topOptionId,
              );

              if (recordRowCells.length > 0) {
                columnOfOs.push(recordRowCells[0]);
                recordRowCells.forEach((rowCell) => {
                  // if a cell in that column has a value, add its leftOption to the master column (but no duplicates)
                  if (
                    rowCell.value &&
                    rowCell.topOptionId != undefined &&
                    !masterRow.find(
                      (existingRecord) => existingRecord.topOptionId === rowCell.topOptionId,
                    )
                  ) {
                    masterRow.push({ topOptionId: rowCell.topOptionId, value: rowCell.value });
                  }
                });
              }
            }
          });

          // Go through each of the 'O's in the current column again
          columnOfOs.forEach((oCellInColumn) => {
            // apply the master row data to each of the 'O''s rows
            masterRow.forEach((record) => {
              const fillCell = this.getCellFromOptions(
                this.cells,
                oCellInColumn.leftOptionId as number,
                record.topOptionId,
              );

              if (
                fillCell &&
                !changedCellIds.find((changedId) => changedId === fillCell.id) &&
                !fillCell.value
              ) {
                this.setCell(fillCell.id, record.value, undefined, undefined, false);
                // keep track so we don't repeat anything
                changedCellIds.push(fillCell.id);
              }
            });
          });
        }
      }
    });
  }

  /**
   * Fills an empty cell with O when every other cell in its feature-row or
   * feature-column is already X (the only remaining match must be true).
   */
  fillDeductions() {
    this.cells.forEach((cell) => {
      if (!cell.value) {
        const rowOptionCells = this.cells.filter(
          (rowCell) =>
            rowCell.id !== cell.id &&
            cell.topOptionId === rowCell.topOptionId &&
            this.getOption(cell.leftOptionId)?.featureId != undefined &&
            this.getOption(cell.leftOptionId)?.featureId ===
              this.getOption(rowCell.leftOptionId)?.featureId,
        );
        const columnOptionCells = this.cells.filter(
          (columnCell) =>
            columnCell.id !== cell.id &&
            cell.leftOptionId === columnCell.leftOptionId &&
            this.getOption(cell.topOptionId)?.featureId != undefined &&
            this.getOption(cell.topOptionId)?.featureId ===
              this.getOption(columnCell.topOptionId)?.featureId,
        );

        if (
          rowOptionCells.every((crossCell) => crossCell.value === 'X') ||
          columnOptionCells.every((crossCell) => crossCell.value === 'X')
        ) {
          this.setCell(cell.id, 'O', undefined, undefined, false);
        }
      }
    });
  }

  /** Human-readable "leftOption, topOption" label for a cell, used in logging. */
  cellAddress(cellId: number): string {
    const cell = this.getCell(cellId);

    if (cell) {
      return `${this.getOption(cell.leftOptionId)?.name}, ${this.getOption(cell.topOptionId)?.name}`;
    }

    return '[not found]';
  }
}
