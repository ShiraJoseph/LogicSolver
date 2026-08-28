import {ComponentFixture, TestBed} from '@angular/core/testing';

import {HeaderComponent} from './header.component';
import {GridStore} from '../../../store/store';
import {GRID_SEED} from '../../../store/grid.token';
import {MOCK_SMALL_GRID_SEED} from '../../../mocks/grid.mock';
import {Tile, TileType} from '../../../types/tile.model';
import {FeatureId} from '../../../types/entities.model';
import {MoveArgs, MoveFnEnum} from '../../../types/move.model';
import {TRANSLATION_PROVIDERS} from '../../../app.config';

/** The feature id the fake rename returns. */
const RENAMED_ID = 'renamed-feature' as FeatureId;

/** The move args the fake delete returns. */
const DELETED_MOVE_ARGS = {features: [], featureIndex: 1} as MoveArgs<MoveFnEnum.DELETE>;

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let store: InstanceType<typeof GridStore>;
  let renamedName: string | undefined;
  let deleteCount: number;

  const updateEntity = (newValue: string) => {
    renamedName = newValue;

    return {featureId: RENAMED_ID};
  };

  const deleteEntity = () => {
    deleteCount += 1;

    return DELETED_MOVE_ARGS;
  };

  const showHeader = async (overrides: Record<string, unknown> = {}) => {
    const inputs: Record<string, unknown> = {
      tile: {text: 'Vehicle', cols: 1, rows: 1, type: TileType.TOP_FEATURE_HEADER, entityId: RENAMED_ID} as Tile,
      entityLabel: 'feature',
      backgroundColor: 'purple',
      textColor: 'white',
      isVertical: false,
      isDeleteDisabled: false,
      updateEntity,
      deleteEntity,
      ...overrides,
    };

    Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
    await fixture.whenStable();
  };

  const rename = (name: string) => component.onChangeName({target: {value: name}} as unknown as Event);

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [TRANSLATION_PROVIDERS, {provide: GRID_SEED, useValue: MOCK_SMALL_GRID_SEED}]
    });
    store = TestBed.inject(GridStore);
    renamedName = undefined;
    deleteCount = 0;

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    await showHeader();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('what the wrapper passes in', () => {
    it('should paint the header with the fill', () => {
      expect(fixture.nativeElement.querySelector('.header').style.backgroundColor).toBe('purple');
    });

    it('should color the label with the text color', () => {
      expect(fixture.nativeElement.querySelector('.header').style.color).toBe('white');
    });

    it('should run the label across the tile by default', () => {
      expect(fixture.nativeElement.querySelector('.header').classList).not.toContain('vertical');
    });

    it('should run the label vertically', async () => {
      await showHeader({isVertical: true});

      expect(fixture.nativeElement.querySelector('.header').classList).toContain('vertical');
    });
  });

  describe('the labels a screen reader reads', () => {
    it('should name the field after the entity label', () => {
      expect(component.nameLabel()).toBe('feature name');
    });

    it('should name the field after an entity label carrying an owner', async () => {
      await showHeader({entityLabel: 'Vehicle option'});

      expect(component.nameLabel()).toBe('Vehicle option name');
    });

    it('should put the field label on the input itself', () => {
      expect(fixture.nativeElement.querySelector('input').getAttribute('aria-label')).toBe('feature name');
    });

    it('should name the delete button after the entity label and the name', () => {
      expect(component.deleteLabel()).toBe('Delete feature Vehicle');
    });

    it('should name the delete button of a header with no name yet', async () => {
      await showHeader({tile: {text: '', cols: 1, rows: 1, type: TileType.TOP_FEATURE_HEADER, entityId: RENAMED_ID}});

      expect(component.deleteLabel()).toBe('Delete feature');
    });

    it('should put the delete label on the button itself', () => {
      expect(fixture.nativeElement.querySelector('.delete').getAttribute('aria-label'))
        .toBe('Delete feature Vehicle');
    });
  });

  describe('the delete button', () => {
    it('should stay out of the tab order', () => {
      expect(fixture.nativeElement.querySelector('.delete').getAttribute('tabindex')).toBe('-1');
    });

    it('should take focus on arrow down', () => {
      fixture.nativeElement.querySelector('input').dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown'}));

      expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.delete'));
    });

    it('should leave the caret alone on arrow right', () => {
      const input = fixture.nativeElement.querySelector('input');
      input.focus();

      input.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight'}));

      expect(document.activeElement).toBe(input);
    });

    it('should not scroll the page on arrow down', () => {
      const arrowDown = new KeyboardEvent('keydown', {key: 'ArrowDown', cancelable: true});

      fixture.nativeElement.querySelector('input').dispatchEvent(arrowDown);

      expect(arrowDown.defaultPrevented).toBe(true);
    });

    it('should not scroll the page on arrow up', () => {
      const arrowUp = new KeyboardEvent('keydown', {key: 'ArrowUp', cancelable: true});

      fixture.nativeElement.querySelector('.delete').dispatchEvent(arrowUp);

      expect(arrowUp.defaultPrevented).toBe(true);
    });

    it('should hand focus back to the name on arrow up', () => {
      const deleteButton = fixture.nativeElement.querySelector('.delete');
      deleteButton.focus();

      deleteButton.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp'}));

      expect(document.activeElement).toBe(fixture.nativeElement.querySelector('input'));
    });

    it('should be disabled when deleting is no longer allowed', async () => {
      await showHeader({isDeleteDisabled: true});

      expect(fixture.nativeElement.querySelector('.delete').disabled).toBe(true);
    });
  });

  describe('onChangeName', () => {
    it('should pass the new name to the rename callback', () => {
      rename('Transport');

      expect(renamedName).toBe('Transport');
    });

    it('should record the rename against the returned entity', () => {
      rename('Transport');

      expect(store.undoStack()).toEqual([{
        moveFn: MoveFnEnum.UPDATE,
        moveArgs: {featureId: RENAMED_ID, oldValue: 'Vehicle', newValue: 'Transport'}
      }]);
    });

    it('should do nothing for a header with no entity', async () => {
      await showHeader({tile: {text: 'Vehicle', cols: 1, rows: 1, type: TileType.TOP_FEATURE_HEADER}});

      rename('Transport');

      expect(renamedName).toBeUndefined();
      expect(store.undoStack()).toEqual([]);
    });

    it('should do nothing when the name has not changed', () => {
      rename('Vehicle');

      expect(renamedName).toBeUndefined();
      expect(store.undoStack()).toEqual([]);
    });

    it('should rename and leave the field on enter', async () => {
      const input = fixture.nativeElement.querySelector('input');
      input.focus();
      input.value = 'Transport';

      input.dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter'}));
      await fixture.whenStable();

      expect(renamedName).toBe('Transport');
      expect(document.activeElement).not.toBe(input);
    });

    it('should rename and leave the field on escape', async () => {
      const input = fixture.nativeElement.querySelector('input');
      input.focus();
      input.value = 'Transport';

      input.dispatchEvent(new KeyboardEvent('keyup', {key: 'Escape'}));
      await fixture.whenStable();

      expect(renamedName).toBe('Transport');
      expect(document.activeElement).not.toBe(input);
    });

    it('should rename on blur', async () => {
      const input = fixture.nativeElement.querySelector('input');
      input.value = 'Transport';

      input.dispatchEvent(new FocusEvent('blur'));
      await fixture.whenStable();

      expect(renamedName).toBe('Transport');
    });
  });

  describe('onClickDelete', () => {
    it('should run the delete callback', () => {
      component.onClickDelete();

      expect(deleteCount).toBe(1);
    });

    it('should record the returned move args', () => {
      component.onClickDelete();

      expect(store.undoStack()).toEqual([{moveFn: MoveFnEnum.DELETE, moveArgs: DELETED_MOVE_ARGS}]);
    });

    it('should do nothing for a header with no entity', async () => {
      await showHeader({tile: {text: 'Vehicle', cols: 1, rows: 1, type: TileType.TOP_FEATURE_HEADER}});

      component.onClickDelete();

      expect(deleteCount).toBe(0);
      expect(store.undoStack()).toEqual([]);
    });

    it('should delete when the button is clicked', async () => {
      fixture.nativeElement.querySelector('.delete').click();
      await fixture.whenStable();

      expect(deleteCount).toBe(1);
    });
  });
});
