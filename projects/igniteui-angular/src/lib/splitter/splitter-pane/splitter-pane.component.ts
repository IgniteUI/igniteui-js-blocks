import { Component, HostBinding, Input, ElementRef, Output, EventEmitter } from '@angular/core';
import { DeprecateProperty } from '../../core/deprecateDecorators';

/**
 * Represents individual resizable/collapsible panes.
 *
 * @igxModule IgxSplitterModule
 *
 * @igxParent IgxSplitterComponent
 *
 * @igxKeywords pane
 *
 * @igxGroup presentation
 *
 * @remarks
 *  Users can control the resize behavior via the min and max size properties.
 */
@Component({
    selector: 'igx-splitter-pane',
    templateUrl: './splitter-pane.component.html'
})
export class IgxSplitterPaneComponent {
    /**
     * @hidden @internal
     * Gets/Sets the 'display' property of the current pane.
     */
    @HostBinding('style.display')
    public display = 'flex';

    /**
     * Gets/Sets the minimum allowed size of the current pane.
     *
     * @example
     * ```html
     * <igx-splitter>
     *  <igx-splitter-pane [minSize]='minSize'>...</igx-splitter-pane>
     * </igx-splitter>
     * ```
     */
    @Input()
    public minSize!: string;

    /**
     * Gets/Set the maximum allowed size of the current pane.
     *
     * @example
     * ```html
     * <igx-splitter>
     *  <igx-splitter-pane [maxSize]='maxSize'>...</igx-splitter-pane>
     * </igx-splitter>
     * ```
     */
    @Input()
    public maxSize!: string;

    /**
     * Gets/Sets whether pane is resizable.
     *
     * @example
     * ```html
     * <igx-splitter>
     *  <igx-splitter-pane [resizable]='false'>...</igx-splitter-pane>
     * </igx-splitter>
     * ```
     * @remarks
     * If pane is not resizable its related splitter bar cannot be dragged.
     */
    @Input()
    public resizable = true;

    /**
     * Event fired when collapsed state of pane is changed.
     *
     * @example
     * ```html
     * <igx-splitter>
     *  <igx-splitter-pane (onToggle)='onPaneToggle($event)'>...</igx-splitter-pane>
     * </igx-splitter>
     * ```
     */
    @DeprecateProperty(`Deprecated. Subscribe to the 'collapsedChange' output instead.`)
    @Output()
    public onToggle = new EventEmitter<IgxSplitterPaneComponent>();

    /**
     * Event fired when collapsed state of pane is changed.
     *
     * @example
     * ```html
     * <igx-splitter>
     *  <igx-splitter-pane (collapsedChange)='paneCollapsedChange($event)'>...</igx-splitter-pane>
     * </igx-splitter>
     * ```
     */
    @Output()
    public collapsedChange = new EventEmitter<boolean>();

    /** @hidden @internal */
    @HostBinding('style.order')
    public order!: number;

    /**
     * @hidden @internal
     * Gets/Sets the `overflow`.
     */
    @HostBinding('style.overflow')
    public overflow = 'auto';

    /**
     * @hidden @internal
     * Gets/Sets the `minHeight` and `minWidth` properties of the current pane.
     */
    @HostBinding('style.min-height')
    @HostBinding('style.min-width')
    public minHeight = 0;

    /**
     * @hidden @internal
     * Gets/Sets the `maxHeight` and `maxWidth` properties of the current `IgxSplitterPaneComponent`.
     */
    @HostBinding('style.max-height')
    @HostBinding('style.max-width')
    public maxHeight = '100%';

    /** @hidden @internal */
    public owner;

    /**
     * Gets/Sets the size of the current pane.
     *  * @example
     * ```html
     * <igx-splitter>
     *  <igx-splitter-pane [size]='size'>...</igx-splitter-pane>
     * </igx-splitter>
     * ```
     */
    @Input()
    public get size() {
        return this._size;
    }

    public set size(value) {
        this._size = value;
        this.el.nativeElement.style.flex = this.flex;
    }

    /** @hidden @internal */
    public get isPercentageSize() {
        return this.size === 'auto' || this.size.indexOf('%') !== -1;
    }

    /** @hidden @internal */
    public get dragSize() {
        return this._dragSize;
    }
    public set dragSize(val) {
        this._dragSize = val;
        this.el.nativeElement.style.flex = this.flex;
    }

    /**
     *
     * @hidden @internal
     * Gets the host native element.
     */
    public get element(): any {
        return this.el.nativeElement;
    }

    /**
     * @hidden @internal
     * Gets the `flex` property of the current `IgxSplitterPaneComponent`.
     */
    @HostBinding('style.flex')
    public get flex() {
        const isAuto = this.size === 'auto' && !this.dragSize;
        const grow = !isAuto ? 0 : 1;
        const size = this.dragSize || this.size;
        return `${grow} ${grow} ${size}`;
    }

    /**
     * Gets/Sets whether current pane is collapsed.
     *
     * @example
     * ```typescript
     * const isCollapsed = pane.collapsed;
     * ```
     */
    @Input()
    public set collapsed(value) {
        this._collapsed = value;
        this.display = this._collapsed ? 'none' : 'flex' ;
    }

    public get collapsed() {
        return this._collapsed;
    }

    private _size = 'auto';
    private _dragSize;
    private _collapsed = false;


    constructor(private el: ElementRef) { }

    /**
     * Toggles the collapsed state of the pane.
     *
     * @example
     * ```typescript
     * pane.toggle();
     * ```
     */
    public toggle() {
        // reset sibling sizes when pane collapse state changes.
        this._getSiblings().forEach(sibling => sibling.size = 'auto');
        this.collapsed = !this.collapsed;
        this.onToggle.emit(this);
        this.collapsedChange.emit(this.collapsed);
    }

    /** @hidden @internal */
    private _getSiblings() {
        const panes = this.owner.panes.toArray();
        const index = panes.indexOf(this);
        const siblings = [];
        if (index !== 0) {
            siblings.push(panes[index - 1]);
        }
        if (index !== panes.length - 1) {
            siblings.push(panes[index + 1]);
        }
        return siblings;
    }
}
