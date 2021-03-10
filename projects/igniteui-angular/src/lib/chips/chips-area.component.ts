import {
    Component,
    ContentChildren,
    ChangeDetectorRef,
    EventEmitter,
    HostBinding,
    Input,
    IterableDiffer,
    IterableDiffers,
    Output,
    QueryList,
    DoCheck,
    AfterViewInit,
    OnDestroy,
    ElementRef
} from '@angular/core';
import {
    IgxChipComponent,
    IChipSelectEventArgs,
    IChipKeyDownEventArgs,
    IChipEnterDragAreaEventArgs,
    IBaseChipEventArgs
} from './chip.component';
import { IDropBaseEventArgs, IDragBaseEventArgs } from '../directives/drag-drop/drag-drop.directive';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

export interface IBaseChipsAreaEventArgs {
    originalEvent: IDragBaseEventArgs | IDropBaseEventArgs | KeyboardEvent | MouseEvent | TouchEvent;
    owner: IgxChipsAreaComponent;
}

export interface IChipsAreaReorderEventArgs extends IBaseChipsAreaEventArgs {
    chipsArray: IgxChipComponent[];
}

export interface IChipsAreaSelectEventArgs extends IBaseChipsAreaEventArgs {
    newSelection: IgxChipComponent[];
}

/**
 * The chip area allows you to perform more complex scenarios with chips that require interaction,
 * like dragging, selection, navigation, etc.
 *
 * @igxModule IgxChipsModule
 *
 * @igxTheme igx-chip-theme
 *
 * @igxKeywords chip area, chip
 *
 * @igxGroup display
 *
 * @example
 * ```html
 * <igx-chips-area>
 *    <igx-chip *ngFor="let chip of chipList" [id]="chip.id">
 *        <span>{{chip.text}}</span>
 *    </igx-chip>
 * </igx-chips-area>
 * ```
 */
@Component({
    selector: 'igx-chips-area',
    templateUrl: 'chips-area.component.html',
})
export class IgxChipsAreaComponent implements DoCheck, AfterViewInit, OnDestroy {

    /**
     * @hidden
     * @internal
     */
    @Input()
    public class = '';

    /**
     * @hidden
     * @internal
     */
    @HostBinding('attr.class')
    public get hostClass() {
        const classes = ['igx-chip-area'];
        classes.push(this.class);

        return classes.join(' ');
    }

    /**
     * An @Input property that sets the width of the `IgxChipsAreaComponent`.
     *
     * @example
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (onReorder)="chipsOrderChanged($event)"></igx-chips-area>
     * ```
     */
    @HostBinding('style.width.px')
    @Input()
    public width: number;

    /**
     * An @Input property that sets the height of the `IgxChipsAreaComponent`.
     *
     * @example
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (onReorder)="chipsOrderChanged($event)"></igx-chips-area>
     * ```
     */
    @HostBinding('style.height.px')
    @Input()
    public height: number;

    /**
     * Emits an event when `IgxChipComponent`s in the `IgxChipsAreaComponent` should be reordered.
     * Returns an array of `IgxChipComponent`s.
     *
     * @example
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (onReorder)="changedOrder($event)"></igx-chips-area>
     * ```
     */
    @Output()
    public reorder = new EventEmitter<IChipsAreaReorderEventArgs>();

    /**
     * Emits an event when an `IgxChipComponent` in the `IgxChipsAreaComponent` is selected/deselected.
     * Fired after the chips area is initialized if there are initially selected chips as well.
     * Returns an array of selected `IgxChipComponent`s and the `IgxChipAreaComponent`.
     *
     * @example
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (selectionChange)="selection($event)"></igx-chips-area>
     * ```
     */
    @Output()
    public selectionChange = new EventEmitter<IChipsAreaSelectEventArgs>();

    /**
     * Emits an event when an `IgxChipComponent` in the `IgxChipsAreaComponent` is moved.
     *
     * @example
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (moveStart)="moveStart($event)"></igx-chips-area>
     * ```
     */
    @Output()
    public moveStart = new EventEmitter<IBaseChipsAreaEventArgs>();

    /**
     * Emits an event after an `IgxChipComponent` in the `IgxChipsAreaComponent` is moved.
     *
     * @example
     * ```html
     * <igx-chips-area #chipsArea [width]="'300'" [height]="'10'" (moveEnd)="moveEnd($event)"></igx-chips-area>
     * ```
     */
    @Output()
    public moveEnd = new EventEmitter<IBaseChipsAreaEventArgs>();

    /**
     * Holds the `IgxChipComponent` in the `IgxChipsAreaComponent`.
     *
     * @example
     * ```typescript
     * ngAfterViewInit(){
     *    let chips = this.chipsArea.chipsList;
     * }
     * ```
     */
    @ContentChildren(IgxChipComponent, { descendants: true })
    public chipsList: QueryList<IgxChipComponent>;

    protected destroy$ = new Subject<boolean>();

    private modifiedChipsArray: IgxChipComponent[];
    private _differ: IterableDiffer<IgxChipComponent> | null = null;

    constructor(public cdr: ChangeDetectorRef, public element: ElementRef,
        private _iterableDiffers: IterableDiffers) {
        this._differ = this._iterableDiffers.find([]).create(null);
    }

    /**
     * @hidden
     * @internal
     */
    public ngAfterViewInit() {
        // If we have initially selected chips through their inputs, we need to get them, because we cannot listen to their events yet.
        if (this.chipsList.length) {
            const selectedChips = this.chipsList.filter((item: IgxChipComponent) => item.selected);
            if (selectedChips.length) {
                this.selectionChange.emit({
                    originalEvent: null,
                    newSelection: selectedChips,
                    owner: this
                });
            }
        }
    }

    /**
     * @hidden
     * @internal
     */
    public ngDoCheck(): void {
        if (this.chipsList) {
            const changes = this._differ.diff(this.chipsList.toArray());
            if (changes) {
                changes.forEachAddedItem((addedChip) => {
                    addedChip.item.moveStart.pipe(takeUntil(this.destroy$)).subscribe((args) => {
                        this.onChipMoveStart(args);
                    });
                    addedChip.item.moveEnd.pipe(takeUntil(this.destroy$)).subscribe((args) => {
                        this.onChipMoveEnd(args);
                    });
                    addedChip.item.dragEnter.pipe(takeUntil(this.destroy$)).subscribe((args) => {
                        this.onChipDragEnter(args);
                    });
                    addedChip.item.keyDown.pipe(takeUntil(this.destroy$)).subscribe((args) => {
                        this.onChipKeyDown(args);
                    });
                    if (addedChip.item.selectable) {
                        addedChip.item.selectedChanging.pipe(takeUntil(this.destroy$)).subscribe((args) => {
                            this.onChipSelectionChange(args);
                        });
                    }
                });
                this.modifiedChipsArray = this.chipsList.toArray();
            }
        }
    }

    /**
     * @hidden
     * @internal
     */
    public ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * @hidden
     * @internal
     */
    protected onChipKeyDown(event: IChipKeyDownEventArgs) {
        let orderChanged = false;
        const chipsArray = this.chipsList.toArray();
        const dragChipIndex = chipsArray.findIndex((el) => el === event.owner);
        if (event.originalEvent.shiftKey === true) {
            if (event.originalEvent.key === 'ArrowLeft' || event.originalEvent.key === 'Left') {
                orderChanged = this.positionChipAtIndex(dragChipIndex, dragChipIndex - 1, false, event.originalEvent);
                if (orderChanged) {
                    setTimeout(() => {
                        this.chipsList.toArray()[dragChipIndex - 1].elementRef.nativeElement.focus();
                    });
                }
            } else if (event.originalEvent.key === 'ArrowRight' || event.originalEvent.key === 'Right') {
                orderChanged = this.positionChipAtIndex(dragChipIndex, dragChipIndex + 1, true, event.originalEvent);
            }
        } else {
            if ((event.originalEvent.key === 'ArrowLeft' || event.originalEvent.key === 'Left') && dragChipIndex > 0) {
                chipsArray[dragChipIndex - 1].elementRef.nativeElement.focus();
            } else if ((event.originalEvent.key === 'ArrowRight' || event.originalEvent.key === 'Right') &&
                dragChipIndex < chipsArray.length - 1) {
                chipsArray[dragChipIndex + 1].elementRef.nativeElement.focus();
            }
        }
    }

    /**
     * @hidden
     * @internal
     */
    protected onChipMoveStart(event: IBaseChipEventArgs) {
        this.moveStart.emit({
            originalEvent: event.originalEvent,
            owner: this
        });
    }

    /**
     * @hidden
     * @internal
     */
    protected onChipMoveEnd(event: IBaseChipEventArgs) {
        this.moveEnd.emit({
            originalEvent: event.originalEvent,
            owner: this
        });
    }

    /**
     * @hidden
     * @internal
     */
    protected onChipDragEnter(event: IChipEnterDragAreaEventArgs) {
        const dropChipIndex = this.chipsList.toArray().findIndex((el) => el === event.owner);
        const dragChipIndex = this.chipsList.toArray().findIndex((el) => el === event.dragChip);
        if (dragChipIndex < dropChipIndex) {
            // from the left to right
            this.positionChipAtIndex(dragChipIndex, dropChipIndex, true, event.originalEvent);
        } else {
            // from the right to left
            this.positionChipAtIndex(dragChipIndex, dropChipIndex, false, event.originalEvent);
        }
    }

    /**
     * @hidden
     * @internal
     */
    protected positionChipAtIndex(chipIndex, targetIndex, shiftRestLeft, originalEvent) {
        if (chipIndex < 0 || this.chipsList.length <= chipIndex ||
            targetIndex < 0 || this.chipsList.length <= targetIndex) {
            return false;
        }

        const chipsArray = this.chipsList.toArray();
        const result: IgxChipComponent[] = [];
        for (let i = 0; i < chipsArray.length; i++) {
            if (shiftRestLeft) {
                if (chipIndex <= i && i < targetIndex) {
                    result.push(chipsArray[i + 1]);
                } else if (i === targetIndex) {
                    result.push(chipsArray[chipIndex]);
                } else {
                    result.push(chipsArray[i]);
                }
            } else {
                if (targetIndex < i && i <= chipIndex) {
                    result.push(chipsArray[i - 1]);
                } else if (i === targetIndex) {
                    result.push(chipsArray[chipIndex]);
                } else {
                    result.push(chipsArray[i]);
                }
            }
        }
        this.modifiedChipsArray = result;

        const eventData: IChipsAreaReorderEventArgs = {
            chipsArray: this.modifiedChipsArray,
            originalEvent,
            owner: this
        };
        this.reorder.emit(eventData);
        return true;
    }

    /**
     * @hidden
     * @internal
     */
    protected onChipSelectionChange(event: IChipSelectEventArgs) {
        let selectedChips = this.chipsList.filter((chip) => chip.selected);
        if (event.selected && !selectedChips.includes(event.owner)) {
            selectedChips.push(event.owner);
        } else if (!event.selected && selectedChips.includes(event.owner)) {
            selectedChips = selectedChips.filter((chip) => chip.id !== event.owner.id);
        }
        this.selectionChange.emit({
            originalEvent: event.originalEvent,
            newSelection: selectedChips,
            owner: this
        });
    }
}
