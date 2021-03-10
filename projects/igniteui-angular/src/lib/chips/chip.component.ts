import {
    Component,
    ChangeDetectorRef,
    EventEmitter,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    Output,
    ViewChild,
    Renderer2,
    TemplateRef,
    Inject,
    Optional
} from '@angular/core';
import { IDisplayDensityOptions, DisplayDensityToken, DisplayDensityBase } from '../core/displayDensity';
import {
    IgxDragDirective,
    IDragBaseEventArgs,
    IDragStartEventArgs,
    IDropBaseEventArgs,
    IDropDroppedEventArgs
} from '../directives/drag-drop/drag-drop.directive';
import { IBaseEventArgs } from '../core/utils';
import { fromEvent } from 'rxjs';
import { take, filter } from 'rxjs/operators';


export interface IBaseChipEventArgs extends IBaseEventArgs {
    originalEvent: IDragBaseEventArgs | IDropBaseEventArgs | KeyboardEvent | MouseEvent | TouchEvent;
    owner: IgxChipComponent;
}

export interface IChipClickEventArgs extends IBaseChipEventArgs {
    cancel: boolean;
}

export interface IChipKeyDownEventArgs extends IBaseChipEventArgs {
    originalEvent: KeyboardEvent;
    cancel: boolean;
}

export interface IChipEnterDragAreaEventArgs extends IBaseChipEventArgs {
    dragChip: IgxChipComponent;
}

export interface IChipSelectEventArgs extends IBaseChipEventArgs {
    cancel: boolean;
    selected: boolean;
}

let CHIP_ID = 0;

/**
 * Chip is compact visual component that displays information in an obround.
 *
 * @igxModule IgxChipsModule
 *
 * @igxTheme igx-chip-theme
 *
 * @igxKeywords chip
 *
 * @igxGroup display
 *
 * @remarks
 * The Ignite UI Chip can be templated, deleted, and selected.
 * Multiple chips can be reordered and visually connected to each other.
 * Chips reside in a container called chips area which is responsible for managing the interactions between the chips.
 *
 * @example
 * ```html
 * <igx-chip class="chipStyle" [id]="901" [draggable]="true" [removable]="true" (remove)="chipRemoved($event)">
 *    <igx-avatar class="chip-avatar-resized" igxPrefix roundShape="true"></igx-avatar>
 * </igx-chip>
 * ```
 */
@Component({
    selector: 'igx-chip',
    templateUrl: 'chip.component.html'
})
export class IgxChipComponent extends DisplayDensityBase {

    /**
     * An @Input property that sets the value of `id` attribute. If not provided it will be automatically generated.
     *
     * @example
     * ```html
     * <igx-chip [id]="'igx-chip-1'"></igx-chip>
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-chip-${CHIP_ID++}`;

    /**
     * An @Input property that sets the value of `tabindex` attribute. If not provided it will use the element's tabindex if set.
     *
     * @example
     * ```html
     * <igx-chip [id]="'igx-chip-1'" [tabIndex]="1"></igx-chip>
     * ```
     */
    @HostBinding('attr.tabIndex')
    @Input()
    public set tabIndex(value: number) {
        this._tabIndex = value;
    }

    public get tabIndex() {
        if (this._tabIndex !== null) {
            return this._tabIndex;
        }
        return !this.disabled ? 0 : null;
    }

    /**
     * An @Input property that stores data related to the chip.
     *
     * @example
     * ```html
     * <igx-chip [data]="{ value: 'Country' }"></igx-chip>
     * ```
     */
    @Input()
    public data: any;

    /**
     * An @Input property that defines if the `IgxChipComponent` can be dragged in order to change it's position.
     * By default it is set to false.
     *
     * @example
     * ```html
     * <igx-chip [id]="'igx-chip-1'" [draggable]="true"></igx-chip>
     * ```
     */
    @Input()
    public draggable = false;

    /**
     * An @Input property that enables/disables the draggable element animation when the element is released.
     * By default it's set to true.
     *
     * @example
     * ```html
     * <igx-chip [id]="'igx-chip-1'" [draggable]="true" [animateOnRelease]="false"></igx-chip>
     * ```
     */
    @Input()
    public animateOnRelease = true;

    /**
     * An @Input property that enables/disables the hiding of the base element that has been dragged.
     * By default it's set to true.
     *
     * @example
     * ```html
     * <igx-chip [id]="'igx-chip-1'" [draggable]="true" [hideBaseOnDrag]="false"></igx-chip>
     * ```
     */
    @Input()
    public hideBaseOnDrag = true;

    /**
     * An @Input property that defines if the `IgxChipComponent` should render remove button and throw remove events.
     * By default it is set to false.
     *
     * @example
     * ```html
     * <igx-chip [id]="'igx-chip-1'" [draggable]="true" [removable]="true"></igx-chip>
     * ```
     */
    @Input()
    public removable = false;

    /**
     * An @Input property that overrides the default icon that the chip applies to the remove button.
     *
     * @example
     * ```html
     * <igx-chip [id]="chip.id" [removable]="true" [removeIcon]="iconTemplate"></igx-chip>
     * <ng-template #iconTemplate><igx-icon>delete</igx-icon></ng-template>
     * ```
     */
    @Input()
    public removeIcon: TemplateRef<any>;

    /**
     * An @Input property that defines if the `IgxChipComponent` can be selected on click or through navigation,
     * By default it is set to false.
     *
     * @example
     * ```html
     * <igx-chip [id]="chip.id" [draggable]="true" [removable]="true" [selectable]="true"></igx-chip>
     * ```
     */
    @Input()
    public selectable = false;

    /**
     * An @Input property that overrides the default icon that the chip applies when it is selected.
     *
     * @example
     * ```html
     * <igx-chip [id]="chip.id" [selectable]="true" [selectIcon]="iconTemplate"></igx-chip>
     * <ng-template #iconTemplate><igx-icon>done_outline</igx-icon></ng-template>
     * ```
     */
    @Input()
    public selectIcon: TemplateRef<any>;

    /**
     * @hidden
     * @internal
     */
    @Input()
    public class = '';

    /**
     * An @Input property that defines if the `IgxChipComponent` is disabled. When disabled it restricts user interactions
     * like focusing on click or tab, selection on click or Space, dragging.
     * By default it is set to false.
     *
     * @example
     * ```html
     * <igx-chip [id]="chip.id" [disabled]="true"></igx-chip>
     * ```
     */
    @Input()
    public disabled = false;

    /**
     * Sets the `IgxChipComponent` selected state.
     *
     * @example
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [selectable]="true" [selected]="true">
     * ```
     *
     * Two-way data binding:
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [selectable]="true" [(selected)]="model.isSelected">
     * ```
     */
    @Input()
    public set selected(newValue: boolean) {
        this.changeSelection(newValue);
    }

    /**
     * Returns if the `IgxChipComponent` is selected.
     *
     * @example
     * ```typescript
     * @ViewChild('myChip')
     * public chip: IgxChipComponent;
     * selectedChip(){
     *     let selectedChip = this.chip.selected;
     * }
     * ```
     */
    public get selected() {
        return this._selected;
    }

    /**
     * @hidden
     * @internal
     */
    @Output()
    public selectedChange = new EventEmitter<boolean>();

    /**
     * An @Input property that sets the `IgxChipComponent` background color.
     * The `color` property supports string, rgb, hex.
     *
     * @example
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [color]="'#ff0000'"></igx-chip>
     * ```
     */
    @Input()
    public set color(newColor) {
        this.chipArea.nativeElement.style.backgroundColor = newColor;
    }

    /**
     * Returns the background color of the `IgxChipComponent`.
     *
     * @example
     * ```typescript
     * @ViewChild('myChip')
     * public chip: IgxChipComponent;
     * ngAfterViewInit(){
     *     let chipColor = this.chip.color;
     * }
     * ```
     */
    public get color() {
        return this.chipArea.nativeElement.style.backgroundColor;
    }

    /**
     * Emits an event when the `IgxChipComponent` moving starts.
     * Returns the moving `IgxChipComponent`.
     *
     * @example
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (moveStart)="moveStarted($event)">
     * ```
     */
    @Output()
    public moveStart = new EventEmitter<IBaseChipEventArgs>();

    /**
     * Emits an event when the `IgxChipComponent` moving ends.
     * Returns the moved `IgxChipComponent`.
     *
     * @example
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (moveEnd)="moveEnded($event)">
     * ```
     */
    @Output()
    public moveEnd = new EventEmitter<IBaseChipEventArgs>();

    /**
     * Emits an event when the `IgxChipComponent` is removed.
     * Returns the removed `IgxChipComponent`.
     *
     * @example
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (remove)="remove($event)">
     * ```
     */
    @Output()
    public remove = new EventEmitter<IBaseChipEventArgs>();

    /**
     * Emits an event when the `IgxChipComponent` is clicked.
     * Returns the clicked `IgxChipComponent`, whether the event should be canceled.
     *
     * @example
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (click)="chipClick($event)">
     * ```
     */
    @Output()
    public chipClick = new EventEmitter<IChipClickEventArgs>();

    /**
     * Emits event when the `IgxChipComponent` is selected/deselected.
     * Returns the selected chip reference, whether the event should be canceled, what is the next selection state and
     * when the event is triggered by interaction `originalEvent` is provided, otherwise `originalEvent` is `null`.
     *
     * @example
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [selectable]="true" (selectedChanging)="chipSelect($event)">
     * ```
     */
    @Output()
    public selectedChanging = new EventEmitter<IChipSelectEventArgs>();

    /**
     * Emits event when the `IgxChipComponent` is selected/deselected and any related animations and transitions also end.
     *
     * @example
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [selectable]="true" (selectedChanged)="chipSelectEnd($event)">
     * ```
     */
    @Output()
    public selectedChanged = new EventEmitter<IBaseChipEventArgs>();

    /**
     * Emits an event when the `IgxChipComponent` keyboard navigation is being used.
     * Returns the focused/selected `IgxChipComponent`, whether the event should be canceled,
     * if the `alt`, `shift` or `control` key is pressed and the pressed key name.
     *
     * @example
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (keyDown)="chipKeyDown($event)">
     * ```
     */
    @Output()
    public keyDown = new EventEmitter<IChipKeyDownEventArgs>();

    /**
     * Emits an event when the `IgxChipComponent` has entered the `IgxChipsAreaComponent`.
     * Returns the target `IgxChipComponent`, the drag `IgxChipComponent`, as  well as
     * the original drop event arguments.
     *
     * @example
     * ```html
     * <igx-chip #myChip [id]="'igx-chip-1'" [draggable]="true" (onDragEnter)="chipEnter($event)">
     * ```
     */
    @Output()
    public dragEnter = new EventEmitter<IChipEnterDragAreaEventArgs>();

    /**
     * @hidden
     * @internal
     */
    @HostBinding('attr.class')
    public get hostClass(): string {
        const classes = [this.getComponentDensityClass('igx-chip')];
        classes.push(this.disabled ? 'igx-chip--disabled' : '');
        // The custom classes should be at the end.
        classes.push(this.class);
        return classes.join(' ');
    }

    /**
     * Property that contains a reference to the `IgxDragDirective` the `IgxChipComponent` uses for dragging behavior.
     *
     * @example
     * ```html
     * <igx-chip [id]="chip.id" [draggable]="true"></igx-chip>
     * ```
     * ```typescript
     * onMoveStart(event: IBaseChipEventArgs){
     *     let dragDirective = event.owner.dragDirective;
     * }
     * ```
     */
    @ViewChild('chipArea', { read: IgxDragDirective, static: true })
    public dragDirective: IgxDragDirective;

    /**
     * @hidden
     * @internal
     */
    @ViewChild('chipArea', { read: ElementRef, static: true })
    public chipArea: ElementRef;

    /**
     * @hidden
     * @internal
     */
    @ViewChild('selectContainer', { read: ElementRef, static: true })
    public selectContainer: ElementRef;

    /**
     * @hidden
     * @internal
     */
    @ViewChild('defaultRemoveIcon', { read: TemplateRef, static: true })
    public defaultRemoveIcon: TemplateRef<any>;

    /**
     * @hidden
     * @internal
     */
    @ViewChild('defaultSelectIcon', { read: TemplateRef, static: true })
    public defaultSelectIcon: TemplateRef<any>;

    /**
     * @hidden
     * @internal
     */
    public get removeButtonTemplate() {
        return this.removeIcon || this.defaultRemoveIcon;
    }

    /**
     * @hidden
     * @internal
     */
    public get selectIconTemplate() {
        return this.selectIcon || this.defaultSelectIcon;
    }

    /**
     * @hidden
     * @internal
     */
    public get ghostClass(): string {
        return this.getComponentDensityClass('igx-chip__ghost');
    }

    /**
     * @hidden
     * @internal
     */
    public hideBaseElement = false;

    protected _tabIndex = null;
    protected _selected = false;
    protected _selectedItemClass = 'igx-chip__item--selected';
    protected _movedWhileRemoving = false;

    constructor(public cdr: ChangeDetectorRef, public elementRef: ElementRef, private renderer: Renderer2,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
        super(_displayDensityOptions);
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('keydown', ['$event'])
    public keyEvent(event: KeyboardEvent) {
        this.onChipKeyDown(event);
    }

    /**
     * @hidden
     * @internal
     */
    public selectClass(condition: boolean): any {
        const SELECT_CLASS = 'igx-chip__select';

        return {
            [SELECT_CLASS]: condition,
            [`${SELECT_CLASS}--hidden`]: !condition
        };
    }

    public onSelectTransitionDone(event) {
        if (!!event.target.tagName) {
            // Trigger onSelectionDone on when `width` property is changed and the target is valid element(not comment).
            this.selectedChanged.emit({
                owner: this,
                originalEvent: event
            });
        }
    }

    /**
     * @hidden
     * @internal
     */
    public onChipKeyDown(event: KeyboardEvent) {
        const keyDownArgs: IChipKeyDownEventArgs = {
            originalEvent: event,
            owner: this,
            cancel: false
        };

        this.keyDown.emit(keyDownArgs);
        if (keyDownArgs.cancel) {
            return;
        }

        if ((event.key === 'Delete' || event.key === 'Del') && this.removable) {
            this.remove.emit({
                originalEvent: event,
                owner: this
            });
        }

        if ((event.key === ' ' || event.key === 'Spacebar') && this.selectable && !this.disabled) {
            this.changeSelection(!this.selected, event);
        }

        if (event.key !== 'Tab') {
            event.preventDefault();
        }
    }

    /**
     * @hidden
     * @internal
     */
    public onRemoveBtnKeyDown(event: KeyboardEvent) {
        if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Enter') {
            this.remove.emit({
                originalEvent: event,
                owner: this
            });

            event.preventDefault();
            event.stopPropagation();
        }
    }

    public onRemoveMouseDown(event: PointerEvent | MouseEvent) {
        event.stopPropagation();
    }

    /**
     * @hidden
     * @internal
     */
    public onRemoveClick(event: MouseEvent | TouchEvent) {
        this.remove.emit({
            originalEvent: event,
            owner: this
        });
    }

    /**
     * @hidden
     * @internal
     */
    public onRemoveTouchMove() {
        // We don't remove chip if user starting touch interacting on the remove button moves the chip
        this._movedWhileRemoving = true;
    }

    /**
     * @hidden
     * @internal
     */
    public onRemoveTouchEnd(event: TouchEvent) {
        if (!this._movedWhileRemoving) {
            this.onRemoveClick(event);
        }
        this._movedWhileRemoving = false;
    }

    /**
     * @hidden
     * @internal
     */
    // -----------------------------
    // Start chip igxDrag behavior
    public onChipDragStart(event: IDragStartEventArgs) {
        this.moveStart.emit({
            originalEvent: event,
            owner: this
        });
        event.cancel = !this.draggable || this.disabled;
    }

    /**
     * @hidden
     * @internal
     */
    public onChipDragEnd() {
        if (this.animateOnRelease) {
            this.dragDirective.transitionToOrigin();
        }
    }

    /**
     * @hidden
     * @internal
     */
    public onChipMoveEnd(event: IDragBaseEventArgs) {
        // moveEnd is triggered after return animation has finished. This happen when we drag and release the chip.
        this.moveEnd.emit({
            originalEvent: event,
            owner: this
        });

        if (this.selected) {
            this.chipArea.nativeElement.focus();
        }
    }

    /**
     * @hidden
     * @internal
     */
    public onChipGhostCreate() {
        this.hideBaseElement = this.hideBaseOnDrag;
    }

    /**
     * @hidden
     * @internal
     */
    public onChipGhostDestroy() {
        this.hideBaseElement = false;
    }

    /**
     * @hidden
     * @internal
     */
    public onChipDragClicked(event: IDragBaseEventArgs) {
        const clickEventArgs: IChipClickEventArgs = {
            originalEvent: event,
            owner: this,
            cancel: false
        };
        this.chipClick.emit(clickEventArgs);

        if (!clickEventArgs.cancel && this.selectable && !this.disabled) {
            this.changeSelection(!this.selected, event);
        }
    }
    // End chip igxDrag behavior

    /**
     * @hidden
     * @internal
     */
    // -----------------------------
    // Start chip igxDrop behavior
    public onChipDragEnterHandler(event: IDropBaseEventArgs) {
        if (this.dragDirective === event.drag || !event.drag.data || !event.drag.data.chip) {
            return;
        }

        const eventArgs: IChipEnterDragAreaEventArgs = {
            owner: this,
            dragChip: event.drag.data.chip,
            originalEvent: event
        };
        this.dragEnter.emit(eventArgs);
    }

    /**
     * @hidden
     * @internal
     */
    public onChipDrop(event: IDropDroppedEventArgs) {
        // Cancel the default drop logic
        event.cancel = true;
    }
    // End chip igxDrop behavior

    protected changeSelection(newValue: boolean, srcEvent = null) {
        const onSelectArgs: IChipSelectEventArgs = {
            originalEvent: srcEvent,
            owner: this,
            selected: false,
            cancel: false
        };

        fromEvent(this.selectContainer.nativeElement, 'transitionend')
            .pipe(filter<TransitionEvent>(event => event.propertyName === 'width'), take(1))
            .subscribe(event => this.onSelectTransitionDone(event));

        if (newValue && !this._selected) {
            onSelectArgs.selected = true;
            this.selectedChanging.emit(onSelectArgs);

            if (!onSelectArgs.cancel) {
                this.renderer.addClass(this.chipArea.nativeElement, this._selectedItemClass);
                this._selected = newValue;
                this.selectedChange.emit(this._selected);
            }
        } else if (!newValue && this._selected) {
            this.selectedChanging.emit(onSelectArgs);

            if (!onSelectArgs.cancel) {
                this.renderer.removeClass(this.chipArea.nativeElement, this._selectedItemClass);
                this._selected = newValue;
                this.selectedChange.emit(this._selected);
            }
        }
    }
}
