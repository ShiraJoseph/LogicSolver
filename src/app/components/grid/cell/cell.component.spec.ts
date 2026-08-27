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

describe('CellComponent', () => {
  let component: CellComponent;
  let fixture: ComponentFixture<CellComponent>;
  let store: InstanceType<typeof GridStore>;
  let colorService: ColorService;

  const optionId = (name: string) => store.options().find(option => option.name === name)!.id;
  const cellId = (nameA: string, nameB: string) => store.cellByOptions(optionId(nameA), optionId(nameB))!.id;

  const clickButton = (label: string) =>
    [...fixture.nativeElement.querySelectorAll('button')]
      .find((button: HTMLElement) => button.textContent!.trim() === label)!.click();

  const showCell = async (id: CellId) => {
    fixture.componentRef.setInput('tile', {...CELL_TILE, entityId: id});
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

  describe('isSelected', () => {
    it('should be false while another cell is selected', () => {
      store.setSelectedCellId(store.cells()[1].id);

      expect(component.isSelected()).toBe(false);
    });

    it('should be true once this cell is selected', () => {
      store.setSelectedCellId(store.cells()[0].id);

      expect(component.isSelected()).toBe(true);
    });
  });

  describe('selectCell', () => {
    it('should select this cell', () => {
      component.selectCell();

      expect(store.selectedCellId?.()).toBe(store.cells()[0].id);
    });
  });

  describe('deselectCell', () => {
    it('should clear the selection', () => {
      component.selectCell();

      component.deselectCell();

      expect(store.selectedCellId?.()).toBeUndefined();
    });

    it('should leave the value of the cell alone', () => {
      component.selectCell();

      component.deselectCell();

      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.EMPTY);
    });
  });

  describe('updateCell', () => {
    it('should write the value onto the cell', () => {
      component.updateCell(component.tile(), CellText.X);

      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.X);
    });

    it('should clear the selection', () => {
      component.selectCell();

      component.updateCell(component.tile(), CellText.X);

      expect(store.selectedCellId?.()).toBeUndefined();
    });

    it('should empty the cell when given no value', () => {
      component.updateCell(component.tile(), CellText.X);

      component.updateCell(component.tile(), CellText.EMPTY);

      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.EMPTY);
    });
  });

  describe('the template', () => {
    it('should show the value of an unselected cell', async () => {
      await showCell(cellId('Cat', 'Bike'));
      store.updateCell(cellId('Cat', 'Bike'), {userValue: CellText.O});
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.cell-inactive').textContent.trim()).toBe(CellText.O);
    });

    it('should show the buttons of a selected cell', async () => {
      component.selectCell();
      await fixture.whenStable();

      expect([...fixture.nativeElement.querySelectorAll('button')].map((button: HTMLElement) => button.textContent!.trim()))
        .toEqual(['O', 'X', 'clear', 'x']);
    });

    it('should select the cell when it is clicked', async () => {
      fixture.nativeElement.querySelector('.cell-inactive').click();
      await fixture.whenStable();

      expect(store.selectedCellId?.()).toBe(store.cells()[0].id);
    });

    it('should mark the cell hovered on mouseenter', async () => {
      fixture.nativeElement.querySelector('.cell-inactive').dispatchEvent(new MouseEvent('mouseenter'));
      await fixture.whenStable();

      expect(colorService.hoveredCellId()).toBe(store.cells()[0].id);
    });

    it('should write an O when the O button is clicked', async () => {
      component.selectCell();
      await fixture.whenStable();

      clickButton('O');
      await fixture.whenStable();

      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.O);
      expect(store.selectedCellId?.()).toBeUndefined();
    });

    it('should write an X when the X button is clicked', async () => {
      component.selectCell();
      await fixture.whenStable();

      clickButton('X');
      await fixture.whenStable();

      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.X);
    });

    it('should empty the cell when the clear button is clicked', async () => {
      store.updateCell(store.cells()[0].id, {userValue: CellText.X});
      component.selectCell();
      await fixture.whenStable();

      clickButton('clear');
      await fixture.whenStable();

      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.EMPTY);
    });

    it('should close a selected cell without writing when the x button is clicked', async () => {
      component.selectCell();
      await fixture.whenStable();

      clickButton('x');
      await fixture.whenStable();

      expect(store.selectedCellId?.()).toBeUndefined();
      expect(store.cellById(store.cells()[0].id)!.userValue).toBe(CellText.EMPTY);
    });

    it('should mark a selected cell hovered on mouseenter', async () => {
      component.selectCell();
      await fixture.whenStable();

      fixture.nativeElement.querySelector('.cell-active').dispatchEvent(new MouseEvent('mouseenter'));
      await fixture.whenStable();

      expect(colorService.hoveredCellId()).toBe(store.cells()[0].id);
    });

    it('should color the cell from the color service', () => {
      expect(component.hoverColor()).toBe(colorService.getCellColor(component.tile()));
    });
  });
  describe('recording moves', () => {
    it('should record the value on each side of the write', () => {
      component.updateCell(component.tile(), CellText.X);

      expect(store.undoStack()).toEqual([{
        moveFn: MoveFnEnum.UPDATE,
        moveArgs: {cellId: store.cells()[0].id, oldValue: CellText.EMPTY, newValue: CellText.X}
      }]);
    });

    it('should record every write on its own', () => {
      component.updateCell(component.tile(), CellText.X);
      component.updateCell(component.tile(), CellText.EMPTY);

      expect(store.undoStack().length).toBe(2);
    });
  });
});
