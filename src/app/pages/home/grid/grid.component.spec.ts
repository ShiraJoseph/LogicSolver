import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GridComponent} from './grid.component';
import {GridStore} from '../../../store/store';
import {StoreService} from '../../../services/store.service';
import {GRID_SEED} from '../../../store/grid.token';
import {MOCK_SMALL_GRID_SEED} from '../../../mocks/grid.mock';
import {CellText} from '../../../types/tile.model';
import {TRANSLATION_PROVIDERS} from '../../../app.config';

describe('GridComponent', () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;
  let store: InstanceType<typeof GridStore>;
  let storeService: StoreService;

  const pressKey = async (key: string, modifiers: Partial<KeyboardEventInit> = {}, target?: HTMLElement) => {
    (target ?? document).dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true, ...modifiers}));
    await fixture.whenStable();
  };

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

    it('should send tab off the last base-header into the cells', async () => {
      await pressKey('Tab', {}, headerInputs().at(-1));

      expect(document.activeElement).toBe(cellTabStop());
    });

    it('should leave tab alone on every other base-header', async () => {
      const tab = new KeyboardEvent('keydown', {key: 'Tab', bubbles: true, cancelable: true});

      headerInputs()[0].dispatchEvent(tab);

      expect(tab.defaultPrevented).toBe(false);
    });

    it('should send shift tab off a cell back to the last base-header', async () => {
      await pressKey('Tab', {shiftKey: true}, cellTabStop());

      expect(document.activeElement).toBe(headerInputs().at(-1));
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

    it('should leave shift tab alone on a base-header', () => {
      const tab = new KeyboardEvent('keydown', {key: 'Tab', shiftKey: true, bubbles: true, cancelable: true});

      headerInputs()[0].dispatchEvent(tab);

      expect(tab.defaultPrevented).toBe(false);
    });
  });

  describe('the template', () => {
    it('should render a tile for every tile the service builds', () => {
      expect(fixture.nativeElement.querySelectorAll('.tile').length).toBe(component.tileService.tiles().length);
    });

    it('should render a cell component for every cell', () => {
      expect(fixture.nativeElement.querySelectorAll('app-cell').length).toBe(27);
    });

    it('should render a base-header component for every base-header tile', () => {
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
  });

  describe('the undo and redo shortcuts', () => {
    beforeEach(async () => {
      fixture.nativeElement.querySelector('[data-tile-type="ADD_FEATURE"] button').click();
      await fixture.whenStable();
    });

    it('should walk the grid back on ctrl z', async () => {
      await pressKey('z', {ctrlKey: true});

      expect(store.featureCount()).toBe(3);
    });

    it('should walk the grid back on cmd z', async () => {
      await pressKey('z', {metaKey: true});

      expect(store.featureCount()).toBe(3);
    });

    it('should make the move again on ctrl shift z', async () => {
      await pressKey('z', {ctrlKey: true});

      await pressKey('z', {ctrlKey: true, shiftKey: true});

      expect(store.featureCount()).toBe(4);
    });

    it('should make the move again on ctrl y', async () => {
      await pressKey('z', {ctrlKey: true});

      await pressKey('y', {ctrlKey: true});

      expect(store.featureCount()).toBe(4);
    });

    it('should take an uppercase key the same way', async () => {
      await pressKey('Z', {ctrlKey: true});

      expect(store.featureCount()).toBe(3);
    });

    it('should ignore z on its own', async () => {
      await pressKey('z');

      expect(store.featureCount()).toBe(4);
    });

    it('should ignore a key it has no shortcut for', async () => {
      await pressKey('a', {ctrlKey: true});

      expect(store.canUndo()).toBe(true);
    });

    it('should leave the shortcut to the browser while a base-header is being typed in', async () => {
      await pressKey('z', {ctrlKey: true}, fixture.nativeElement.querySelector('input'));

      expect(store.featureCount()).toBe(4);
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

    it('should name the grid itself', () => {
      expect(fixture.nativeElement.querySelector('.grid').getAttribute('aria-label')).toBe('Logic Solver Grid');
    });

    it('should name the add option button, which shows only a plus', () => {
      expect(fixture.nativeElement.querySelector('[data-tile-type="ADD_OPTION"] button').getAttribute('aria-label'))
        .toBe('Add an option to every feature');
    });
  });
});
