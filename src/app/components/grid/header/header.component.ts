import {Component, computed, ElementRef, inject, input, viewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Tile} from '../../../types/tile.model';
import {FeatureId, OptionId} from '../../../types/entities.model';
import {BaseDirective} from '../../../directives/base.directive';
import {MoveArgs, MoveFnEnum} from '../../../types/move.model';
import {ARROW_DOWN_KEY, ARROW_LEFT_KEY, ARROW_RIGHT_KEY, ARROW_UP_KEY} from '../../../constants/keyboard.const';

/** The rename and delete controls for a grid header. */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent extends BaseDirective {
  headerInput = viewChild<ElementRef<HTMLInputElement>>('headerInput');

  deleteButton = viewChild<ElementRef<HTMLButtonElement>>('deleteButton');

  tile = input.required<Tile>();

  /** The header type string, such as "feature" or "Vehicle option". */
  entityLabel = input.required<string>();

  /** Fill color for the header. */
  backgroundColor = input.required<string>();

  /** The label color, which contrasts the fill. */
  textColor = input.required<string>();

  /** If the label runs vertically */
  isVertical = input.required<boolean>();

  /** If deleting would drop below the minimum */
  isDeleteDisabled = input.required<boolean>();

  /** Renames the entity and returns its id for the move record. */
  updateEntity = input.required<(newValue: string) => {featureId: FeatureId} | {optionId: OptionId}>();

  /** Deletes the entity and returns its move args. */
  deleteEntity = input.required<() => MoveArgs<MoveFnEnum.DELETE>>();

  /** Translations */
  lang = inject(TranslateService).translate('header');

  /** The screen reader label for the name field. */
  nameLabel = computed(() => `${this.entityLabel()} ${this.lang().name}`);

  /** The screen reader label for the delete button. */
  deleteLabel = computed(() => `${this.lang().delete} ${this.entityLabel()} ${this.tile().text}`.trim());

  /** The key that reaches the delete button, which sits below a vertical header and beside a horizontal one. */
  toDeleteKey = computed(() => this.isVertical() ? ARROW_DOWN_KEY : ARROW_RIGHT_KEY);

  /** The key that reaches the name field back from the delete button. */
  toNameKey = computed(() => this.isVertical() ? ARROW_UP_KEY : ARROW_LEFT_KEY);

  /** The key that reaches the delete button, cased the way `aria-keyshortcuts` reads it. */
  deleteShortcut = computed(() => this.isVertical() ? 'ArrowDown' : 'ArrowRight');

  /**
   * Moves from the name field to the delete button, along the axis this header lays them out on.
   * @param event
   */
  onNameKeydown(event: KeyboardEvent) {
    if (event.key.toLowerCase() !== this.toDeleteKey()) return;

    event.preventDefault();
    this.deleteButton()?.nativeElement.focus();
  }

  /**
   * Moves back from the delete button to the name field, along the same axis.
   * @param event
   */
  onDeleteKeydown(event: KeyboardEvent) {
    if (event.key.toLowerCase() !== this.toNameKey()) return;

    event.preventDefault();
    this.headerInput()?.nativeElement.focus();
  }

  /**
   * Renames the entity and records the move, unless the name is unchanged.
   * @param event
   */
  onChangeName(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    const oldValue = this.tile().text;

    if (this.tile().entityId == undefined || newValue === oldValue) return;

    this.store.recordMove({moveFn: MoveFnEnum.UPDATE, moveArgs: {oldValue, newValue, ...this.updateEntity()(newValue)}});
  }

  /**
   * Deletes the entity and records the move.
   */
  onClickDelete() {
    if (this.tile().entityId == undefined) return;

    this.store.recordMove({moveFn: MoveFnEnum.DELETE, moveArgs: this.deleteEntity()()});
  }
}
