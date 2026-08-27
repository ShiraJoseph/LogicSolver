import {Component, computed, inject, input, signal} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Tile} from '../../../types/tile.model';
import {FeatureId, OptionId} from '../../../types/entities.model';
import {BaseDirective} from '../../../directives/base.directive';
import {MoveArgs, MoveFnEnum} from '../../../types/move.model';

/** The rename and delete controls for a grid header. */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent extends BaseDirective {
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

  /** Whether the delete button on the header should be visible */
  shouldShowMinus = signal(false);

  /** Translations */
  lang = inject(TranslateService).translate('header');

  /** The screen reader label for the name field. */
  nameLabel = computed(() => `${this.entityLabel()} ${this.lang().name}`);

  /** The screen reader label for the delete button. */
  deleteLabel = computed(() => `${this.lang().delete} ${this.entityLabel()} ${this.tile().text}`.trim());

  /** Shows the delete button on this header. */
  showMinus = () => this.shouldShowMinus.set(true);

  /** Hides the delete button on this header. */
  hideMinus = () => this.shouldShowMinus.set(false);

  /**
   * Renames the entity and records the move, unless the name is unchanged.
   * @param event
   */
  onChangeName(event: Event) {
    this.hideMinus();

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
