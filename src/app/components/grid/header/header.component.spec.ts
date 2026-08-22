import {ComponentFixture, TestBed} from '@angular/core/testing';

import {HeaderComponent} from './header.component';
import {GridStore} from '../../../store/store';
import {StoreService} from '../../../store/store.service';
import {ColorService} from '../../../services/color.service';
import {GRID_SEED} from '../../../store/grid.token';
import {MOCK_SMALL_GRID_SEED} from '../../../mocks/grid.mock';
import {Tile, TileType} from '../../../types/tile.model';
import {FeatureId, OptionId} from '../../../types/entities.model';
import {BLACK} from '../../../constants/colors.const';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let store: InstanceType<typeof GridStore>;
  let storeService: StoreService;
  let colorService: ColorService;

  const optionId = (name: string) => store.options().find(option => option.name === name)!.id;
  const featureId = (name: string) => store.features().find(feature => feature.name === name)!.id;

  const showHeader = async (type: TileType, text: string, entityId?: FeatureId | OptionId) => {
    fixture.componentRef.setInput('tile', {text, cols: 1, rows: 1, type, entityId} as Tile);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [{provide: GRID_SEED, useValue: MOCK_SMALL_GRID_SEED}]
    });
    storeService = TestBed.inject(StoreService);
    store = TestBed.inject(GridStore);
    colorService = TestBed.inject(ColorService);

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    await showHeader(TileType.TOP_FEATURE_HEADER, 'Vehicle', featureId('Vehicle'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isFeature', () => {
    it('should be true for a top feature header', async () => {
      await showHeader(TileType.TOP_FEATURE_HEADER, 'Vehicle', featureId('Vehicle'));

      expect(component.isFeature()).toBe(true);
    });

    it('should be true for a left feature header', async () => {
      await showHeader(TileType.LEFT_FEATURE_HEADER, 'Pet', featureId('Pet'));

      expect(component.isFeature()).toBe(true);
    });

    it('should be false for an option header', async () => {
      await showHeader(TileType.TOP_OPTION_HEADER, 'Bike', optionId('Bike'));

      expect(component.isFeature()).toBe(false);
    });
  });

  describe('isVertical', () => {
    it('should be true for a top option header', async () => {
      await showHeader(TileType.TOP_OPTION_HEADER, 'Bike', optionId('Bike'));

      expect(component.isVertical()).toBe(true);
    });

    it('should be true for a left feature header', async () => {
      await showHeader(TileType.LEFT_FEATURE_HEADER, 'Pet', featureId('Pet'));

      expect(component.isVertical()).toBe(true);
    });

    it('should be false for a top feature header', () => {
      expect(component.isVertical()).toBe(false);
    });
  });

  describe('color', () => {
    it('should take a feature header background from its position', () => {
      expect(component.backgroundColor()).toBe(colorService.getFeatureColor(1));
    });

    it('should take a feature header label color from its position', () => {
      expect(component.textColor()).toBe(colorService.getFeatureTextColor(1));
    });

    it('should take an option header background from the option', async () => {
      await showHeader(TileType.TOP_OPTION_HEADER, 'Bike', optionId('Bike'));

      expect(component.backgroundColor()).toBe(colorService.getOptionColor(component.tile()));
    });

    it('should leave an option header label uncolored', async () => {
      await showHeader(TileType.TOP_OPTION_HEADER, 'Bike', optionId('Bike'));

      expect(component.textColor()).toEqual(BLACK);
    });
  });

  describe('the minus button', () => {
    it('should stay hidden until the header is hovered', () => {
      expect(component.shouldShowMinus()).toBe(false);
      expect(fixture.nativeElement.querySelector('.delete')).toBeNull();
    });

    it('should appear on hover', async () => {
      fixture.nativeElement.querySelector('.header').dispatchEvent(new MouseEvent('mouseover'));
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.delete')).not.toBeNull();
    });

    it('should disappear again on mouseleave', async () => {
      component.showMinus();
      await fixture.whenStable();

      fixture.nativeElement.querySelector('.header').dispatchEvent(new MouseEvent('mouseleave'));
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.delete')).toBeNull();
    });

    it('should stay visible while the pointer is on the button itself', async () => {
      component.showMinus();
      await fixture.whenStable();

      fixture.nativeElement.querySelector('.delete').dispatchEvent(new MouseEvent('mouseover'));
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.delete')).not.toBeNull();
    });

    it('should disappear when the button loses focus', async () => {
      component.showMinus();
      await fixture.whenStable();

      fixture.nativeElement.querySelector('.delete').dispatchEvent(new FocusEvent('blur'));
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.delete')).toBeNull();
    });

    it('should delete the header when clicked', async () => {
      component.showMinus();
      await fixture.whenStable();

      fixture.nativeElement.querySelector('.delete').click();
      await fixture.whenStable();

      expect(store.features().map(feature => feature.name)).toEqual(['Pet', 'Name']);
    });

    it('should be disabled when the last removable header is left', async () => {
      storeService.deleteFeature(featureId('Name'));
      component.showMinus();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('.delete').disabled).toBe(true);
    });
  });

  describe('isDeleteDisabled', () => {
    it('should be false while a feature can still be spared', () => {
      expect(component.isDeleteDisabled()).toBe(false);
    });

    it('should be true once only two features are left', () => {
      storeService.deleteFeature(featureId('Name'));

      expect(component.isDeleteDisabled()).toBe(true);
    });

    it('should be false for an option while three are left', async () => {
      await showHeader(TileType.TOP_OPTION_HEADER, 'Bike', optionId('Bike'));

      expect(component.isDeleteDisabled()).toBe(false);
    });

    it('should be true for an option once only two are left', async () => {
      storeService.deleteOption(optionId('Bike'));
      await showHeader(TileType.TOP_OPTION_HEADER, 'Canoe', optionId('Canoe'));

      expect(component.isDeleteDisabled()).toBe(true);
    });
  });

  describe('updateHeader', () => {
    const rename = (name: string) => component.updateHeader({target: {value: name}} as unknown as Event);

    it('should rename the feature', () => {
      rename('Transport');

      expect(store.featureById(featureId('Transport'))).toBeDefined();
    });

    it('should rename the option', async () => {
      await showHeader(TileType.TOP_OPTION_HEADER, 'Bike', optionId('Bike'));

      rename('Scooter');

      expect(store.optionById(optionId('Scooter'))).toBeDefined();
    });

    it('should do nothing for a header with no entity', async () => {
      await showHeader(TileType.TOP_FEATURE_HEADER, 'Vehicle');

      rename('Transport');

      expect(store.features().map(feature => feature.name)).toEqual(['Pet', 'Vehicle', 'Name']);
    });

    it('should do nothing when the name has not changed', () => {
      rename('Vehicle');

      expect(store.features().map(feature => feature.name)).toEqual(['Pet', 'Vehicle', 'Name']);
    });

    it('should hide the minus button', () => {
      component.showMinus();

      rename('Transport');

      expect(component.shouldShowMinus()).toBe(false);
    });

    it('should rename on enter', async () => {
      const input = fixture.nativeElement.querySelector('input');
      input.value = 'Transport';

      input.dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter'}));
      await fixture.whenStable();

      expect(store.features().map(feature => feature.name)).toEqual(['Pet', 'Transport', 'Name']);
    });
  });

  describe('deleteHeader', () => {
    it('should delete the feature', () => {
      component.deleteHeader();

      expect(store.features().map(feature => feature.name)).toEqual(['Pet', 'Name']);
    });

    it('should delete the option from every feature', async () => {
      await showHeader(TileType.TOP_OPTION_HEADER, 'Bike', optionId('Bike'));

      component.deleteHeader();

      expect(store.optionCountPerFeature()).toBe(2);
    });

    it('should do nothing for a header with no entity', async () => {
      await showHeader(TileType.TOP_FEATURE_HEADER, 'Vehicle');

      component.deleteHeader();

      expect(store.featureCount()).toBe(3);
    });
  });
});
