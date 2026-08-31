import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GridComponent} from './grid.component';
import {GridStore} from '../../store/store';
import {StoreService} from '../../services/store.service';
import {GRID_SEED} from '../../store/grid.token';
import {MOCK_SMALL_GRID_SEED} from '../../mocks/grid.mock';
import {CellText} from '../../types/tile.model';
import {TRANSLATION_PROVIDERS} from '../../app.config';

describe('GridComponent', () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;
  let store: InstanceType<typeof GridStore>;
  let storeService: StoreService;

  const pressKey = async (key: string, modifiers: Partial<KeyboardEventInit> = {}, target?: HTMLElement) => {
    (target ?? document).dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true, ...modifiers}));
    await fixture.whenStable();
  };

  const gridButton = (label: string): HTMLButtonElement =>
    [...fixture.nativeElement.querySelectorAll('.grid-buttons button')]
      .find((button: HTMLElement) => button.textContent!.trim() === label)!;

  const headerInputs = (): Array<HTMLInputElement> => [...fixture.nativeElement.querySelectorAll('.grid input')];

  const cellTabStop = (): HTMLButtonElement => fixture.nativeElement.querySelector('.cell.tab-stop');

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [GridComponent],
      providers: [TRANSLATION_PROVIDERS, {provide: GRID_SEED, useValue: MOCK_SMALL_GRID_SEED}]
    });
    storeService = TestBed.inject(StoreService);
    store = TestBed.inject(GridStore);

    fixture = TestBed.createComponent(GridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('the tab order', () => {
    it('should keep every cell but one out of the tab stops', () => {
      const tabbableCells = [...fixture.nativeElement.querySelectorAll('.cell')]
        .filter((cell: HTMLElement) => cell.getAttribute('tabindex') !== '-1');

      expect(tabbableCells.length).toBe(0);
    });

    it('should send tab off the last header into the cells', async () => {
      await pressKey('Tab', {}, headerInputs().at(-1));

      expect(document.activeElement).toBe(cellTabStop());
    });

    it('should leave tab alone on every other header', async () => {
      const tab = new KeyboardEvent('keydown', {key: 'Tab', bubbles: true, cancelable: true});

      headerInputs()[0].dispatchEvent(tab);

      expect(tab.defaultPrevented).toBe(false);
    });

    it('should send tab off a cell on to the buttons below the grid', async () => {
      await pressKey('Tab', {}, cellTabStop());

      expect(document.activeElement).toBe(gridButton('Clear Cells'));
    });

    it('should send tab off a cell on to undo once there is a move to walk back', async () => {
      gridButton('Clear Cells').click();
      await fixture.whenStable();

      await pressKey('Tab', {}, cellTabStop());

      expect(document.activeElement).toBe(gridButton('Undo'));
    });

    it('should send shift tab off a cell back to the last header', async () => {
      await pressKey('Tab', {shiftKey: true}, cellTabStop());

      expect(document.activeElement).toBe(headerInputs().at(-1));
    });

    it('should let go of the selected cell on the way out', async () => {
      const cell = cellTabStop();
      cell.focus();
      await fixture.whenStable();

      await pressKey('Tab', {}, cell);

      expect(store.selectedCellId?.()).toBeUndefined();
    });

    it('should let go of the selected cell on the way back out', async () => {
      const cell = cellTabStop();
      cell.focus();
      await fixture.whenStable();

      await pressKey('Tab', {shiftKey: true}, cell);

      expect(store.selectedCellId?.()).toBeUndefined();
    });

    it('should hold on to the selected cell while tabbing between headers', async () => {
      store.setSelectedCellId(store.cells()[0].id);
      await fixture.whenStable();

      await pressKey('Tab', {}, headerInputs()[0]);

      expect(store.selectedCellId?.()).toBe(store.cells()[0].id);
    });

    it('should come back to the cell the keyboard was on last', async () => {
      const cells = fixture.nativeElement.querySelectorAll('.cell');
      cells[4].focus();
      await fixture.whenStable();

      await pressKey('Tab', {}, cells[4]);
      await fixture.whenStable();

      expect(cellTabStop()).toBe(cells[4]);
    });

    it('should leave shift tab alone on a header', () => {
      const tab = new KeyboardEvent('keydown', {key: 'Tab', shiftKey: true, bubbles: true, cancelable: true});

      headerInputs()[0].dispatchEvent(tab);

      expect(tab.defaultPrevented).toBe(false);
    });

    it('should leave tab alone when the grid holds no cell to move to', async () => {
      store.features().forEach(feature => storeService.deleteFeature(feature.id));
      await fixture.whenStable();
      const tab = new KeyboardEvent('keydown', {key: 'Tab', shiftKey: true, bubbles: true, cancelable: true});

      gridButton('Clear Cells').dispatchEvent(tab);

      expect(tab.defaultPrevented).toBe(false);
    });

    it('should send shift tab off the first button below the grid back into the cells', async () => {
      await pressKey('Tab', {shiftKey: true}, gridButton('Clear Cells'));

      expect(document.activeElement).toBe(cellTabStop());
    });

    it('should leave shift tab alone on a button that is not the first one below the grid', async () => {
      gridButton('Clear Cells').click();
      await fixture.whenStable();

      await pressKey('Tab', {shiftKey: true}, gridButton('Redo'));

      expect(document.activeElement).not.toBe(cellTabStop());
    });
  });

  describe('the template', () => {
    it('should render a tile for every tile the service builds', () => {
      expect(fixture.nativeElement.querySelectorAll('.tile').length).toBe(component.tileService.tiles().length);
    });

    it('should render a cell component for every cell', () => {
      expect(fixture.nativeElement.querySelectorAll('app-cell').length).toBe(27);
    });

    it('should render a header component for every header tile', () => {
      expect(fixture.nativeElement.querySelectorAll('app-feature').length +
        fixture.nativeElement.querySelectorAll('app-option').length).toBe(16);
    });

    it('should render an add button for features and one for options', async () => {
      expect(fixture.nativeElement.querySelectorAll('button.other').length).toBe(2);
    });

    it('should add a feature when the add feature button is clicked', async () => {
      fixture.nativeElement.querySelector('[data-tile-type="ADD_FEATURE"] button').click();
      await fixture.whenStable();

      expect(store.featureCount()).toBe(4);
    });

    it('should add an option to every feature when the add option button is clicked', async () => {
      fixture.nativeElement.querySelector('[data-tile-type="ADD_OPTION"] button').click();
      await fixture.whenStable();

      expect(store.optionCountPerFeature()).toBe(4);
    });

    it('should empty every cell when the clear button is clicked', async () => {
      store.updateCell(store.cells()[0].id, {userValue: CellText.X});

      fixture.nativeElement.querySelector('.clear-button').click();
      await fixture.whenStable();

      expect(store.cells().every(cell => cell.userValue === CellText.EMPTY)).toBe(true);
    });

    it('should carry the border classes the tiles were built with', () => {
      const bordered = component.tileService.tiles().findIndex(tile => tile.borders);

      const renderedTile = fixture.nativeElement.querySelectorAll('.tile')[bordered];

      component.tileService.tiles()[bordered].borders!.split(' ')
        .forEach(border => expect(renderedTile.classList).toContain(border));
    });
  });
  describe('recording moves', () => {
    it('should record one move when a feature is added', async () => {
      fixture.nativeElement.querySelector('[data-tile-type="ADD_FEATURE"] button').click();
      await fixture.whenStable();

      expect(store.undoStack().length).toBe(1);
    });

    it('should record one move when an option is added to every feature', async () => {
      fixture.nativeElement.querySelector('[data-tile-type="ADD_OPTION"] button').click();
      await fixture.whenStable();

      expect(store.undoStack().length).toBe(1);
    });

    it('should record the cells as they stood before they were cleared', async () => {
      store.updateCell(store.cells()[0].id, {userValue: CellText.X});

      gridButton('Clear Cells').click();
      await fixture.whenStable();

      expect(store.undoStack().length).toBe(1);
      expect(store.canUndo()).toBe(true);
    });
  });

  describe('the undo and redo buttons', () => {
    it('should stay disabled until a move is made', () => {
      expect(gridButton('Undo').disabled).toBe(true);
      expect(gridButton('Redo').disabled).toBe(true);
    });

    it('should offer an undo once a move is made', async () => {
      storeService.addNewFeature('Sport');
      gridButton('Clear Cells').click();
      await fixture.whenStable();

      expect(gridButton('Undo').disabled).toBe(false);
    });

    it('should walk the newest move back when undo is clicked', async () => {
      store.updateCell(store.cells()[0].id, {userValue: CellText.X});
      gridButton('Clear Cells').click();
      await fixture.whenStable();

      gridButton('Undo').click();
      await fixture.whenStable();

      expect(store.cells()[0].userValue).toBe(CellText.X);
    });

    it('should offer a redo once a move is walked back', async () => {
      gridButton('Clear Cells').click();
      await fixture.whenStable();

      gridButton('Undo').click();
      await fixture.whenStable();

      expect(gridButton('Redo').disabled).toBe(false);
    });

    it('should make the move again when redo is clicked', async () => {
      store.updateCell(store.cells()[0].id, {userValue: CellText.X});
      gridButton('Clear Cells').click();
      await fixture.whenStable();
      gridButton('Undo').click();
      await fixture.whenStable();

      gridButton('Redo').click();
      await fixture.whenStable();

      expect(store.cells()[0].userValue).toBe(CellText.EMPTY);
    });
  });
  describe('the undo and redo shortcuts', () => {
    beforeEach(async () => {
      store.updateCell(store.cells()[0].id, {userValue: CellText.X});
      gridButton('Clear Cells').click();
      await fixture.whenStable();
    });

    it('should walk the grid back on ctrl z', async () => {
      await pressKey('z', {ctrlKey: true});

      expect(store.cells()[0].userValue).toBe(CellText.X);
    });

    it('should walk the grid back on cmd z', async () => {
      await pressKey('z', {metaKey: true});

      expect(store.cells()[0].userValue).toBe(CellText.X);
    });

    it('should make the move again on ctrl shift z', async () => {
      await pressKey('z', {ctrlKey: true});

      await pressKey('z', {ctrlKey: true, shiftKey: true});

      expect(store.cells()[0].userValue).toBe(CellText.EMPTY);
    });

    it('should make the move again on ctrl y', async () => {
      await pressKey('z', {ctrlKey: true});

      await pressKey('y', {ctrlKey: true});

      expect(store.cells()[0].userValue).toBe(CellText.EMPTY);
    });

    it('should take an uppercase key the same way', async () => {
      await pressKey('Z', {ctrlKey: true});

      expect(store.cells()[0].userValue).toBe(CellText.X);
    });

    it('should ignore z on its own', async () => {
      await pressKey('z');

      expect(store.cells()[0].userValue).toBe(CellText.EMPTY);
    });

    it('should ignore a key it has no shortcut for', async () => {
      await pressKey('a', {ctrlKey: true});

      expect(store.canUndo()).toBe(true);
    });

    it('should leave the shortcut to the browser while a header is being typed in', async () => {
      await pressKey('z', {ctrlKey: true}, fixture.nativeElement.querySelector('input'));

      expect(store.cells()[0].userValue).toBe(CellText.EMPTY);
    });

    it('should stop the browser handling a shortcut it took', async () => {
      const event = new KeyboardEvent('keydown', {key: 'z', ctrlKey: true, bubbles: true, cancelable: true});

      document.dispatchEvent(event);
      await fixture.whenStable();

      expect(event.defaultPrevented).toBe(true);
    });
  });
  describe('the labels a screen reader reads', () => {
    it('should name the add feature button, which shows only a plus', () => {
      expect(fixture.nativeElement.querySelector('[data-tile-type="ADD_FEATURE"] button').getAttribute('aria-label'))
        .toBe('Add a feature');
    });

    it('should name the add option button, which shows only a plus', () => {
      expect(fixture.nativeElement.querySelector('[data-tile-type="ADD_OPTION"] button').getAttribute('aria-label'))
        .toBe('Add an option to every feature');
    });
  });

  describe('the invalid grid tag', () => {
    const invalidTag = () => fixture.nativeElement.querySelector('.invalid-tag');

    const optionId = (name: string) => store.options().find(option => option.name === name)!.id;

    const cellId = (nameA: string, nameB: string) => store.cellByOptions(optionId(nameA), optionId(nameB))!.id;

    it('should stay off the bottom bar while every value on the grid stands', () => {
      expect(invalidTag()).toBeNull();
    });

    it('should show once the grid is holding a value it contradicts', async () => {
      storeService.updateCellValue(cellId('Cat', 'Bike'), CellText.O);
      storeService.updateCellValue(cellId('Dog', 'Bike'), CellText.O);
      await fixture.whenStable();

      expect(invalidTag().textContent.trim()).toBe('Invalid grid');
    });

    it('should go once the last held-aside value is back on the grid', async () => {
      storeService.updateCellValue(cellId('Cat', 'Bike'), CellText.O);
      storeService.updateCellValue(cellId('Dog', 'Bike'), CellText.O);

      storeService.updateCellValue(cellId('Cat', 'Bike'), CellText.EMPTY);
      await fixture.whenStable();

      expect(invalidTag()).toBeNull();
    });
  });
});
