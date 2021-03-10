import { FilteringLogic, IFilteringExpression } from './filtering-expression.interface';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from './filtering-expressions-tree';
import { resolveNestedPath, parseDate } from '../core/utils';
import { GridType } from '../grids/common/grid.interface';

const DateType = 'date';

export interface IFilteringStrategy {
    filter(data: any[], expressionsTree: IFilteringExpressionsTree, advancedExpressionsTree?: IFilteringExpressionsTree,
        grid?: GridType): any[];
}

export class NoopFilteringStrategy implements IFilteringStrategy {
    private static _instance: NoopFilteringStrategy = null;

    private constructor() {  }

    public static instance() {
        return this._instance || (this._instance = new NoopFilteringStrategy());
    }

    public filter(data: any[], _: IFilteringExpressionsTree, __?: IFilteringExpressionsTree): any[] {
        return data;
    }
}

export abstract class BaseFilteringStrategy implements IFilteringStrategy  {
    public findMatchByExpression(rec: any, expr: IFilteringExpression, isDate?: boolean, grid?: GridType): boolean {
        const cond = expr.condition;
        const val = this.getFieldValue(rec, expr.fieldName, isDate, grid);
        return cond.logic(val, expr.searchVal, expr.ignoreCase);
    }

    public matchRecord(rec: any, expressions: IFilteringExpressionsTree | IFilteringExpression, grid?: GridType): boolean {
        if (expressions) {
            if (expressions instanceof FilteringExpressionsTree) {
                const expressionsTree = expressions as IFilteringExpressionsTree;
                const operator = expressionsTree.operator as FilteringLogic;
                let matchOperand;

                if (expressionsTree.filteringOperands && expressionsTree.filteringOperands.length) {
                    for (const operand of expressionsTree.filteringOperands) {
                        matchOperand = this.matchRecord(rec, operand, grid);

                        // Return false if at least one operand does not match and the filtering logic is And
                        if (!matchOperand && operator === FilteringLogic.And) {
                            return false;
                        }

                        // Return true if at least one operand matches and the filtering logic is Or
                        if (matchOperand && operator === FilteringLogic.Or) {
                            return true;
                        }
                    }

                    return matchOperand;
                }

                return true;
            } else {
                const expression = expressions as IFilteringExpression;
                const isDate = grid && grid.getColumnByName(expression.fieldName) ?
                    grid.getColumnByName(expression.fieldName).dataType === DateType : false;
                return this.findMatchByExpression(rec, expression, isDate, grid);
            }
        }

        return true;
    }

    public abstract filter(data: any[], expressionsTree: IFilteringExpressionsTree,
        advancedExpressionsTree?: IFilteringExpressionsTree, grid?: GridType): any[];

    protected abstract getFieldValue(rec: any, fieldName: string, isDate?: boolean, grid?: GridType): any;
}

export class FilteringStrategy extends BaseFilteringStrategy {
    private static _instace: FilteringStrategy = null;

    constructor() {
        super();
    }

    public static instance() {
        return this._instace || (this._instace = new this());
    }

    public filter<T>(data: T[], expressionsTree: IFilteringExpressionsTree, advancedExpressionsTree: IFilteringExpressionsTree,
        grid: GridType): T[] {
        let i;
        let rec;
        const len = data.length;
        const res: T[] = [];

        if ((FilteringExpressionsTree.empty(expressionsTree) && FilteringExpressionsTree.empty(advancedExpressionsTree)) || !len) {
            return data;
        }
        for (i = 0; i < len; i++) {
            rec = data[i];
            if (this.matchRecord(rec, expressionsTree, grid) && this.matchRecord(rec, advancedExpressionsTree, grid)) {
                res.push(rec);
            }
        }
        return res;
    }

    protected getFieldValue(rec: any, fieldName: string, isDate: boolean = false): any {
        let value = resolveNestedPath(rec, fieldName);
        value = value && isDate ? parseDate(value) : value;
        return value;
    }
}
export class FormattedValuesFilteringStrategy extends FilteringStrategy {
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
        let value = resolveNestedPath(rec, fieldName);

        value = column.formatter && this.shouldApplyFormatter(fieldName) ?
            column.formatter(value) :
            value && isDate ? parseDate(value) : value;

        return value;
    }
}
