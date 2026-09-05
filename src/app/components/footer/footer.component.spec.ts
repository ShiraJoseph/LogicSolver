import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FooterComponent} from './footer.component';
import {GridStore} from '../../store/store';
import {StoreService} from '../../services/store.service';
import {GRID_SEED} from '../../store/grid.token';
import {MOCK_SMALL_GRID_SEED} from '../../mocks/grid.mock';
import {CellText} from '../../types/tile.model';
import {TRANSLATION_PROVIDERS} from '../../app.config';
import {SOLUTION_LIMIT} from '../../constants/grid.const';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let store: InstanceType<typeof GridStore>;
  let storeService: StoreService;

  const optionId = (name: string) => store.options().find(option => option.name === name)!.id;

  const gridButton = (label: string): HTMLButtonElement =>
    [...fixture.nativeElement.querySelectorAll('.grid-buttons button')]
      .find((button: HTMLElement) => button.textContent!.trim() === label)!;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [TRANSLATION_PROVIDERS, {provide: GRID_SEED, useValue: MOCK_SMALL_GRID_SEED}]
    });
    storeService = TestBed.inject(StoreService);
    store = TestBed.inject(GridStore);

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('the brute force button', () => {
    const bruteForceButton = (): HTMLButtonElement => fixture.nativeElement.querySelector('.brute-force');

    it('should name itself after what it does while the grid is still open', () => {
      expect(bruteForceButton().textContent!.trim()).toBe('Brute Force');
      expect(bruteForceButton().classList).not.toContain('no-single-solution');
    });

    it('should run the solver when it is clicked', async () => {
      bruteForceButton().click();
      await fixture.whenStable();

      expect(store.solutionCount()).toBeGreaterThan(SOLUTION_LIMIT);
    });

    it('should say in red that there are more solutions than it can name', async () => {
      bruteForceButton().click();
      await fixture.whenStable();

      expect(bruteForceButton().textContent!.trim()).toBe('More Than 5 Solutions');
      expect(bruteForceButton().classList).toContain('no-single-solution');
    });

    it('should name the number of solutions while there are few enough of them', async () => {
      ['Bike', 'Alice'].forEach(name =>
        storeService.updateCellValue(store.cellByOptions(optionId('Cat'), optionId(name))!.id, CellText.O));
      storeService.updateCellValue(store.cellByOptions(optionId('Bike'), optionId('Alice'))!.id, CellText.O);

      bruteForceButton().click();
      await fixture.whenStable();

      expect(bruteForceButton().textContent!.trim()).toBe('4 Solutions');
      expect(bruteForceButton().classList).toContain('no-single-solution');
    });

    it('should go back to naming what it does once the user changes a cell', async () => {
      bruteForceButton().click();
      await fixture.whenStable();

      storeService.updateCellValue(store.cells()[0].id, CellText.X);
      await fixture.whenStable();

      expect(bruteForceButton().textContent!.trim()).toBe('Brute Force');
      expect(bruteForceButton().classList).not.toContain('no-single-solution');
    });
  });

  describe('the clear button', () => {
    it('should empty every cell when it is clicked', async () => {
      store.updateCell(store.cells()[0].id, {userValue: CellText.X});

      fixture.nativeElement.querySelector('.clear-button').click();
      await fixture.whenStable();

      expect(store.cells().every(cell => cell.userValue === CellText.EMPTY)).toBe(true);
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

      expect(invalidTag().textContent.trim()).toBe('Invalid Grid');
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
