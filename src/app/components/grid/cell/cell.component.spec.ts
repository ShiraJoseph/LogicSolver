import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CellComponent} from './cell.component';
import {GridStore} from '../../../store/store';
import {StoreService} from '../../../services/store.service';
import {ColorService} from '../../../services/color.service';
import {GRID_SEED} from '../../../store/grid.token';
import {MOCK_SMALL_GRID_SEED} from '../../../mocks/grid.mock';
import {CELL_TILE} from '../../../constants/tile.const';
import {CellText} from '../../../types/tile.model';
import {CellId} from '../../../types/entities.model';
import {MoveFnEnum} from '../../../types/move.model';
import {TRANSLATION_PROVIDERS} from '../../../app.config';
import {PRIMARY_POINTER_BUTTON} from '../../../constants/keyboard.const';

const SECONDARY_POINTER_BUTTON = 2;

describe('CellComponent', () => {
  let component: CellComponent;
  let fixture: ComponentFixture<CellComponent>;
  let store: InstanceType<typeof GridStore>;
  let colorService: ColorService;

  const optionId = (name: string) => store.options().find(option => option.name === name)!.id;
  const cellId = (nameA: string, nameB: string) => store.cellByOptions(optionId(nameA), optionId(nameB))!.id;

  const showCell = async (id: CellId) => {
    fixture.componentRef.setInput('tile', {...CELL_TILE, entityId: id, text: store.cellById(id)!.userValue});
    await fixture.whenStable();
  };

  const clickCell = async (button = PRIMARY_POINTER_BUTTON) => {
    fixture.nativeElement.querySelector('.cell')
      .dispatchEvent(new PointerEvent('pointerdown', {button, bubbles: true, cancelable: true}));
    await fixture.whenStable();
  };

  const focusCell = async () => {
    fixture.nativeElement.querySelector('.cell').focus();
    await fixture.whenStable();
  };

  const pressKey = async (key: string) => {
    fixture.nativeElement.querySelector('.cell')
      .dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true}));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [CellComponent],
      providers: [TRANSLATION_PROVIDERS, {provide: GRID_SEED, useValue: MOCK_SMALL_GRID_SEED}]
    });
    TestBed.inject(StoreService);
    store = TestBed.inject(GridStore);
    colorService = TestBed.inject(ColorService);

    fixture = TestBed.createComponent(CellComponent);
    component = fixture.componentInstance;
    await showCell(store.cells()[0].id);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('cellValue', () => {
    it('should be empty while more than one candidate is left', () => {
      expect(component.cellValue()).toBe(CellText.EMPTY);
    });

    it('should be an O once one candidate is left', async () => {
      await showCell(cellId('Cat', 'Bike'));
      store.updateCell(cellId('Cat', 'Bike'), {userValue: CellText.O});

      expect(component.cellValue()).toBe(CellText.O);
    });

    it('should be an X once the pairing is ruled out', async () => {
      await showCell(cellId('Dog', 'Bike'));
      store.updateCell(cellId('Cat', 'Bike'), {userValue: CellText.O});

      expect(component.cellValue()).toBe(CellText.X);
    });

    it('should be an X for a pairing the user ruled out', async () => {
      await showCell(cellId('Cat', 'Bike'));
      store.updateCell(cellId('Cat', 'Bike'), {userValue: CellText.X});

      expect(component.cellValue()).toBe(CellText.X);
    });
  });

  describe('updateCellValue', () => {
    it('should write the value onto the cell', () => {
      component.updateCellValue(CellText.O);

      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.O);
    });

    it('should empty the cell when given no value', () => {
      component.updateCellValue(CellText.X);

      component.updateCellValue(CellText.EMPTY);

      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.EMPTY);
    });

    it('should leave the cell alone when it already holds the value', () => {
      component.updateCellValue(CellText.EMPTY);

      expect(store.undoStack()).toEqual([]);
    });

    it('should leave the cell alone when the value matches the one it shows', async () => {
      store.updateCell(cellId('Cat', 'Bike'), {userValue: CellText.O});
      await showCell(cellId('Dog', 'Bike'));

      component.updateCellValue(CellText.X);

      expect(store.undoStack()).toEqual([]);
    });
  });

  describe('the keyboard', () => {
    it('should write an X on x', async () => {
      await pressKey('x');

      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.X);
    });

    it('should write an O on o', async () => {
      await pressKey('o');

      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.O);
    });

    it('should empty the cell on backspace', async () => {
      await pressKey('x');

      await pressKey('Backspace');

      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.EMPTY);
    });

    it('should empty the cell on delete', async () => {
      await pressKey('x');

      await pressKey('Delete');

      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.EMPTY);
    });

    it('should hold on to the page on backspace', async () => {
      const backspace = new KeyboardEvent('keydown', {key: 'Backspace', bubbles: true, cancelable: true});

      fixture.nativeElement.querySelector('.cell').dispatchEvent(backspace);

      expect(backspace.defaultPrevented).toBe(true);
    });

    it('should move the cell on to the next value on enter', async () => {
      await pressKey('Enter');

      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.X);
    });

    it('should move the cell on to the next value on space', async () => {
      await pressKey('x');

      await pressKey(' ');

      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.O);
    });

    it('should hold on to the page on space', async () => {
      const space = new KeyboardEvent('keydown', {key: ' ', bubbles: true, cancelable: true});

      fixture.nativeElement.querySelector('.cell').dispatchEvent(space);

      expect(space.defaultPrevented).toBe(true);
    });

    it('should write an X on a capital X', async () => {
      await pressKey('X');

      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.X);
    });

    it('should write an O on a capital O', async () => {
      await pressKey('O');

      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.O);
    });

    it('should leave the cell alone on a key it does not listen for', async () => {
      await pressKey('q');

      expect(store.undoStack()).toEqual([]);
    });

    it('should hold on to the page on every arrow key', async () => {
      const held = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].map(key => {
        const arrow = new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true});

        fixture.nativeElement.querySelector('.cell').dispatchEvent(arrow);

        return arrow.defaultPrevented;
      });

      expect(held).toEqual([true, true, true, true]);
    });

    it('should let go of the cell on escape without changing it', async () => {
      const cell = fixture.nativeElement.querySelector('.cell');
      cell.focus();
      await pressKey('x');

      await pressKey('Escape');

      expect(document.activeElement).not.toBe(cell);
      expect(store.selectedCellId?.()).toBeUndefined();
      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.X);
    });
  });

  describe('arrow navigation', () => {
    it('should hand the keyboard to the cell on the right', async () => {
      await showCell(cellId('Cat', 'Bike'));
      await focusCell();

      await pressKey('ArrowRight');

      expect(store.selectedCellId?.()).toBe(cellId('Cat', 'Canoe'));
    });

    it('should hand the keyboard to the cell below', async () => {
      await showCell(cellId('Cat', 'Bike'));
      await focusCell();

      await pressKey('ArrowDown');

      expect(store.selectedCellId?.()).toBe(cellId('Dog', 'Bike'));
    });

    it('should stay put at the edge of the grid', async () => {
      await showCell(cellId('Cat', 'Bike'));
      await focusCell();

      await pressKey('ArrowLeft');

      expect(store.selectedCellId?.()).toBe(cellId('Cat', 'Bike'));
    });

    it('should leave the value of the cell alone', async () => {
      await showCell(cellId('Cat', 'Bike'));
      await focusCell();

      await pressKey('ArrowRight');

      expect(store.undoStack()).toEqual([]);
    });
  });

  describe('the tab stop', () => {
    const cellClasses = () => fixture.nativeElement.querySelector('.cell').classList;

    it('should keep every cell out of the browser tab order', async () => {
      await showCell(cellId('Cat', 'Bike'));

      expect(fixture.nativeElement.querySelector('.cell').getAttribute('tabindex')).toBe('-1');
    });

    it('should sit on the first cell while no cell is selected', async () => {
      await showCell(cellId('Cat', 'Bike'));

      expect(cellClasses()).toContain('tab-stop');
    });

    it('should stay off every other cell while no cell is selected', async () => {
      await showCell(cellId('Dog', 'Bike'));

      expect(cellClasses()).not.toContain('tab-stop');
    });

    it('should move to the selected cell', async () => {
      await showCell(cellId('Dog', 'Bike'));

      store.setSelectedCellId(cellId('Dog', 'Bike'));
      await fixture.whenStable();

      expect(cellClasses()).toContain('tab-stop');
    });

    it('should leave the first cell once another one is selected', async () => {
      await showCell(cellId('Cat', 'Bike'));

      store.setSelectedCellId(cellId('Dog', 'Bike'));
      await fixture.whenStable();

      expect(cellClasses()).not.toContain('tab-stop');
    });
  });

  describe('cellLabel', () => {
    const cellLabel = () => fixture.nativeElement.querySelector('.cell').getAttribute('aria-label');

    it('should name the row and column the cell sits between', async () => {
      await showCell(cellId('Cat', 'Bike'));

      expect(cellLabel()).toBe('row Cat column Bike');
    });

    it('should read the row option before the column one', async () => {
      await showCell(cellId('Dog', 'Canoe'));

      expect(cellLabel()).toBe('row Dog column Canoe');
    });

    it('should end on the value once the cell shows one', async () => {
      store.updateCell(cellId('Cat', 'Bike'), {userValue: CellText.O});
      await showCell(cellId('Cat', 'Bike'));

      expect(cellLabel()).toBe('row Cat column Bike value O');
    });

    it('should follow a deduced value the user never entered', async () => {
      store.updateCell(cellId('Cat', 'Bike'), {userValue: CellText.O});
      await showCell(cellId('Dog', 'Bike'));

      expect(cellLabel()).toBe('row Dog column Bike value X');
    });

    it('should call the value invalid once the grid contradicts it', async () => {
      store.updateCell(cellId('Cat', 'Bike'), {userValue: CellText.O});
      await showCell(cellId('Dog', 'Bike'));

      await clickCell();

      expect(cellLabel()).toBe('row Dog column Bike invalid value O');
    });
  });

  describe('the selected cell', () => {
    it('should take the keyboard when the cell is focused', async () => {
      fixture.nativeElement.querySelector('.cell').focus();
      await fixture.whenStable();

      expect(store.selectedCellId?.()).toBe(store.cells()[0].id);
    });

    it('should be false while the keyboard is on another cell', async () => {
      store.setSelectedCellId(store.cells()[1].id);
      await fixture.whenStable();

      expect(component.isSelected()).toBe(false);
    });

    it('should be true once the keyboard is on this cell', async () => {
      store.setSelectedCellId(store.cells()[0].id);
      await fixture.whenStable();

      expect(component.isSelected()).toBe(true);
    });

    it('should move the keyboard onto the cell the store picks', async () => {
      store.setSelectedCellId(store.cells()[0].id);
      await fixture.whenStable();

      expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.cell'));
    });

    it('should light the row and column of the focused cell', async () => {
      fixture.nativeElement.querySelector('.cell').focus();
      await fixture.whenStable();

      expect(colorService.hoveredCellId()).toBe(store.cells()[0].id);
    });
  });

  describe('the template', () => {
    it('should show the value of the cell', async () => {
      store.updateCell(cellId('Cat', 'Bike'), {userValue: CellText.O});
      await showCell(cellId('Cat', 'Bike'));

      expect(fixture.nativeElement.querySelector('.cell').textContent.trim()).toBe(CellText.O);
    });

    it('should move an empty cell on to an X when it is clicked', async () => {
      await clickCell();

      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.X);
    });

    it('should leave the cell alone when a button other than the primary one is clicked', async () => {
      await clickCell(SECONDARY_POINTER_BUTTON);

      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.EMPTY);
    });

    it('should hand the clicked cell the keyboard', async () => {
      await clickCell();

      expect(store.selectedCellId?.()).toBe(store.cells()[0].id);
    });

    it('should put the focus on the clicked cell', async () => {
      await clickCell();

      expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.cell'));
    });

    it('should mark the clicked cell selected', async () => {
      await clickCell();

      expect(fixture.nativeElement.querySelector('.cell').classList).toContain('selected');
    });

    it('should leave an unselected cell unmarked', async () => {
      await showCell(cellId('Dog', 'Bike'));

      expect(fixture.nativeElement.querySelector('.cell').classList).not.toContain('selected');
    });

    it('should move an X on to an O', async () => {
      await clickCell();

      await clickCell();

      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.O);
    });

    it('should move an O back to empty', async () => {
      await clickCell();
      await clickCell();

      await clickCell();

      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.EMPTY);
    });

    it('should move on from the value the cell shows rather than the one it holds', async () => {
      store.updateCell(cellId('Cat', 'Bike'), {userValue: CellText.O});
      await showCell(cellId('Dog', 'Bike'));

      await clickCell();

      expect(store.invalidCellValues().get(cellId('Dog', 'Bike'))).toBe(CellText.O);
    });

    it('should mark the cell hovered on mouseenter', async () => {
      fixture.nativeElement.querySelector('.cell').dispatchEvent(new MouseEvent('mouseenter'));
      await fixture.whenStable();

      expect(colorService.hoveredCellId()).toBe(store.cells()[0].id);
    });

    it('should color the cell from the color service', () => {
      expect(component.hoverColor()).toBe(colorService.getCellColor(component.tile()));
    });
  });

  describe('recording moves', () => {
    it('should record the value on each side of the write', () => {
      component.updateCellValue(CellText.X);

      expect(store.undoStack()).toEqual([{
        moveFn: MoveFnEnum.UPDATE,
        moveArgs: {
          cellId: store.cells()[0].id,
          oldValue: CellText.EMPTY,
          oldInvalidValue: CellText.EMPTY,
          newValue: CellText.X,
          newInvalidValue: CellText.EMPTY,
          newlyValidCells: new Map()
        }
      }]);
    });

    it('should record every write on its own', () => {
      component.updateCellValue(CellText.X);

      component.updateCellValue(CellText.O);

      expect(store.undoStack().length).toBe(2);
    });
  });
});
