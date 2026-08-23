import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GridComponent} from './grid.component';
import {GridStore} from '../../store/store';
import {StoreService} from '../../services/store.service';
import {GRID_SEED} from '../../store/grid.token';
import {MOCK_SMALL_GRID_SEED} from '../../mocks/grid.mock';
import {CellText} from '../../types/tile.model';
import {NON_CELL_COLUMN_COUNT} from '../../constants/grid.const';

describe('GridComponent', () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;
  let store: InstanceType<typeof GridStore>;
  let storeService: StoreService;

  const gridButton = (label: string): HTMLButtonElement =>
    [...fixture.nativeElement.querySelectorAll('.grid-buttons button')]
      .find((button: HTMLElement) => button.textContent!.trim() === label)!;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [GridComponent],
      providers: [{provide: GRID_SEED, useValue: MOCK_SMALL_GRID_SEED}]
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

  describe('columnCount', () => {
    it('should give a column to every option of every feature after the first', () => {
      expect(component.columnCount()).toBe(3 * 2 + NON_CELL_COLUMN_COUNT);
    });

    it('should grow when a feature is added', () => {
      storeService.addNewFeature('Sport');

      expect(component.columnCount()).toBe(3 * 3 + NON_CELL_COLUMN_COUNT);
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
      expect(fixture.nativeElement.querySelectorAll('app-header').length).toBe(16);
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
});
