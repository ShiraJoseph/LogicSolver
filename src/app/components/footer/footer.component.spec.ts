import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FooterComponent} from './footer.component';
import {GridStore} from '../../store/store';
import {StoreService} from '../../services/store.service';
import {GRID_SEED} from '../../store/grid.token';
import {MOCK_SMALL_GRID_SEED} from '../../mocks/grid.mock';
import {CellText} from '../../types/tile.model';
import {TRANSLATION_PROVIDERS} from '../../app.config';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let store: InstanceType<typeof GridStore>;
  let storeService: StoreService;

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
