import {ComponentFixture, TestBed} from '@angular/core/testing';

import {HomeComponent} from './home.component';
import {GridStore} from '../../store/store';
import {StoreService} from '../../services/store.service';
import {GRID_SEED} from '../../store/grid.token';
import {MOCK_SMALL_GRID_SEED} from '../../mocks/grid.mock';
import {TRANSLATION_PROVIDERS} from '../../app.config';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let store: InstanceType<typeof GridStore>;
  let storeService: StoreService;

  const pressKey = async (key: string, modifiers: Partial<KeyboardEventInit> = {}, target?: HTMLElement) => {
    (target ?? document).dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true, ...modifiers}));
    await fixture.whenStable();
  };

  const gridButton = (label: string): HTMLButtonElement =>
    [...fixture.nativeElement.querySelectorAll('.grid-buttons button')]
      .find((button: HTMLElement) => button.textContent!.trim() === label)!;

  const cellTabStop = (): HTMLButtonElement => fixture.nativeElement.querySelector('.cell.tab-stop');

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [TRANSLATION_PROVIDERS, {provide: GRID_SEED, useValue: MOCK_SMALL_GRID_SEED}]
    });
    storeService = TestBed.inject(StoreService);
    store = TestBed.inject(GridStore);

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('the page', () => {
    it('should hold the grid', () => {
      expect(fixture.nativeElement.querySelector('app-grid')).not.toBeNull();
    });

    it('should hold the buttons below the grid', () => {
      expect(fixture.nativeElement.querySelector('app-footer')).not.toBeNull();
    });
  });

  describe('the way out of the grid', () => {
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

    it('should let go of the selected cell on the way out', async () => {
      const cell = cellTabStop();
      cell.focus();
      await fixture.whenStable();

      await pressKey('Tab', {}, cell);

      expect(store.selectedCellId?.()).toBeUndefined();
    });
  });

  describe('the way back into the grid', () => {
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

    it('should leave tab alone when the grid holds no cell to move to', async () => {
      store.features().forEach(feature => storeService.deleteFeature(feature.id));
      await fixture.whenStable();
      const tab = new KeyboardEvent('keydown', {key: 'Tab', shiftKey: true, bubbles: true, cancelable: true});

      gridButton('Clear Cells').dispatchEvent(tab);

      expect(tab.defaultPrevented).toBe(false);
    });
  });
});
