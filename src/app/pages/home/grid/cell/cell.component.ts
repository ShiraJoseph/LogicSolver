import {Component, computed, effect, ElementRef, inject, input, viewChild} from '@angular/core';
import {CellText, Tile} from '../../../../types/tile.model';
import {CellId} from '../../../../types/entities.model';
import {LogicService} from '../../../../services/logic.service';
import {BaseDirective} from '../../../../directives/base.directive';
import {ARROW_DOWN_KEY, ARROW_LEFT_KEY, ARROW_RIGHT_KEY, ARROW_UP_KEY, BACKSPACE_KEY, DELETE_KEY, ENTER_KEY, ESCAPE_KEY, O_KEY, PRIMARY_POINTER_BUTTON, SPACE_KEY, X_KEY} from '../../../../constants/keyboard.const';
import {NEXT_CELL_TEXT} from '../../../../constants/grid.const';
import {TranslateService} from '@ngx-translate/core';

/** One square where two options cross, taking an X or an O by click or keystroke. */
@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrl: './cell.component.css',
})
export class CellComponent extends BaseDirective {
  logicService = inject(LogicService);

  cellButton = viewChild<ElementRef<HTMLButtonElement>>('cellButton');

  /** Translations */
  lang = inject(TranslateService).translate('cell');

  tile = input.required<Tile>();

  /** The cell this tile stands for. */
  cell = computed(() => this.store.cellById(this.tile().entityId as CellId)!);

  /** If the keyboard is on this cell */
  isSelected = computed(() => this.store.selectedCellId?.() === this.cell().id);

  /** If this cell holds the grid's one tab stop */
  isTabStop = computed(() => this.store.tabStopCellId() === this.cell().id);

  /** The screen reader name for the cell: the options it sits between, then the value it shows. */
  cellLabel = computed(() => {
    const [leftOptionId, topOptionId] = this.cell().optionIds!;
    const {row, column, value, invalidValue} = this.lang();
    const cellValue = this.cellValue();
    const cellPosition = `${row} ${this.store.optionById(leftOptionId)!.name} ${column} ${this.store.optionById(topOptionId)!.name}`;
    const valueName = this.store.invalidCellValues().has(this.cell().id) ? invalidValue : value;

    return cellValue ? `${cellPosition} ${valueName} ${cellValue}` : cellPosition;
  });

  /** The background this cell takes from the hovered row and column. */
  hoverColor = computed(() => this.colorService.getCellColor(this.tile()));

  /** The value the user entered that the grid contradicts, and the deduced value while there is none. */
  cellValue = computed(() =>
    this.store.invalidCellValues().get(this.cell().id) ?? this.logicService.deducedValue(this.cell().id));

  /**
   * Moves the keyboard onto this cell whenever the grid picks it as the selected one.
   */
  constructor() {
    super();

    effect(() => {
      if (this.isSelected()) {
        this.cellButton()?.nativeElement.focus();
      }
    });
  }

  /**
   * Writes the value onto this cell, holding it aside instead when the grid contradicts it.
   * @param newValue
   */
  updateCellValue(newValue: CellText) {
    this.storeService.updateCellValue(this.cell().id, newValue);
  }

  /**
   * Sets the current cell as hovered to trigger color highlighting changes
   */
  onHover() {
    this.colorService.hoveredCellId.set(this.tile().entityId as CellId);
  }

  /**
   * Hands this cell the keyboard and lights its row and column.
   */
  onFocus() {
    this.store.setSelectedCellId(this.cell().id);
    this.onHover();
  }

  /**
   * Focuses the cell and toggles its value.
   * @param event
   */
  onClickCell(event: PointerEvent) {
    if (event.button !== PRIMARY_POINTER_BUTTON) return;

    this.cellButton()?.nativeElement.focus();
    this.onFocus();
    this.cycleValue();
  }

  /**
   * Takes the keyboard off the cell, leaving its value alone.
   */
  deselectCell() {
    this.store.setSelectedCellId(undefined);
    this.cellButton()?.nativeElement.blur();
  }

  /**
   * Writes, cycles, empties or lets go of the cell, taking either case of x and o.
   * @param event
   */
  protected onKeydown(event: KeyboardEvent) {
    switch (event.key.toLowerCase()) {
      case X_KEY:
        this.updateCellValue(CellText.X);
        break;
      case O_KEY:
        this.updateCellValue(CellText.O);
        break;
      case BACKSPACE_KEY:
      case DELETE_KEY:
        event.preventDefault();
        this.updateCellValue(CellText.EMPTY);
        break;
      case ESCAPE_KEY:
        this.deselectCell();
        break;
      case ENTER_KEY:
      case SPACE_KEY:
        event.preventDefault();
        this.cycleValue();
        break;
      case ARROW_UP_KEY:
      case ARROW_DOWN_KEY:
      case ARROW_LEFT_KEY:
      case ARROW_RIGHT_KEY:
        event.preventDefault();
        this.store.selectNeighborCell(this.cell().id, event.key.toLowerCase());
        break;
      default:
        return;
    }
  }

  /**
   * Moves the cell on to the next value in the ring.
   * @private
   */
  private cycleValue() {
    this.updateCellValue(NEXT_CELL_TEXT[this.cellValue()]);
  }

  protected readonly CellText = CellText;
}
