import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FeatureComponent} from './feature.component';
import {GridStore} from '../../../store/store';
import {StoreService} from '../../../services/store.service';
import {ColorService} from '../../../services/color.service';
import {GRID_SEED} from '../../../store/grid.token';
import {MOCK_SMALL_GRID_SEED} from '../../../mocks/grid.mock';
import {Tile, TileType} from '../../../types/tile.model';
import {FeatureId} from '../../../types/entities.model';
import {TRANSLATION_PROVIDERS} from '../../../app.config';

describe('FeatureComponent', () => {
  let component: FeatureComponent;
  let fixture: ComponentFixture<FeatureComponent>;
  let store: InstanceType<typeof GridStore>;
  let storeService: StoreService;
  let colorService: ColorService;

  const featureId = (name: string) => store.features().find(feature => feature.name === name)!.id;

  const showHeader = async (type: TileType, text: string, entityId?: FeatureId) => {
    fixture.componentRef.setInput('tile', {text, cols: 1, rows: 1, type, entityId} as Tile);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [FeatureComponent],
      providers: [TRANSLATION_PROVIDERS, {provide: GRID_SEED, useValue: MOCK_SMALL_GRID_SEED}]
    });
    storeService = TestBed.inject(StoreService);
    store = TestBed.inject(GridStore);
    colorService = TestBed.inject(ColorService);

    fixture = TestBed.createComponent(FeatureComponent);
    component = fixture.componentInstance;
    await showHeader(TileType.TOP_FEATURE_HEADER, 'Vehicle', featureId('Vehicle'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should draw a header', () => {
    expect(fixture.nativeElement.querySelector('app-header')).not.toBeNull();
  });

  describe('featureIndex', () => {
    it('should be the grid position of the feature', () => {
      expect(component.featureIndex()).toBe(1);
    });

    it('should be undefined for a header with no entity', async () => {
      await showHeader(TileType.TOP_FEATURE_HEADER, 'Vehicle');

      expect(component.featureIndex()).toBeUndefined();
    });
  });

  describe('color', () => {
    it('should take the background from its position', () => {
      expect(component.backgroundColor()).toBe(colorService.getFeatureColor(1));
    });

    it('should take the label color from its position', () => {
      expect(component.textColor()).toBe(colorService.getFeatureTextColor(1));
    });
  });

  describe('isVertical', () => {
    it('should be true for a left feature header', async () => {
      await showHeader(TileType.LEFT_FEATURE_HEADER, 'Pet', featureId('Pet'));

      expect(component.isVertical()).toBe(true);
    });

    it('should be false for a top feature header', () => {
      expect(component.isVertical()).toBe(false);
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
  });

  describe('updateFeature', () => {
    it('should write the new name into state', () => {
      component.updateFeature('Transport');

      expect(store.features().map(feature => feature.name)).toEqual(['Pet', 'Transport', 'Name']);
    });

    it('should return the feature id for the move record', () => {
      const id = featureId('Vehicle');

      expect(component.updateFeature('Transport')).toEqual({featureId: id});
    });
  });

  describe('deleteFeature', () => {
    it('should take the feature out of state', () => {
      component.deleteFeature();

      expect(store.features().map(feature => feature.name)).toEqual(['Pet', 'Name']);
    });

    it('should return the feature and its grid position', () => {
      const moveArgs = component.deleteFeature();

      expect(moveArgs.features!.map(feature => feature.name)).toEqual(['Vehicle']);
      expect(moveArgs.featureIndex).toBe(1);
    });
  });

  describe('the label a screen reader reads', () => {
    it('should name the field after the feature', () => {
      expect(fixture.nativeElement.querySelector('input').getAttribute('aria-label')).toBe('feature name');
    });
  });
});
