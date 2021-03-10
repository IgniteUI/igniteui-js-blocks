import {
    Component,
    Input,
    ChangeDetectorRef,
    ViewChild,
    AfterViewInit,
    TemplateRef,
    ViewChildren,
    QueryList,
    ElementRef
} from '@angular/core';
import { IgxColumnComponent } from '../../columns/column.component';
import { IgxFilteringService, ExpressionUI } from '../grid-filtering.service';
import { FilteringLogic } from '../../../data-operations/filtering-expression.interface';
import { DataType } from '../../../data-operations/data-util';
import {
    IgxStringFilteringOperand,
    IgxBooleanFilteringOperand,
    IgxNumberFilteringOperand,
    IgxDateFilteringOperand
} from '../../../data-operations/filtering-condition';
import { IgxToggleDirective } from '../../../directives/toggle/toggle.directive';
import {
    AutoPositionStrategy,
    OverlaySettings,
    VerticalAlignment,
    PositionSettings,
    HorizontalAlignment,
    IgxOverlayService,
    AbsoluteScrollStrategy
} from '../../../services/public_api';
import { ILogicOperatorChangedArgs, IgxExcelStyleDefaultExpressionComponent } from './excel-style-default-expression.component';
import { KEYS } from '../../../core/utils';
import { IgxExcelStyleDateExpressionComponent } from './excel-style-date-expression.component';
import { DisplayDensity } from '../../../core/density';

/**
 * @hidden
 */
@Component({
    preserveWhitespaces: false,
    selector: 'igx-excel-style-custom-dialog',
    templateUrl: './excel-style-custom-dialog.component.html'
})
export class IgxExcelStyleCustomDialogComponent implements AfterViewInit {
    @Input()
    public expressionsList = new Array<ExpressionUI>();
    @Input()
    public column: IgxColumnComponent;

    @Input()
    public selectedOperator: string;

    @Input()
    public filteringService: IgxFilteringService;

    @Input()
    public overlayComponentId: string;

    @Input()
    public overlayService: IgxOverlayService;

    @Input()
    public displayDensity: DisplayDensity;

    @ViewChild('toggle', { read: IgxToggleDirective, static: true })
    public toggle: IgxToggleDirective;

    @ViewChild('defaultExpressionTemplate', { read: TemplateRef })
    protected defaultExpressionTemplate: TemplateRef<any>;

    @ViewChild('dateExpressionTemplate', { read: TemplateRef })
    protected dateExpressionTemplate: TemplateRef<any>;

    @ViewChild('expressionsContainer', { static: true })
    protected expressionsContainer: ElementRef;

    @ViewChildren(IgxExcelStyleDefaultExpressionComponent)
    private expressionComponents: QueryList<IgxExcelStyleDefaultExpressionComponent>;

    @ViewChildren(IgxExcelStyleDateExpressionComponent)
    private expressionDateComponents: QueryList<IgxExcelStyleDateExpressionComponent>;

    private _customDialogPositionSettings: PositionSettings = {
        verticalDirection: VerticalAlignment.Middle,
        horizontalDirection: HorizontalAlignment.Center,
        horizontalStartPoint: HorizontalAlignment.Center,
        verticalStartPoint: VerticalAlignment.Middle
    };

    private _customDialogOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false,
        positionStrategy: new AutoPositionStrategy(this._customDialogPositionSettings),
        scrollStrategy: new AbsoluteScrollStrategy()
    };


    constructor(private cdr: ChangeDetectorRef) {}

    public ngAfterViewInit(): void {
        this._customDialogOverlaySettings.outlet = this.grid.outlet;
    }

    public get template(): TemplateRef<any> {
        if (this.column.dataType === DataType.Date) {
            return this.dateExpressionTemplate;
        }

        return this.defaultExpressionTemplate;
    }

    public get grid(): any {
        return this.filteringService.grid;
    }

    public onCustomDialogOpening() {
        if (this.selectedOperator) {
            this.createInitialExpressionUIElement();
        }
    }

    public onCustomDialogOpened() {
        if (this.expressionComponents.first) {
            this.expressionComponents.first.focus();
        }
    }

    public open(esf) {
        this._customDialogOverlaySettings.target =
            this.overlayComponentId ?
                this.grid.rootGrid ? this.grid.rootGrid.nativeElement : this.grid.nativeElement :
                esf;
        this.toggle.open(this._customDialogOverlaySettings);
    }

    public onClearButtonClick() {
        this.filteringService.clearFilter(this.column.field);
        this.createInitialExpressionUIElement();
        this.cdr.detectChanges();
    }

    public closeDialog() {
        if (this.overlayComponentId) {
            this.overlayService.hide(this.overlayComponentId);
        } else {
            this.toggle.close();
        }
    }

    public onApplyButtonClick() {
        this.expressionsList = this.expressionsList.filter(
            element => element.expression.condition &&
            (element.expression.searchVal || element.expression.searchVal === 0 || element.expression.condition.isUnary));

        if (this.expressionsList.length > 0) {
            this.expressionsList[0].beforeOperator = null;
            this.expressionsList[this.expressionsList.length - 1].afterOperator = null;
        }

        this.filteringService.filterInternal(this.column.field, this.expressionsList);
        this.closeDialog();
    }

    public onAddButtonClick() {
        const exprUI = new ExpressionUI();
        exprUI.expression = {
            condition: null,
            fieldName: this.column.field,
            ignoreCase: this.column.filteringIgnoreCase,
            searchVal: null
        };

        this.expressionsList[this.expressionsList.length - 1].afterOperator = FilteringLogic.And;
        exprUI.beforeOperator = this.expressionsList[this.expressionsList.length - 1].afterOperator;

        this.expressionsList.push(exprUI);

        this.markChildrenForCheck();
        this.scrollToBottom();
    }

    public onExpressionRemoved(event: ExpressionUI) {
        const indexToRemove = this.expressionsList.indexOf(event);

        if (indexToRemove === 0 && this.expressionsList.length > 1) {
            this.expressionsList[1].beforeOperator = null;
        } else if (indexToRemove === this.expressionsList.length - 1) {
            this.expressionsList[indexToRemove - 1].afterOperator = null;
        } else {
            this.expressionsList[indexToRemove - 1].afterOperator = this.expressionsList[indexToRemove + 1].beforeOperator;
            this.expressionsList[0].beforeOperator = null;
            this.expressionsList[this.expressionsList.length - 1].afterOperator = null;
        }

        this.expressionsList.splice(indexToRemove, 1);

        this.cdr.detectChanges();

        this.markChildrenForCheck();
    }

    public onLogicOperatorChanged(event: ILogicOperatorChangedArgs) {
        const index = this.expressionsList.indexOf(event.target);
        event.target.afterOperator = event.newValue;
        if (index + 1 < this.expressionsList.length) {
            this.expressionsList[index + 1].beforeOperator = event.newValue;
        }
    }

    public onKeyDown(eventArgs) {
        eventArgs.stopPropagation();
    }

    public onApplyButtonKeyDown(eventArgs) {
        if (eventArgs.key === KEYS.TAB && !eventArgs.shiftKey) {
            eventArgs.stopPropagation();
            eventArgs.preventDefault();
        }
    }

    private createCondition(conditionName: string) {
        switch (this.column.dataType) {
            case DataType.Boolean:
                return IgxBooleanFilteringOperand.instance().condition(conditionName);
            case DataType.Number:
            case DataType.Currency:
            case DataType.Percent:
                return IgxNumberFilteringOperand.instance().condition(conditionName);
            case DataType.Date:
                return IgxDateFilteringOperand.instance().condition(conditionName);
            default:
                return IgxStringFilteringOperand.instance().condition(conditionName);
        }
    }

    private markChildrenForCheck() {
        this.expressionComponents.forEach(x => x.cdr.markForCheck());
        this.expressionDateComponents.forEach(x => x.cdr.markForCheck());
    }

    private createInitialExpressionUIElement() {
        this.expressionsList = [];
        const firstExprUI = new ExpressionUI();

        firstExprUI.expression = {
            condition: this.createCondition(this.selectedOperator),
            fieldName: this.column.field,
            ignoreCase: this.column.filteringIgnoreCase,
            searchVal: null
        };
        firstExprUI.afterOperator = FilteringLogic.And;

        this.expressionsList.push(firstExprUI);

        const secondExprUI = new ExpressionUI();
        secondExprUI.expression = {
            condition: null,
            fieldName: this.column.field,
            ignoreCase: this.column.filteringIgnoreCase,
            searchVal: null
        };

        secondExprUI.beforeOperator = FilteringLogic.And;

        this.expressionsList.push(secondExprUI);
    }

    private scrollToBottom() {
        requestAnimationFrame(() => {
            this.expressionsContainer.nativeElement.scrollTop = this.expressionsContainer.nativeElement.scrollHeight;
        });
    }
}
