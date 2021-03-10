/* eslint-disable @angular-eslint/no-conflicting-lifecycle */
import {
  Directive, Input, ElementRef,
  Renderer2, NgModule, Output, EventEmitter, Inject,
  LOCALE_ID, OnChanges, SimpleChanges, DoCheck, HostListener
} from '@angular/core';
import {
  ControlValueAccessor,
  Validator, AbstractControl, ValidationErrors, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { IgxMaskDirective } from '../mask/mask.directive';
import { MaskParsingService } from '../mask/mask-parsing.service';
import { KEYS } from '../../core/utils';
import {
  DatePickerUtil
} from '../../date-picker/date-picker.utils';
import { IgxDateTimeEditorEventArgs, DatePartInfo, DatePart } from './date-time-editor.common';
import { noop } from 'rxjs';

/**
 * Date Time Editor provides a functionality to input, edit and format date and time.
 *
 * @igxModule IgxDateTimeEditorModule
 *
 * @igxParent IgxInputGroup
 *
 * @igxTheme igx-input-theme
 *
 * @igxKeywords date, time, editor
 *
 * @igxGroup Scheduling
 *
 * @remarks
 *
 * The Ignite UI Date Time Editor Directive makes it easy for developers to manipulate date/time user input.
 * It requires input in a specified or default input format which is visible in the input element as a placeholder.
 * It allows the input of only date (ex: 'dd/MM/yyyy'), only time (ex:'HH:mm tt') or both at once, if needed.
 * Supports display format that may differ from the input format.
 * Provides methods to increment and decrement any specific/targeted `DatePart`.
 *
 * @example
 * ```html
 * <igx-input-group>
 *   <input type="text" igxInput [igxDateTimeEditor]="'dd/MM/yyyy'" [displayFormat]="'shortDate'" [(ngModel)]="date"/>
 * </igx-input-group>
 * ```
 */
@Directive({
  selector: '[igxDateTimeEditor]',
  exportAs: 'igxDateTimeEditor',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: IgxDateTimeEditorDirective, multi: true },
    { provide: NG_VALIDATORS, useExisting: IgxDateTimeEditorDirective, multi: true }
  ]
})
export class IgxDateTimeEditorDirective extends IgxMaskDirective implements OnChanges, DoCheck, Validator, ControlValueAccessor {
  /**
   * Locale settings used for value formatting.
   *
   * @remarks
   * Uses Angular's `LOCALE_ID` by default. Affects both input mask and display format if those are not set.
   * If a `locale` is set, it must be registered via `registerLocaleData`.
   * Please refer to https://angular.io/guide/i18n#i18n-pipes.
   * If it is not registered, `Intl` will be used for formatting.
   *
   * @example
   * ```html
   * <input igxDateTimeEditor [locale]="'en'">
   * ```
   */
  @Input()
  public locale: string;

  /**
   * Minimum value required for the editor to remain valid.
   *
   * @remarks
   * If a `string` value is passed, it must be in the defined input format.
   *
   * @example
   * ```html
   * <input igxDateTimeEditor [minValue]="minDate">
   * ```
   */
  public get minValue(): string | Date {
    return this._minValue;
  }

  @Input()
  public set minValue(value: string | Date) {
    this._minValue = value;
    this.onValidatorChange();
  }

  /**
   * Maximum value required for the editor to remain valid.
   *
   * @remarks
   * If a `string` value is passed in, it must be in the defined input format.
   *
   * @example
   * ```html
   * <input igxDateTimeEditor [maxValue]="maxDate">
   * ```
   */
  public get maxValue(): string | Date {
    return this._maxValue;
  }

  @Input()
  public set maxValue(value: string | Date) {
    this._maxValue = value;
    this.onValidatorChange();
  }

  /**
   * Specify if the currently spun date segment should loop over.
   *
   * @example
   * ```html
   * <input igxDateTimeEditor [isSpinLoop]="false">
   * ```
   */
  @Input()
  public isSpinLoop = true;

  /**
   * Set both pre-defined format options such as `shortDate` and `longDate`,
   * as well as constructed format string using characters supported by `DatePipe`, e.g. `EE/MM/yyyy`.
   *
   * @example
   * ```html
   * <input igxDateTimeEditor [displayFormat]="'shortDate'">
   * ```
   */
  @Input()
  public displayFormat: string;

  /**
   * Expected user input format (and placeholder).
   *
   * @example
   * ```html
   * <input [igxDateTimeEditor]="'dd/MM/yyyy'">
   * ```
   */
  @Input(`igxDateTimeEditor`)
  public set inputFormat(value: string) {
    if (value) {
      this._format = value;
    }
    const mask = (this.inputFormat || DatePickerUtil.DEFAULT_INPUT_FORMAT)
      .replace(new RegExp(/(?=[^t])[\w]/, 'g'), '0');
    this.mask = mask.indexOf('tt') !== -1 ? mask.replace(new RegExp('tt', 'g'), 'LL') : mask;
  }

  public get inputFormat(): string {
    return this._format;
  }

  /**
   * Editor value.
   *
   * @example
   * ```html
   * <input igxDateTimeEditor [value]="date">
   * ```
   */
  @Input()
  public set value(value: Date) {
    this._value = value;
    this.onChangeCallback(value);
    this.updateMask();
  }

  public get value(): Date {
    return this._value;
  }

  /**
   * Emitted when the editor's value has changed.
   *
   * @example
   * ```html
   * <input igxDateTimeEditor (valueChange)="onValueChanged($event)"/>
   * ```
   */
  @Output()
  public valueChange = new EventEmitter<Date>();

  /**
   * Emitted when the editor is not within a specified range or when the editor's value is in an invalid state.
   *
   * @example
   * ```html
   * <input igxDateTimeEditor [minValue]="minDate" [maxValue]="maxDate" (validationFailed)="onValidationFailed($event)"/>
   * ```
   */
  @Output()
  public validationFailed = new EventEmitter<IgxDateTimeEditorEventArgs>();

  private _value: Date;
  private _format: string;
  private _onClear: boolean;
  private document: Document;
  private _isFocused: boolean;
  private _inputFormat: string;
  private _minValue: string | Date;
  private _maxValue: string | Date;
  private _oldValue: Date | string;
  private _inputDateParts: DatePartInfo[];
  private onTouchCallback: (...args: any[]) => void = noop;
  private onChangeCallback: (...args: any[]) => void = noop;
  private onValidatorChange: (...args: any[]) => void = noop;

  private get emptyMask(): string {
    return this.maskParser.applyMask(null, this.maskOptions);
  }

  private get targetDatePart(): DatePart {
    if (this.document.activeElement === this.nativeElement) {
      return this._inputDateParts
        .find(p => p.start <= this.selectionStart && this.selectionStart <= p.end && p.type !== DatePart.Literal)?.type;
    } else {
      if (this._inputDateParts.some(p => p.type === DatePart.Date)) {
        return DatePart.Date;
      } else if (this._inputDateParts.some(p => p.type === DatePart.Hours)) {
        return DatePart.Hours;
      }
    }
  }

  private get hasDateParts() {
    return this._inputDateParts.some(
      p => p.type === DatePart.Date
        || p.type === DatePart.Month
        || p.type === DatePart.Year);
  }

  private get hasTimeParts() {
    return this._inputDateParts.some(
      p => p.type === DatePart.Hours
        || p.type === DatePart.Minutes
        || p.type === DatePart.Seconds);
  }

  constructor(
    protected renderer: Renderer2,
    protected elementRef: ElementRef,
    protected maskParser: MaskParsingService,
    @Inject(DOCUMENT) private _document: any,
    @Inject(LOCALE_ID) private _locale: any) {
    super(elementRef, maskParser, renderer);
    this.document = this._document as Document;
    this.locale = this.locale || this._locale;
  }

  @HostListener('wheel', ['$event'])
  public onWheel(event: WheelEvent) {
    if (!this._isFocused) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (event.deltaY > 0) {
      this.increment();
    } else {
      this.decrement();
    }
  }

  /** @hidden @internal */
  public ngOnChanges(changes: SimpleChanges) {
    if (changes['inputFormat'] || changes['locale']) {
      this.updateInputFormat();
    }
  }

  /** @hidden @internal */
  public ngDoCheck(): void {
    if (this._inputFormat !== this.inputFormat) {
      this.updateInputFormat();
    }
  }

  /** Clear the input element value. */
  public clear(): void {
    this._onClear = true;
    this.updateValue(null);
    this.setSelectionRange(0, this.inputValue.length);
    this._onClear = false;
  }

  /**
   * Increment specified DatePart.
   *
   * @param datePart The optional DatePart to increment. Defaults to Date or Hours(when Date is absent from the inputFormat - ex:'HH:mm').
   */
  public increment(datePart?: DatePart): void {
    const targetDatePart = this.targetDatePart;
    if (!targetDatePart) {
      return;
    }
    const newValue = datePart
      ? this.spinValue(datePart, 1)
      : this.spinValue(targetDatePart, 1);
    this.updateValue(newValue ? newValue : new Date());
  }

  /**
   * Decrement specified DatePart.
   *
   * @param datePart The optional DatePart to decrement. Defaults to Date or Hours(when Date is absent from the inputFormat - ex:'HH:mm').
   */
  public decrement(datePart?: DatePart): void {
    const targetDatePart = this.targetDatePart;
    if (!targetDatePart) {
      return;
    }
    const newValue = datePart
      ? this.spinValue(datePart, -1)
      : this.spinValue(targetDatePart, -1);
    this.updateValue(newValue ? newValue : new Date());
  }

  /** @hidden @internal */
  public writeValue(value: any): void {
    this._value = value;
    this.updateMask();
  }

  /** @hidden @internal */
  public validate(control: AbstractControl): ValidationErrors | null {
    if (!this.inputIsComplete() || !control.value) {
      return { value: true };
    }

    const maxValueAsDate = this.isDate(this.maxValue) ? this.maxValue : this.parseDate(this.maxValue);
    const minValueAsDate = this.isDate(this.minValue) ? this.minValue : this.parseDate(this.minValue);
    if (minValueAsDate
      && DatePickerUtil.lessThanMinValue(
        control.value, minValueAsDate, this.hasTimeParts, this.hasDateParts)) {
      return { minValue: true };
    }
    if (maxValueAsDate
      && DatePickerUtil.greaterThanMaxValue(
        control.value, maxValueAsDate, this.hasTimeParts, this.hasDateParts)) {
      return { maxValue: true };
    }

    return null;
  }

  /** @hidden @internal */
  public registerOnValidatorChange?(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  /** @hidden @internal */
  public registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  /** @hidden @internal */
  public registerOnTouched(fn: any): void {
    this.onTouchCallback = fn;
  }

  /** @hidden @internal */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public setDisabledState?(isDisabled: boolean): void { }

  /** @hidden @internal */
  public onInputChanged() {
    super.onInputChanged();
    if (this.inputIsComplete()) {
      const parsedDate = this.parseDate(this.inputValue);
      if (this.isValidDate(parsedDate)) {
        this.updateValue(parsedDate);
      } else {
        const oldValue = this.value && new Date(this.value.getTime());
        const args = { oldValue, newValue: parsedDate, userInput: this.inputValue };
        this.validationFailed.emit(args);
        if (args.newValue?.getTime && args.newValue.getTime() !== oldValue.getTime()) {
          this.updateValue(args.newValue);
        } else {
          this.updateValue(null);
        }
      }
    } else {
      this.updateValue(null);
    }
  }

  /** @hidden @internal */
  public onKeyDown(event: KeyboardEvent): void {
    super.onKeyDown(event);
    if (event.altKey) {
      return;
    }
    if (event.key === KEYS.UP_ARROW || event.key === KEYS.UP_ARROW_IE ||
      event.key === KEYS.DOWN_ARROW || event.key === KEYS.DOWN_ARROW_IE) {
      this.spin(event);
      return;
    }

    if (event.ctrlKey && event.key === KEYS.SEMICOLON) {
      this.updateValue(new Date());
    }

    this.moveCursor(event);
  }

  /** @hidden @internal */
  public onFocus(): void {
    this._isFocused = true;
    this.onTouchCallback();
    this.updateMask();
    super.onFocus();
  }

  /** @hidden @internal */
  public onBlur(value: string): void {
    this._isFocused = false;
    if (!this.inputIsComplete() && this.inputValue !== this.emptyMask) {
      this.updateValue(this.parseDate(this.inputValue));
    } else {
      this.updateMask();
    }

    super.onBlur(value);
  }

  /** @hidden @internal */
  public updateMask(): void {
    if (this._isFocused) {
      // store the cursor position as it will be moved during masking
      const cursor = this.selectionEnd;
      this.inputValue = this.getMaskedValue();
      this.setSelectionRange(cursor);
    } else {
      if (!this.value || !this.isValidDate(this.value)) {
        this.inputValue = '';
        return;
      }
      const format = this.displayFormat || this.inputFormat;
      if (format) {
        this.inputValue = DatePickerUtil.formatDate(this.value, format.replace('tt', 'aa'), this.locale);
      } else {
        // TODO: formatter function?
        this.inputValue = this.value.toLocaleString();
      }
    }
  }

  // TODO: move parseDate to utils
  public parseDate(val: string): Date | null {
    if (!val) {
      return null;
    }
    return DatePickerUtil.parseValueFromMask(val, this._inputDateParts, this.promptChar);
  }

  private getMaskedValue(): string {
    let mask = this.emptyMask;
    if (this.value) {
      for (const part of this._inputDateParts) {
        if (part.type === DatePart.Literal) {
          continue;
        }
        const targetValue = this.getPartValue(part, part.format.length);
        mask = this.maskParser.replaceInMask(mask, targetValue, this.maskOptions, part.start, part.end).value;
      }
      return mask;
    }
    if (!this.inputIsComplete() || !this._onClear) {
      return this.inputValue;
    }
    return mask;
  }

  private updateInputFormat(): void {
    const defPlaceholder = this.inputFormat || DatePickerUtil.getDefaultInputFormat(this.locale);
    this._inputDateParts = DatePickerUtil.parseDateTimeFormat(this.inputFormat);
    this.inputFormat = this._inputDateParts.map(p => p.format).join('');
    if (!this.nativeElement.placeholder || this._inputFormat !== this.inputFormat) {
      this.renderer.setAttribute(this.nativeElement, 'placeholder', defPlaceholder);
    }
    // TODO: fill in partial dates?
    this.updateMask();
    this._inputFormat = this.inputFormat;
  }

  // TODO: move isDate to utils
  private isDate(value: any): value is Date {
    return value instanceof Date && typeof value === 'object';
  }

  private valueInRange(value: Date): boolean {
    if (!value) {
      return false;
    }
    const maxValueAsDate = this.isDate(this.maxValue) ? this.maxValue : this.parseDate(this.maxValue);
    const minValueAsDate = this.isDate(this.minValue) ? this.minValue : this.parseDate(this.minValue);
    if (minValueAsDate
      && DatePickerUtil.lessThanMinValue(
        value, minValueAsDate, this.hasTimeParts, this.hasDateParts)) {
      return false;
    }
    if (maxValueAsDate
      && DatePickerUtil.greaterThanMaxValue(
        value, maxValueAsDate, this.hasTimeParts, this.hasDateParts)) {
      return false;
    }

    return true;
  }

  private spinValue(datePart: DatePart, delta: number): Date {
    if (!this.value || !this.isValidDate(this.value)) {
      return null;
    }
    const newDate = new Date(this.value.getTime());
    switch (datePart) {
      case DatePart.Date:
        DatePickerUtil.spinDate(delta, newDate, this.isSpinLoop);
        break;
      case DatePart.Month:
        DatePickerUtil.spinMonth(delta, newDate, this.isSpinLoop);
        break;
      case DatePart.Year:
        DatePickerUtil.spinYear(delta, newDate);
        break;
      case DatePart.Hours:
        DatePickerUtil.spinHours(delta, newDate, this.isSpinLoop);
        break;
      case DatePart.Minutes:
        DatePickerUtil.spinMinutes(delta, newDate, this.isSpinLoop);
        break;
      case DatePart.Seconds:
        DatePickerUtil.spinSeconds(delta, newDate, this.isSpinLoop);
        break;
      case DatePart.AmPm:
        const formatPart = this._inputDateParts.find(dp => dp.type === DatePart.AmPm);
        const amPmFromMask = this.inputValue.substring(formatPart.start, formatPart.end);
        return DatePickerUtil.spinAmPm(newDate, this.value, amPmFromMask);
    }

    return newDate;
  }

  private updateValue(newDate: Date): void {
    this._oldValue = this.value;
    this.value = newDate;

    if (this.value && !this.valueInRange(this.value)) {
      this.validationFailed.emit({ oldValue: this._oldValue, newValue: this.value, userInput: this.inputValue });
    }
    if (this.inputIsComplete() || this.inputValue === this.emptyMask) {
      this.valueChange.emit(this.value);
    }
  }

  private toTwelveHourFormat(value: string): number {
    let hour = parseInt(value.replace(new RegExp(this.promptChar, 'g'), '0'), 10);
    if (hour > 12) {
      hour -= 12;
    } else if (hour === 0) {
      hour = 12;
    }

    return hour;
  }

  private getPartValue(datePartInfo: DatePartInfo, partLength: number): string {
    let maskedValue;
    const datePart = datePartInfo.type;
    switch (datePart) {
      case DatePart.Date:
        maskedValue = this.value.getDate();
        break;
      case DatePart.Month:
        // months are zero based
        maskedValue = this.value.getMonth() + 1;
        break;
      case DatePart.Year:
        if (partLength === 2) {
          maskedValue = this.prependValue(
            parseInt(this.value.getFullYear().toString().slice(-2), 10), partLength, '0');
        } else {
          maskedValue = this.value.getFullYear();
        }
        break;
      case DatePart.Hours:
        if (datePartInfo.format.indexOf('h') !== -1) {
          maskedValue = this.prependValue(
            this.toTwelveHourFormat(this.value.getHours().toString()), partLength, '0');
        } else {
          maskedValue = this.value.getHours();
        }
        break;
      case DatePart.Minutes:
        maskedValue = this.value.getMinutes();
        break;
      case DatePart.Seconds:
        maskedValue = this.value.getSeconds();
        break;
      case DatePart.AmPm:
        maskedValue = this.value.getHours() >= 12 ? 'PM' : 'AM';
        break;
    }

    if (datePartInfo.type !== DatePart.AmPm) {
      return this.prependValue(maskedValue, partLength, '0');
    }

    return maskedValue;
  }

  private prependValue(value: number, partLength: number, prependChar: string): string {
    return (prependChar + value.toString()).slice(-partLength);
  }

  private spin(event: KeyboardEvent): void {
    event.preventDefault();
    switch (event.key) {
      case KEYS.UP_ARROW:
      case KEYS.UP_ARROW_IE:
        this.increment();
        break;
      case KEYS.DOWN_ARROW:
      case KEYS.DOWN_ARROW_IE:
        this.decrement();
        break;
    }
  }

  private inputIsComplete(): boolean {
    return this.inputValue.indexOf(this.promptChar) === -1;
  }

  private isValidDate(date: Date): boolean {
    return date && date.getTime && !isNaN(date.getTime());
  }

  private moveCursor(event: KeyboardEvent): void {
    const value = (event.target as HTMLInputElement).value;
    switch (event.key) {
      case KEYS.LEFT_ARROW:
      case KEYS.LEFT_ARROW_IE:
        if (event.ctrlKey) {
          event.preventDefault();
          this.setSelectionRange(this.getNewPosition(value));
        }
        break;
      case KEYS.RIGHT_ARROW:
      case KEYS.RIGHT_ARROW_IE:
        if (event.ctrlKey) {
          event.preventDefault();
          this.setSelectionRange(this.getNewPosition(value, 1));
        }
        break;
    }
  }

  /**
   * Move the cursor in a specific direction until it reaches a date/time separator.
   * Then return its index.
   *
   * @param value The string it operates on.
   * @param direction 0 is left, 1 is right. Default is 0.
   */
  private getNewPosition(value: string, direction = 0): number {
    const literals = this._inputDateParts.filter(p => p.type === DatePart.Literal);
    let cursorPos = this.selectionStart;
    if (!direction) {
      do {
        cursorPos = cursorPos > 0 ? --cursorPos : cursorPos;
      } while (!literals.some(l => l.end === cursorPos) && cursorPos > 0);
      return cursorPos;
    } else {
      do {
        cursorPos++;
      } while (!literals.some(l => l.start === cursorPos) && cursorPos < value.length);
      return cursorPos;
    }
  }
}

@NgModule({
  declarations: [IgxDateTimeEditorDirective],
  exports: [IgxDateTimeEditorDirective]
})
export class IgxDateTimeEditorModule { }
