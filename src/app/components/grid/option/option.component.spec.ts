import {ComponentFixture, TestBed} from '@angular/core/testing';

import {OptionComponent} from './option.component';
import {GridStore} from '../../../store/store';
import {StoreService} from '../../../services/store.service';
import {ColorService} from '../../../services/color.service';
import {GRID_SEED} from '../../../store/grid.token';
import {MOCK_SMALL_GRID_SEED} from '../../../mocks/grid.mock';
import {Tile, TileType} from '../../../types/tile.model';
import {OptionId} from '../../../types/entities.model';
import {TRANSLATION_PROVIDERS} from '../../../app.config';

describe('OptionComponent', () => {
  let component: OptionComponent;
  let fixture: ComponentFixture<OptionComponent>;
  let store: InstanceType<typeof GridStore>;
  let storeService: StoreService;
  let colorService: ColorService;

  const optionId = (name: string) => store.options().find(option => option.name === name)!.id;

  const showHeader = async (type: TileType, text: string, entityId?: OptionId) => {
    fixture.componentRef.setInput('tile', {text, cols: 1, rows: 1, type, entityId} as Tile);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [OptionComponent],
      providers: [TRANSLATION_PROVIDERS, {provide: GRID_SEED, useValue: MOCK_SMALL_GRID_SEED}]
    });
    storeService = TestBed.inject(StoreService);
    store = TestBed.inject(GridStore);
    colorService = TestBed.inject(ColorService);

    fixture = TestBed.createComponent(OptionComponent);
    component = fixture.componentInstance;
    await showHeader(TileType.TOP_OPTION_HEADER, 'Bike', optionId('Bike'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should draw a header', () => {
    expect(fixture.nativeElement.querySelector('app-header')).not.toBeNull();
  });

  describe('entityLabel', () => {
    it('should open with the feature name', () => {
      expect(component.entityLabel()).toBe('Vehicle option');
    });

    it('should be the bare word for a header with no entity', async () => {
      await showHeader(TileType.TOP_OPTION_HEADER, 'Bike');

      expect(component.entityLabel()).toBe('option');
    });
  });

  describe('color', () => {
    it('should take the background from the option', () => {
      expect(component.backgroundColor()).toBe(colorService.getOptionColor(component.tile()));
    });
  });

  describe('isVertical', () => {
    it('should be true for a top option header', () => {
      expect(component.isVertical()).toBe(true);
    });

    it('should be false for a left option header', async () => {
      await showHeader(TileType.LEFT_OPTION_HEADER, 'Bike', optionId('Bike'));

      expect(component.isVertical()).toBe(false);
    });
  });

  describe('isDeleteDisabled', () => {
    it('should be false while three options are left', () => {
      expect(component.isDeleteDisabled()).toBe(false);
    });

    it('should be true once only two are left', () => {
      storeService.deleteOption(optionId('Canoe'));

      expect(component.isDeleteDisabled()).toBe(true);
    });
  });

  describe('updateOption', () => {
    it('should write the new name into state', () => {
      component.updateOption('Scooter');

      expect(store.optionById(optionId('Scooter'))).toBeDefined();
    });

    it('should return the option id for the move record', () => {
      const id = optionId('Bike');

      expect(component.updateOption('Scooter')).toEqual({optionId: id});
    });
  });

  describe('deleteOption', () => {
    it('should take the option out of every feature', () => {
      component.deleteOption();

      expect(store.optionCountPerFeature()).toBe(2);
    });

    it('should return the options and their grid position', () => {
      const moveArgs = component.deleteOption();

      expect(moveArgs.options!.length).toBe(3);
      expect(moveArgs.optionIndex).toBe(0);
      expect(moveArgs.optionCountPerFeature).toBe(3);
    });
  });

  describe('the label a screen reader reads', () => {
    it('should name the field after the feature', () => {
      expect(fixture.nativeElement.querySelector('input').getAttribute('aria-label')).toBe('Vehicle option name');
    });
  });
});
