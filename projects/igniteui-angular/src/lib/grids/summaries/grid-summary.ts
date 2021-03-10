import { DecimalPipe, DatePipe, CurrencyPipe, getLocaleCurrencyCode, PercentPipe } from '@angular/common';
import { IColumnPipeArgs } from '../columns/interfaces';

export interface ISummaryExpression {
    fieldName: string;
    customSummary?: any;
}
export interface IgxSummaryResult {
    key: string;
    label: string;
    summaryResult: any;
}

export interface ISummaryRecord {
    summaries: Map<string, IgxSummaryResult[]>;
    max?: number;
    cellIndentation?: number;
}

const clear = (el) => el === 0 || Boolean(el);
const first = (arr) => arr[0];
const last = (arr) => arr[arr.length - 1];

export class IgxSummaryOperand {
    /**
     * Counts all the records in the data source.
     * If filtering is applied, counts only the filtered records.
     * ```typescript
     * IgxSummaryOperand.count(dataSource);
     * ```
     *
     * @memberof IgxSummaryOperand
     */
    public static count(data: any[]): number {
        return data.length;
    }
    /**
     * Executes the static `count` method and returns `IgxSummaryResult[]`.
     * ```typescript
     * interface IgxSummaryResult {
     *   key: string;
     *   label: string;
     *   summaryResult: any;
     * }
     * ```
     * Can be overridden in the inherited classes to provide customization for the `summary`.
     * ```typescript
     * class CustomSummary extends IgxSummaryOperand {
     *   constructor() {
     *     super();
     *   }
     *   public operate(data: any[], allData: any[], fieldName: string): IgxSummaryResult[] {
     *     const result = [];
     *     result.push({
     *       key: "test",
     *       label: "Test",
     *       summaryResult: IgxSummaryOperand.count(data)
     *     });
     *     return result;
     *   }
     * }
     * this.grid.getColumnByName('ColumnName').summaries = CustomSummary;
     * ```
     *
     * @memberof IgxSummaryOperand
     */
    public operate(data: any[] = [], allData: any[] = [], fieldName?: string, locale: string = 'en-US'): IgxSummaryResult[] {
        const pipe = new DecimalPipe(locale);
        return [{
            key: 'count',
            label: 'Count',
            summaryResult: pipe.transform(IgxSummaryOperand.count(data))
        }];
    }
}

// @dynamic
export class IgxNumberSummaryOperand extends IgxSummaryOperand {
    /**
     * Returns the minimum numeric value in the provided data records.
     * If filtering is applied, returns the minimum value in the filtered data records.
     * ```typescript
     * IgxNumberSummaryOperand.min(data);
     * ```
     *
     * @memberof IgxNumberSummaryOperand
     */
    public static min(data: any[]): number {
        return data.length && data.filter(clear).length ? data.filter(clear).reduce((a, b) => Math.min(a, b)) : 0;
    }
    /**
     * Returns the maximum numeric value in the provided data records.
     * If filtering is applied, returns the maximum value in the filtered data records.
     * ```typescript
     * IgxNumberSummaryOperand.max(data);
     * ```
     *
     * @memberof IgxNumberSummaryOperand
     */
    public static max(data: any[]): number {
        return data.length && data.filter(clear).length ? data.filter(clear).reduce((a, b) => Math.max(a, b)) : 0;
    }
    /**
     * Returns the sum of the numeric values in the provided data records.
     * If filtering is applied, returns the sum of the numeric values in the data records.
     * ```typescript
     * IgxNumberSummaryOperand.sum(data);
     * ```
     *
     * @memberof IgxNumberSummaryOperand
     */
    public static sum(data: any[]): number {
        return data.length && data.filter(clear).length ? data.filter(clear).reduce((a, b) => +a + +b) : 0;
    }
    /**
     * Returns the average numeric value in the data provided data records.
     * If filtering is applied, returns the average numeric value in the filtered data records.
     * ```typescript
     * IgxSummaryOperand.average(data);
     * ```
     *
     * @memberof IgxNumberSummaryOperand
     */
    public static average(data: any[]): number {
        return data.length && data.filter(clear).length ? this.sum(data) / this.count(data) : 0;
    }
    /**
     * Executes the static methods and returns `IgxSummaryResult[]`.
     * ```typescript
     * interface IgxSummaryResult {
     *   key: string;
     *   label: string;
     *   summaryResult: any;
     * }
     * ```
     * Can be overridden in the inherited classes to provide customization for the `summary`.
     * ```typescript
     * class CustomNumberSummary extends IgxNumberSummaryOperand {
     *   constructor() {
     *     super();
     *   }
     *   public operate(data: any[], allData: any[], fieldName: string, locale: string, pipeArgs: IColumnPipeArgs): IgxSummaryResult[] {
     *     pipeArgs.digitsInfo = '1.1-2';
     *     const result = super.operate(data, allData, fieldName, locale, pipeArgs);
     *     result.push({
     *       key: "avg",
     *       label: "Avg",
     *       summaryResult: IgxNumberSummaryOperand.average(data)
     *     });
     *     result.push({
     *       key: 'mdn',
     *       label: 'Median',
     *       summaryResult: this.findMedian(data)
     *     });
     *     return result;
     *   }
     * }
     * this.grid.getColumnByName('ColumnName').summaries = CustomNumberSummary;
     * ```
     *
     * @memberof IgxNumberSummaryOperand
     */
    public operate(data: any[] = [], allData: any[] = [], fieldName?: string, locale: string = 'en-US',
        pipeArgs: IColumnPipeArgs = {}): IgxSummaryResult[] {
        const result = super.operate(data, allData, fieldName, locale);
        const pipe = new DecimalPipe(locale);
        result.push({
            key: 'min',
            label: 'Min',
            summaryResult: pipe.transform(IgxNumberSummaryOperand.min(data), pipeArgs.digitsInfo)
        });
        result.push({
            key: 'max',
            label: 'Max',
            summaryResult: pipe.transform(IgxNumberSummaryOperand.max(data), pipeArgs.digitsInfo)
        });
        result.push({
            key: 'sum',
            label: 'Sum',
            summaryResult: pipe.transform(IgxNumberSummaryOperand.sum(data), pipeArgs.digitsInfo)
        });
        result.push({
            key: 'average',
            label: 'Avg',
            summaryResult: pipe.transform(IgxNumberSummaryOperand.average(data), pipeArgs.digitsInfo)
        });
        return result;
    }
}

// @dynamic
export class IgxDateSummaryOperand extends IgxSummaryOperand {
    /**
     * Returns the latest date value in the data records.
     * If filtering is applied, returns the latest date value in the filtered data records.
     * ```typescript
     * IgxDateSummaryOperand.latest(data);
     * ```
     *
     * @memberof IgxDateSummaryOperand
     */
    public static latest(data: any[]) {
        return data.length && data.filter(clear).length ?
            first(data.filter(clear).sort((a, b) => new Date(b).valueOf() - new Date(a).valueOf())) : undefined;
    }
    /**
     * Returns the earliest date value in the data records.
     * If filtering is applied, returns the latest date value in the filtered data records.
     * ```typescript
     * IgxDateSummaryOperand.earliest(data);
     * ```
     *
     * @memberof IgxDateSummaryOperand
     */
    public static earliest(data: any[]) {
        return data.length && data.filter(clear).length ?
            last(data.filter(clear).sort((a, b) => new Date(b).valueOf() - new Date(a).valueOf())) : undefined;
    }
    /**
     * Executes the static methods and returns `IgxSummaryResult[]`.
     * ```typescript
     * interface IgxSummaryResult {
     *   key: string;
     *   label: string;
     *   summaryResult: any;
     * }
     * ```
     * Can be overridden in the inherited classes to provide customization for the `summary`.
     * ```typescript
     * class CustomDateSummary extends IgxDateSummaryOperand {
     *   constructor() {
     *     super();
     *   }
     *   public operate(data: any[], allData: any[], fieldName: string, locale: string, pipeArgs: IColumnPipeArgs): IgxSummaryResult[] {
     *     pipeArgs = {
     *        format: 'longDate',
     *        timezone: 'UTC'
     *     };
     *     const result = super.operate(data, allData, fieldName, locale, pipeArgs);
     *     result.push({
     *       key: "deadline",
     *       label: "Deadline Date",
     *       summaryResult: this.calculateDeadline(data);
     *     });
     *     return result;
     *   }
     * }
     * this.grid.getColumnByName('ColumnName').summaries = CustomDateSummary;
     * ```
     *
     * @memberof IgxDateSummaryOperand
     */
    public operate(data: any[] = [], allData: any[] = [],  fieldName?: string, locale: string = 'en-US',
        pipeArgs: IColumnPipeArgs = {}): IgxSummaryResult[] {
        const result = super.operate(data, allData, fieldName, locale);
        const pipe = new DatePipe(locale);
        result.push({
            key: 'earliest',
            label: 'Earliest',
            summaryResult: pipe.transform(IgxDateSummaryOperand.earliest(data), pipeArgs.format, pipeArgs.timezone)
        });
        result.push({
            key: 'latest',
            label: 'Latest',
            summaryResult: pipe.transform(IgxDateSummaryOperand.latest(data), pipeArgs.format, pipeArgs.timezone)
        });
        return result;
    }
}

export class IgxCurrencySummaryOperand extends IgxSummaryOperand {

    public operate(data: any[] = [], allData: any[] = [], fieldName?: string, locale: string = 'en-US',
        pipeArgs: IColumnPipeArgs = {}): IgxSummaryResult[] {
        const result = super.operate(data, allData, fieldName, locale);
        const currencyCode = pipeArgs.currencyCode ? pipeArgs.currencyCode : getLocaleCurrencyCode(locale);
        const pipe = new CurrencyPipe(locale, currencyCode);
        result.push({
            key: 'min',
            label: 'Min',
            summaryResult: pipe.transform(IgxNumberSummaryOperand.min(data), currencyCode, pipeArgs.display, pipeArgs.digitsInfo)
        });
        result.push({
            key: 'max',
            label: 'Max',
            summaryResult: pipe.transform(IgxNumberSummaryOperand.max(data), currencyCode, pipeArgs.display, pipeArgs.digitsInfo)
        });
        result.push({
            key: 'sum',
            label: 'Sum',
            summaryResult: pipe.transform(IgxNumberSummaryOperand.sum(data), currencyCode, pipeArgs.display, pipeArgs.digitsInfo)
        });
        result.push({
            key: 'average',
            label: 'Avg',
            summaryResult: pipe.transform(IgxNumberSummaryOperand.average(data), currencyCode, pipeArgs.display, pipeArgs.digitsInfo)
        });
        return result;
    }
}

export class IgxPercentSummaryOperand extends IgxSummaryOperand {

    public operate(data: any[] = [], allData: any[] = [], fieldName?: string, locale: string = 'en-US',
        pipeArgs: IColumnPipeArgs = {}): IgxSummaryResult[] {
        const result = super.operate(data, allData, fieldName, locale);
        const pipe = new PercentPipe(locale);
        result.push({
            key: 'min',
            label: 'Min',
            summaryResult: pipe.transform(IgxNumberSummaryOperand.min(data), pipeArgs.digitsInfo)
        });
        result.push({
            key: 'max',
            label: 'Max',
            summaryResult: pipe.transform(IgxNumberSummaryOperand.max(data), pipeArgs.digitsInfo)
        });
        result.push({
            key: 'sum',
            label: 'Sum',
            summaryResult: pipe.transform(IgxNumberSummaryOperand.sum(data), pipeArgs.digitsInfo)
        });
        result.push({
            key: 'average',
            label: 'Avg',
            summaryResult: pipe.transform(IgxNumberSummaryOperand.average(data), pipeArgs.digitsInfo)
        });
        return result;
    }
}

