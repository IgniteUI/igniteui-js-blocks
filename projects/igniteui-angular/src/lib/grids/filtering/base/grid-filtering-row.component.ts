import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Input,
    TemplateRef,
    ViewChild,
    ViewChildren,
    QueryList,
    ElementRef,
    HostBinding,
    ChangeDetectionStrategy,
    ViewRef,
    HostListener
} from '@angular/core';
import { DataType, DataUtil } from '../../../data-operations/data-util';
import { IgxColumnComponent } from '../../columns/column.component';
import { IgxDropDownComponent, ISelectionEventArgs } from '../../../drop-down/public_api';
import { IFilteringOperation } from '../../../data-operations/filtering-condition';
import { FilteringLogic, IFilteringExpression } from '../../../data-operations/filtering-expression.interface';
import { HorizontalAlignment, VerticalAlignment, OverlaySettings } from '../../../services/overlay/utilities';
import { ConnectedPositioningStrategy } from '../../../services/overlay/position/connected-positioning-strategy';
import { IBaseChipEventArgs, IgxChipsAreaComponent, IgxChipComponent } from '../../../chips/public_api';
import { ExpressionUI } from '../grid-filtering.service';
import { IgxDropDownItemComponent } from '../../../drop-down/drop-down-item.component';
import { IgxFilteringService } from '../grid-filtering.service';
import { KEYS, isEdge, isIE } from '../../../core/utils';
import { AbsoluteScrollStrategy } from '../../../services/overlay/scroll';
import { DisplayDensity } from '../../../core/displayDensity';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-filtering-row',
    templateUrl: './grid-filtering-row.component.html'
})
export class IgxGridFilteringRowComponent implements AfterViewInit {
    @Input()
    public get column(): IgxColumnComponent {
        return this._column;
    }

    public set column(val) {
        if (this._column) {
            this.expressionsList.forEach(exp => exp.isSelected = false);
        }
        if (val) {
            this._column = val;

            this.expressionsList = this.filteringService.getExpressions(this._column.field);
            this.resetExpression();

            this.chipAreaScrollOffset = 0;
            this.transform(this.chipAreaScrollOffset);
        }
    }

    @Input()
    public get value(): any {
        return this.expression ? this.expression.searchVal : null;
    }

    public set value(val) {
        if (!val && val !== 0) {
            this.expression.searchVal = null;
            this.showHideArrowButtons();
        } else {
            this.expression.searchVal = DataUtil.parseValue(this.column.dataType, val);
            if (this.expressionsList.find(item => item.expression === this.expression) === undefined) {
                this.addExpression(true);
            }
        }
        this.filter();
    }

    public get displayDensity() {
        return this.column.grid.displayDensity === DisplayDensity.comfortable ? DisplayDensity.cosy : this.column.grid.displayDensity;
    }

    @ViewChild('defaultFilterUI', { read: TemplateRef, static: true })
    protected defaultFilterUI: TemplateRef<any>;

    @ViewChild('defaultDateUI', { read: TemplateRef, static: true })
    protected defaultDateUI: TemplateRef<any>;

    @ViewChild('input', { read: ElementRef })
    protected input: ElementRef;

    @ViewChild('inputGroupConditions', { read: IgxDropDownComponent, static: true })
    protected dropDownConditions: IgxDropDownComponent;

    @ViewChild('chipsArea', { read: IgxChipsAreaComponent, static: true })
    protected chipsArea: IgxChipsAreaComponent;

    @ViewChildren('operators', { read: IgxDropDownComponent })
    protected dropDownOperators: QueryList<IgxDropDownComponent>;

    @ViewChild('inputGroup', { read: ElementRef })
    protected inputGroup: ElementRef;

    @ViewChild('inputGroupPrefix', { read: ElementRef })
    protected inputGroupPrefix: ElementRef;

    @ViewChild('container', { static: true })
    protected container: ElementRef;

    @ViewChild('operand')
    protected operand: ElementRef;

    @ViewChild('closeButton', { static: true })
    protected closeButton: ElementRef;

    @HostBinding('class')
    public get styleClasses(): string {
        let classes = 'igx-grid__filtering-row';

        switch (this.column.grid.displayDensity) {
            case DisplayDensity.compact:
                classes = classes + ' igx-grid__filtering-row--compact';
                break;
            case DisplayDensity.cosy:
                classes = classes + ' igx-grid__filtering-row--cosy';
                break;
        }
        return classes;
    }

    public showArrows: boolean;
    public expression: IFilteringExpression;
    public expressionsList: Array<ExpressionUI>;

    private _positionSettings = {
        horizontalStartPoint: HorizontalAlignment.Left,
        verticalStartPoint: VerticalAlignment.Bottom
    };

    private _conditionsOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        scrollStrategy: new AbsoluteScrollStrategy(),
        positionStrategy: new ConnectedPositioningStrategy(this._positionSettings)
    };

    private _operatorsOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        scrollStrategy: new AbsoluteScrollStrategy(),
        positionStrategy: new ConnectedPositioningStrategy(this._positionSettings)
    };

    private chipsAreaWidth: number;
    private chipAreaScrollOffset = 0;
    private _column = null;
    private isKeyPressed = false;
    private isComposing = false;
    private _cancelChipClick = false;

    constructor(public filteringService: IgxFilteringService, public element: ElementRef, public cdr: ChangeDetectorRef) { }

    @HostListener('keydown', ['$event'])
    public onKeydownHandler(evt) {
        if (evt.key === KEYS.ESCAPE || evt.key === KEYS.ESCAPE_IE ||
            evt.ctrlKey && evt.shiftKey && evt.key.toLowerCase() === 'l') {
                evt.preventDefault();
                evt.stopPropagation();
                this.close();
        }
    }

    public ngAfterViewInit() {
        this._conditionsOverlaySettings.outlet = this.column.grid.outlet;
        this._operatorsOverlaySettings.outlet = this.column.grid.outlet;

        const selectedItem = this.expressionsList.find(expr => expr.isSelected === true);
        if (selectedItem) {
            this.expression = selectedItem.expression;
        }

        this.input.nativeElement.focus();
    }

    public get disabled(): boolean {
        return !(this.column.filteringExpressionsTree && this.column.filteringExpressionsTree.filteringOperands.length > 0);
    }

    public get template(): TemplateRef<any> {
        if (this.column.dataType === DataType.Date) {
            return this.defaultDateUI;
        }
        return this.defaultFilterUI;
    }

     public get type() {
        switch (this.column.dataType) {
            case DataType.String:
            case DataType.Boolean:
                return 'text';
            case DataType.Number:
            case DataType.Currency:
                return 'number';
        }
    }

    public get conditions(): any {
        return this.column.filters.conditionList();
    }

    public get isUnaryCondition(): boolean {
        if (this.expression.condition) {
            return this.expression.condition.isUnary;
        } else {
            return true;
        }
    }

    public get placeholder(): string {
        if (this.expression.condition && this.expression.condition.isUnary) {
            return this.filteringService.getChipLabel(this.expression);
        } else if (this.column.dataType === DataType.Date) {
            return this.filteringService.grid.resourceStrings.igx_grid_filter_row_date_placeholder;
        } else if (this.column.dataType === DataType.Boolean) {
            return this.filteringService.grid.resourceStrings.igx_grid_filter_row_boolean_placeholder;
        } else {
            return this.filteringService.grid.resourceStrings.igx_grid_filter_row_placeholder;
        }
    }

    /**
     * Event handler for keydown on the input group's prefix.
     */
    public onPrefixKeyDown(event: KeyboardEvent) {
        if ((event.key === KEYS.ENTER || event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE) && this.dropDownConditions.collapsed) {
            this.toggleConditionsDropDown(this.inputGroupPrefix.nativeElement);
            event.stopImmediatePropagation();
        } else if (event.key === KEYS.TAB && !this.dropDownConditions.collapsed) {
            this.toggleConditionsDropDown(this.inputGroupPrefix.nativeElement);
        }
    }

    /**
     * Event handler for keydown on the input.
     */
    public onInputKeyDown(event: KeyboardEvent) {
        this.isKeyPressed = true;
        event.stopPropagation();
        if (this.column.dataType === DataType.Boolean) {
            if (event.key === KEYS.ENTER || event.key === KEYS.SPACE || event.key === KEYS.SPACE_IE) {
                this.inputGroupPrefix.nativeElement.focus();
                this.toggleConditionsDropDown(this.inputGroupPrefix.nativeElement);
                return;
            }
        }
        if (event.key === KEYS.ENTER) {
            if (this.isComposing) {
                return;
            }
            this.commitInput();
        } else if (event.altKey && (event.key === KEYS.DOWN_ARROW || event.key === KEYS.DOWN_ARROW_IE)) {
            this.inputGroupPrefix.nativeElement.focus();
            this.toggleConditionsDropDown(this.inputGroupPrefix.nativeElement);
        } else if (event.key === KEYS.ESCAPE || event.key === KEYS.ESCAPE_IE ||
            event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'l') {
                this.close();
        }
    }

    /**
     * Event handler for keyup on the input.
     */
    public onInputKeyUp() {
        this.isKeyPressed = false;
    }

    /**
     * Event handler for input on the input.
     */
    public onInput(eventArgs) {
        // The 'iskeyPressed' flag is needed for a case in IE, because the input event is fired on focus and for some reason,
        // when you have a japanese character as a placeholder, on init the value here is empty string .
        const target = eventArgs.target;

        if (isEdge() && target.type !== 'number' || this.isKeyPressed && isIE() || target.value || target.checkValidity()) {
            this.value = target.value;
        }
    }

    /**
     * Event handler for compositionstart on the input.
     */
    public onCompositionStart() {
        this.isComposing = true;
    }

    /**
     * Event handler for compositionend on the input.
     */
    public onCompositionEnd() {
        this.isComposing = false;
    }

    /**
     * Event handler for input click event.
     */
    public onInputClick() {
        if (this.column.dataType === DataType.Boolean && this.dropDownConditions.collapsed) {
            this.inputGroupPrefix.nativeElement.focus();
            this.toggleConditionsDropDown(this.inputGroupPrefix.nativeElement);
        }
    }

    /**
     * Event handler for datepicker's close.
     */
    public datePickerClose() {
        this.input.nativeElement.focus();
    }

    /**
     * Returns the filtering operation condition for a given value.
     */
    public getCondition(value: string): IFilteringOperation {
        return this.column.filters.condition(value);
    }

    /**
     * Returns the translated condition name for a given value.
     */
    public translateCondition(value: string): string {
        return this.filteringService.grid.resourceStrings[`igx_grid_filter_${this.getCondition(value).name}`] || value;
    }

    /**
     * Returns the icon name of the current condition.
     */
    public getIconName(): string {
        if (this.column.dataType === DataType.Boolean && this.expression.condition === null) {
            return this.getCondition(this.conditions[0]).iconName;
        } else {
            return this.expression.condition.iconName;
        }
    }

    /**
     * Returns whether a given condition is selected in dropdown.
     */
    public isConditionSelected(conditionName: string): boolean {
        if (this.expression.condition) {
            return this.expression.condition.name === conditionName;
        } else {
            return false;
        }
    }

    /**
     * Clears the current filtering.
     */
    public clearFiltering() {
        this.filteringService.clearFilter(this.column.field);
        this.resetExpression();
        if (this.input) {
            this.input.nativeElement.focus();
        }
        this.cdr.detectChanges();

        this.chipAreaScrollOffset = 0;
        this.transform(this.chipAreaScrollOffset);
    }

    /**
     * Commits the value of the input.
     */
    public commitInput() {
        const selectedItem = this.expressionsList.filter(ex => ex.isSelected === true);
        selectedItem.forEach(e => e.isSelected = false);

        let indexToDeselect = -1;
        for (let index = 0; index < this.expressionsList.length; index++) {
            const expression = this.expressionsList[index].expression;
            if (expression.searchVal === null && !expression.condition.isUnary) {
                indexToDeselect = index;
            }
        }
        if (indexToDeselect !== -1) {
            this.removeExpression(indexToDeselect, this.expression);
        }
        this.resetExpression();
        this.scrollChipsWhenAddingExpression();
    }

    /**
     * Clears the value of the input.
     */
    public clearInput() {
        this.value = null;
    }

    /**
     * Event handler for keydown on clear button.
     */
    public onClearKeyDown(eventArgs: KeyboardEvent) {
        if (eventArgs.key === KEYS.ENTER || eventArgs.key === KEYS.SPACE || eventArgs.key === KEYS.SPACE_IE) {
            eventArgs.preventDefault();
            this.clearInput();
            this.input.nativeElement.focus();
        }
    }

    /**
     * Event handler for click on clear button.
     */
    public onClearClick() {
        this.clearInput();
        this.input.nativeElement.focus();
    }

    /**
     * Event handler for keydown on commit button.
     */
    public onCommitKeyDown(eventArgs: KeyboardEvent) {
        if (eventArgs.key === KEYS.ENTER || eventArgs.key === KEYS.SPACE || eventArgs.key === KEYS.SPACE_IE) {
            eventArgs.preventDefault();
            this.commitInput();
            this.input.nativeElement.focus();
        }
    }

    /**
     * Event handler for click on commit button.
     */
    public onCommitClick() {
        this.commitInput();
        this.input.nativeElement.focus();
    }

    /**
     * Event handler for focusout on the input group.
     */
    public onInputGroupFocusout() {
        if (!this.value && this.value !== 0 &&
            this.expression.condition && !this.expression.condition.isUnary) {
            return;
        }
        requestAnimationFrame(() => {
            const focusedElement = document.activeElement;

            if (focusedElement.className === 'igx-chip__remove' || focusedElement.tagName === 'IGX-DAY-ITEM') {
                return;
            }

            if (!(focusedElement && this.inputGroup.nativeElement.contains(focusedElement))
                && this.dropDownConditions.collapsed) {
                this.commitInput();
            }
        });
    }

    /**
     * Closes the filtering edit row.
     */
    public close() {
        if (this.expressionsList.length === 1 &&
            this.expressionsList[0].expression.searchVal === null &&
            this.expressionsList[0].expression.condition.isUnary === false) {
            this.filteringService.getExpressions(this.column.field).pop();

            this.filter();
        } else {
            const condToRemove = this.expressionsList.filter(ex => ex.expression.searchVal === null && !ex.expression.condition.isUnary);
            if (condToRemove && condToRemove.length > 0) {
                condToRemove.forEach(c => this.filteringService.removeExpression(this.column.field, this.expressionsList.indexOf(c)));
                this.filter();
            }
        }

        this.filteringService.isFilterRowVisible = false;
        this.filteringService.updateFilteringCell(this.column);
        this.filteringService.filteredColumn = null;
        this.filteringService.selectedExpression = null;
        this.filteringService.grid.theadRow.nativeElement.focus();

        this.chipAreaScrollOffset = 0;
        this.transform(this.chipAreaScrollOffset);
    }

    /**
     *  Event handler for date picker's selection.
     */
    public onDateSelected(value: Date) {
        this.value = value;
    }

    /** @hidden @internal */
    public inputGroupPrefixClick(event: MouseEvent) {
        event.stopPropagation();
        (event.currentTarget as HTMLElement).focus();
        this.toggleConditionsDropDown(event.currentTarget);
    }

    /**
     * Opens the conditions dropdown.
     */
    public toggleConditionsDropDown(target: any) {
        this._conditionsOverlaySettings.target = target;
        this._conditionsOverlaySettings.excludeFromOutsideClick = [target as HTMLElement];
        this.dropDownConditions.toggle(this._conditionsOverlaySettings);
    }

    /**
     * Opens the logic operators dropdown.
     */
    public toggleOperatorsDropDown(eventArgs, index) {
        this._operatorsOverlaySettings.target = eventArgs.target.parentElement;
        this._operatorsOverlaySettings.excludeFromOutsideClick = [eventArgs.target.parentElement as HTMLElement];
        this.dropDownOperators.toArray()[index].toggle(this._operatorsOverlaySettings);
    }

    /**
     * Event handler for change event in conditions dropdown.
     */
    public onConditionsChanged(eventArgs) {
        const value = (eventArgs.newSelection as IgxDropDownItemComponent).value;
        this.expression.condition = this.getCondition(value);
        if (this.expression.condition.isUnary) {
            // update grid's filtering on the next cycle to ensure the drop-down is closed
            // if the drop-down is not closed this event handler will be invoked multiple times
            requestAnimationFrame(() => this.unaryConditionChangedCallback());
        } else {
            requestAnimationFrame(() => this.conditionChangedCallback());
        }

        if (this.input) {
            // Add requestAnimationFrame becasue of an issue in IE, where you are still able to write in the input,
            // if it has been focused and then set to readonly.
            requestAnimationFrame(() => this.input.nativeElement.focus());
        }
    }


    public onChipPointerdown(args, chip: IgxChipComponent) {
        const activeElement = document.activeElement;
        this._cancelChipClick = chip.selected && activeElement &&
            this.inputGroup.nativeElement.contains(activeElement);
    }

    public onChipClick(args, item: ExpressionUI) {
        if (this._cancelChipClick) {
            this._cancelChipClick = false;
            return;
        }

        this.expressionsList.forEach(ex => ex.isSelected = false);

        this.toggleChip(item);
    }

    public toggleChip(item: ExpressionUI) {
        item.isSelected = !item.isSelected;
        if (item.isSelected) {
            this.expression = item.expression;

            if (this.input) {
                this.input.nativeElement.focus();
            }
        }
    }

    /**
     * Event handler for chip keydown event.
     */
    public onChipKeyDown(eventArgs: KeyboardEvent, item: ExpressionUI) {
        if (eventArgs.key === KEYS.ENTER) {
            eventArgs.preventDefault();

            this.toggleChip(item);
        }
    }

    /**
     * Scrolls the first chip into view if the tab key is pressed on the left arrow.
     */
    public onLeftArrowKeyDown(event) {
        if (event.key === KEYS.TAB) {
            this.chipAreaScrollOffset = 0;
            this.transform(this.chipAreaScrollOffset);
        }
    }

    /**
     * Event handler for chip removed event.
     */
    public onChipRemoved(eventArgs: IBaseChipEventArgs, item: ExpressionUI) {
        const indexToRemove = this.expressionsList.indexOf(item);
        this.removeExpression(indexToRemove, item.expression);

        this.scrollChipsOnRemove();
    }

    /**
     * Event handler for logic operator changed event.
     */
    public onLogicOperatorChanged(eventArgs: ISelectionEventArgs, expression: ExpressionUI) {
        if (eventArgs.oldSelection) {
            expression.afterOperator = (eventArgs.newSelection as IgxDropDownItemComponent).value;
            this.expressionsList[this.expressionsList.indexOf(expression) + 1].beforeOperator = expression.afterOperator;

            // update grid's filtering on the next cycle to ensure the drop-down is closed
            // if the drop-down is not closed this event handler will be invoked multiple times
            requestAnimationFrame(() => this.filter());
        }
    }

    /**
     * Scrolls the chips into the chip area when left or right arrows are pressed.
     */
    public scrollChipsOnArrowPress(arrowPosition: string) {
        let count = 0;
        const chipAraeChildren = this.chipsArea.element.nativeElement.children;
        const containerRect = this.container.nativeElement.getBoundingClientRect();

        if (arrowPosition === 'right') {
            for (const chip of chipAraeChildren) {
                if (Math.ceil(chip.getBoundingClientRect().right) < Math.ceil(containerRect.right)) {
                    count++;
                }
            }

            if (count < chipAraeChildren.length) {
                this.chipAreaScrollOffset -= Math.ceil(chipAraeChildren[count].getBoundingClientRect().right) -
                    Math.ceil(containerRect.right) + 1;
                this.transform(this.chipAreaScrollOffset);
            }
        }

        if (arrowPosition === 'left') {
            for (const chip of chipAraeChildren) {
                if (Math.ceil(chip.getBoundingClientRect().left) < Math.ceil(containerRect.left)) {
                    count++;
                }
            }

            if (count > 0) {
                this.chipAreaScrollOffset += Math.ceil(containerRect.left) -
                    Math.ceil(chipAraeChildren[count - 1].getBoundingClientRect().left) + 1;
                this.transform(this.chipAreaScrollOffset);
            }
        }
    }

    /**
     * @hidden
     * Resets the chips area
     * @memberof IgxGridFilteringRowComponent
     */
    public resetChipsArea() {
        this.chipAreaScrollOffset = 0;
        this.transform(this.chipAreaScrollOffset);
        this.showHideArrowButtons();
    }

    private showHideArrowButtons() {
        requestAnimationFrame(() => {
            if (this.filteringService.isFilterRowVisible) {
                const containerWidth = this.container.nativeElement.getBoundingClientRect().width;
                this.chipsAreaWidth = this.chipsArea.element.nativeElement.getBoundingClientRect().width;

                this.showArrows = this.chipsAreaWidth >= containerWidth && this.isColumnFiltered;

                // TODO: revise the cdr.detectChanges() usage here
                if (!(this.cdr as ViewRef).destroyed) {
                this.cdr.detectChanges();
}
            }
        });
    }

    private addExpression(isSelected: boolean) {
        const exprUI = new ExpressionUI();
        exprUI.expression = this.expression;
        exprUI.beforeOperator = this.expressionsList.length > 0 ? FilteringLogic.And : null;
        exprUI.isSelected = isSelected;

        this.expressionsList.push(exprUI);

        const length = this.expressionsList.length;
        if (this.expressionsList[length - 2]) {
            this.expressionsList[length - 2].afterOperator = this.expressionsList[length - 1].beforeOperator;
        }

        this.showHideArrowButtons();
    }

    private removeExpression(indexToRemove: number, expression: IFilteringExpression) {
        if (indexToRemove === 0 && this.expressionsList.length === 1) {
            this.clearFiltering();
            return;
        }

        this.filteringService.removeExpression(this.column.field, indexToRemove);

        this.filter();

        if (this.expression === expression) {
            this.resetExpression();
        }

        this.showHideArrowButtons();
    }

    private resetExpression() {
        this.expression = {
            fieldName: this.column.field,
            condition: null,
            searchVal: null,
            ignoreCase: this.column.filteringIgnoreCase
        };

        if (this.column.dataType !== DataType.Boolean) {
            this.expression.condition = this.getCondition(this.conditions[0]);
        }

        if (this.column.dataType === DataType.Date && this.input) {
            this.input.nativeElement.value = null;
        }

        this.showHideArrowButtons();
    }

    private scrollChipsWhenAddingExpression() {
        const chipAraeChildren = this.chipsArea.element.nativeElement.children;
        if (!chipAraeChildren || chipAraeChildren.length === 0) {
            return;
        }

        const containerRectRight = Math.ceil(this.container.nativeElement.getBoundingClientRect().right);

        const lastChipRectRight = Math.ceil(chipAraeChildren[chipAraeChildren.length - 1].getBoundingClientRect().right);
        if (lastChipRectRight >= containerRectRight) {
            this.chipAreaScrollOffset -= lastChipRectRight - containerRectRight;
            this.transform(this.chipAreaScrollOffset);
        }
    }

    private transform(offset: number) {
        requestAnimationFrame(() => {
            this.chipsArea.element.nativeElement.style.transform = `translate(${offset}px)`;
        });
    }

    private scrollChipsOnRemove() {
        let count = 0;
        const chipAraeChildren = this.chipsArea.element.nativeElement.children;
        const containerRect = this.container.nativeElement.getBoundingClientRect();

        for (const chip of chipAraeChildren) {
            if (Math.ceil(chip.getBoundingClientRect().right) < Math.ceil(containerRect.left)) {
                count++;
            }
        }

        if (count <= 2) {
            this.chipAreaScrollOffset = 0;
        } else {
            const dif = chipAraeChildren[count].id === 'chip' ? count - 2 : count - 1;
            this.chipAreaScrollOffset += Math.ceil(containerRect.left) - Math.ceil(chipAraeChildren[dif].getBoundingClientRect().left) + 1;
        }

        this.transform(this.chipAreaScrollOffset);
    }

    private conditionChangedCallback() {
        if (!!this.expression.searchVal || this.expression.searchVal === 0) {
            this.filter();
        } else if (this.value) {
            this.value = null;
        }
    }

    private unaryConditionChangedCallback() {
        if (this.value) {
            this.value = null;
        }
        if (this.expressionsList.find(item => item.expression === this.expression) === undefined) {
            this.addExpression(true);
        }
        this.filter();
    }

    private filter() {
        this.filteringService.filterInternal(this.column.field);
    }

    private get isColumnFiltered() {
        return this.column.filteringExpressionsTree && this.column.filteringExpressionsTree.filteringOperands.length > 0;
    }

    public get isNarrowWidth(): boolean {
        return this.element.nativeElement.offsetWidth < 432;
    }
}
