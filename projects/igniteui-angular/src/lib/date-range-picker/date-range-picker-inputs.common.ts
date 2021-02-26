import { Component, ContentChild, Pipe, PipeTransform, Directive } from '@angular/core';
import { NgControl } from '@angular/forms';
import { IgxInputDirective, IgxInputState } from '../input-group/public_api';
import { IgxInputGroupComponent } from '../input-group/input-group.component';
import { IgxInputGroupBase } from '../input-group/input-group.common';
import { DatePickerUtil } from '../date-picker/date-picker.utils';
import { IgxDateTimeEditorDirective } from '../directives/date-time-editor/public_api';

/** Represents a range between two dates. */
export interface DateRange {
    start: Date;
    end: Date;
}

/** @hidden @internal */
@Pipe({ name: 'dateRange' })
export class DateRangePickerFormatPipe implements PipeTransform {
    public transform(values: DateRange, appliedFormat?: string,
        locale?: string, formatter?: (_: DateRange) => string): string {
        if (!values || !values.start && !values.end) {
            return '';
        }
        if (formatter) {
            return formatter(values);
        }
        const { start, end } = values;
        const startDate = appliedFormat ? DatePickerUtil.formatDate(start, appliedFormat, locale || 'en') : start?.toLocaleDateString();
        const endDate = appliedFormat ? DatePickerUtil.formatDate(end, appliedFormat, locale || 'en') : end?.toLocaleDateString();
        let formatted;
        if (start) {
            formatted = `${startDate} - `;
            if (end) {
                formatted += endDate;
            }
        }

        return formatted ? formatted : '';
    }
}

/** @hidden @internal */
@Component({
    template: ``,
    selector: `igx-date-range-base`,
    providers: [{ provide: IgxInputGroupBase, useExisting: IgxDateRangeInputsBaseComponent }]
})
export class IgxDateRangeInputsBaseComponent extends IgxInputGroupComponent {
    @ContentChild(IgxDateTimeEditorDirective)
    public dateTimeEditor: IgxDateTimeEditorDirective;

    @ContentChild(IgxInputDirective)
    public inputDirective: IgxInputDirective;

    @ContentChild(NgControl)
    protected ngControl: NgControl;

    /** @hidden @internal */
    public get nativeElement() {
        return this.element.nativeElement;
    }

    /** @hidden @internal */
    public setFocus(): void {
        this.input.focus();
    }

    /** @hidden @internal */
    public updateInputValue(value: Date) {
        if (this.ngControl) {
            this.ngControl.control.setValue(value);
        } else {
            this.dateTimeEditor.value = value;
        }
    }

    /** @hidden @internal */
    public updateInputValidity(state: IgxInputState) {
        this.inputDirective.valid = state;
    }
}

/**
 * Defines the start input for a date range picker
 *
 * @igxModule IgxDateRangePickerModule
 *
 * @igxTheme igx-input-group-theme, igx-calendar-theme, igx-date-range-picker-theme
 *
 * @igxKeywords date, range, date range, date picker
 *
 * @igxGroup scheduling
 *
 * @remarks
 * When templating, start input has to be templated separately
 *
 * @example
 * ```html
 * <igx-date-range-picker mode="dropdown">
 *      <igx-date-range-start>
 *          <input igxInput igxDateTimeEditor type="text">
 *      </igx-date-range-start>
 *      ...
 * </igx-date-range-picker>
 * ```
 */
@Component({
    selector: 'igx-date-range-start',
    templateUrl: '../input-group/input-group.component.html',
    providers: [
        { provide: IgxInputGroupBase, useExisting: IgxDateRangeStartComponent },
        { provide: IgxDateRangeInputsBaseComponent, useExisting: IgxDateRangeStartComponent }
    ]
})
export class IgxDateRangeStartComponent extends IgxDateRangeInputsBaseComponent { }

/**
 * Defines the end input for a date range picker
 *
 * @igxModule IgxDateRangeModule
 *
 * @igxTheme igx-input-group-theme, igx-calendar-theme, igx-date-range-picker-theme
 *
 * @igxKeywords date, range, date range, date picker
 *
 * @igxGroup scheduling
 *
 * @remarks
 * When templating, end input has to be template separately
 *
 * @example
 * ```html
 * <igx-date-range-picker mode="dropdown">
 *      <igx-date-range-end>
 *          <input igxInput igxDateTimeEditor type="text">
 *      </igx-date-range-end>
 *      ...
 * </igx-date-range-picker>
 * ```
 */
@Component({
    selector: 'igx-date-range-end',
    templateUrl: '../input-group/input-group.component.html',
    providers: [
        { provide: IgxInputGroupBase, useExisting: IgxDateRangeEndComponent },
        { provide: IgxDateRangeInputsBaseComponent, useExisting: IgxDateRangeEndComponent }
    ]
})
export class IgxDateRangeEndComponent extends IgxDateRangeInputsBaseComponent { }

@Directive({
    selector: '[igxDateRangeSeparator]'
})
export class IgxDateRangeSeparatorDirective {
}
