import { parseDate, resolveNestedPath } from '../../core/utils';
import { DataUtil } from '../../data-operations/data-util';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { BaseFilteringStrategy } from '../../data-operations/filtering-strategy';
import { GridType } from '../common/grid.interface';
import { ITreeGridRecord } from './tree-grid.interfaces';

export class TreeGridFilteringStrategy extends BaseFilteringStrategy {
    public filter(data: ITreeGridRecord[], expressionsTree: IFilteringExpressionsTree,
        advancedExpressionsTree?: IFilteringExpressionsTree, grid?: GridType): ITreeGridRecord[] {
        return this.filterImpl(data, expressionsTree, advancedExpressionsTree, undefined, grid);
    }

    protected getFieldValue(rec: any, fieldName: string, isDate: boolean = false): any {
        const hierarchicalRecord = rec as ITreeGridRecord;
        let value = resolveNestedPath(hierarchicalRecord.data, fieldName);
        value = value && isDate ? parseDate(value) : value;
        return value;
    }

    private filterImpl(data: ITreeGridRecord[], expressionsTree: IFilteringExpressionsTree,
        advancedExpressionsTree: IFilteringExpressionsTree, parent: ITreeGridRecord, grid?: GridType): ITreeGridRecord[] {
        let i: number;
        let rec: ITreeGridRecord;
        const len = data.length;
        const res: ITreeGridRecord[] = [];
        if ((FilteringExpressionsTree.empty(expressionsTree) && FilteringExpressionsTree.empty(advancedExpressionsTree)) || !len) {
            return data;
        }
        for (i = 0; i < len; i++) {
            rec = DataUtil.cloneTreeGridRecord(data[i]);
            rec.parent = parent;
            if (rec.children) {
                const filteredChildren = this.filterImpl(rec.children, expressionsTree, advancedExpressionsTree, rec, grid);
                rec.children = filteredChildren.length > 0 ? filteredChildren : null;
            }

            if (this.matchRecord(rec, expressionsTree, grid) && this.matchRecord(rec, advancedExpressionsTree, grid)) {
                res.push(rec);
            } else if (rec.children && rec.children.length > 0) {
                rec.isFilteredOutParent = true;
                res.push(rec);
            }
        }
        return res;
    }
}

export class TreeGridFormattedValuesFilteringStrategy extends TreeGridFilteringStrategy {
    /**
     * Creates a new instance of FormattedValuesFilteringStrategy.
     *
     * @param fields An array of column field names that should be formatted.
     * If omitted the values of all columns which has formatter will be formatted.
     */
    constructor(private fields?: string[]) {
        super();
    }

    /** @hidden */
    public shouldApplyFormatter(fieldName: string): boolean {
        return !this.fields || this.fields.length === 0 || this.fields.some(f => f === fieldName);
    }

    protected getFieldValue(rec: any, fieldName: string, isDate: boolean = false, grid?: GridType): any {
        const column = grid.getColumnByName(fieldName);
        const hierarchicalRecord = rec as ITreeGridRecord;
        let value = resolveNestedPath(hierarchicalRecord.data, fieldName);

        value = column.formatter && this.shouldApplyFormatter(fieldName) ?
            column.formatter(value) :
            value && isDate ? parseDate(value) : value;

        return value;
    }
}
