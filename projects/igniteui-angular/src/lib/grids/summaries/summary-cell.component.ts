import { Component, Input, HostBinding, HostListener, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { IgxSummaryResult } from './grid-summary';
import { IgxColumnComponent } from '../columns/column.component';
import { DataType } from '../../data-operations/data-util';
import { ISelectionNode } from '../selection/selection.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-summary-cell',
    templateUrl: './summary-cell.component.html'
})
export class IgxSummaryCellComponent {

    @Input()
    public summaryResults: IgxSummaryResult[];

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public firstCellIndentation = 0;

    @Input()
    public hasSummary = false;

    @Input()
    public density;

    /** @hidden */
    @Input()
    @HostBinding('class.igx-grid-summary--active')
    public active: boolean;

    @Input()
    @HostBinding('attr.data-rowIndex')
    public rowIndex: number;

    constructor(private element: ElementRef) {
    }

    @HostBinding('attr.data-visibleIndex')
    public get visibleColumnIndex(): number {
        return this.column.visibleIndex;
    }

    @HostBinding('attr.id')
    public get attrCellID() {
        return `${this.grid.id}_${this.rowIndex}_${ this.visibleColumnIndex}`;
    }

    @HostListener('pointerdown')
    public activate() {
        const currNode = this.grid.navigation.activeNode;
        if (currNode && this.rowIndex === currNode.row && this.visibleColumnIndex === currNode.column) {
            return;
        }

        this.grid.navigation.setActiveNode({row: this.rowIndex, column: this.visibleColumnIndex}, 'summaryCell');
        this.grid.cdr.detectChanges();
    }

    protected get selectionNode(): ISelectionNode {
        return {
            row: this.rowIndex,
            column: this.column.columnLayoutChild ? this.column.parent.visibleIndex : this.visibleColumnIndex,
            isSummaryRow: true
        };
    }

    public get width() {
        return this.column.getCellWidth();
    }

    public get nativeElement(): any {
        return this.element.nativeElement;
    }

    public get columnDatatype(): DataType {
        return this.column.dataType;
    }

    public get itemHeight() {
        return this.column.grid.defaultSummaryHeight;
    }

    /**
     * @hidden
     */
    public get grid() {
        return (this.column.grid as any);
    }

    public translateSummary(summary: IgxSummaryResult): string {
        return this.grid.resourceStrings[`igx_grid_summary_${summary.key}`] || summary.label;
    }
}
