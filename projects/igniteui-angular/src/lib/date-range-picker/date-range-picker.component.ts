import {
    AfterViewInit, Component, ContentChild, ContentChildren, ElementRef,
    EventEmitter, HostBinding, Inject, Injector, Input, LOCALE_ID,
    OnChanges, OnDestroy, OnInit, Optional, Output, QueryList,
    SimpleChanges, TemplateRef, ViewChild
} from '@angular/core';
import {
    AbstractControl, ControlValueAccessor, NgControl,
    NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator
} from '@angular/forms';
import { fromEvent, noop, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fadeIn, fadeOut } from '../animations/fade';
import { IgxCalendarComponent, WEEKDAYS } from '../calendar/public_api';
import { DateRangeType } from '../core/dates';
import { DisplayDensityBase, DisplayDensityToken, IDisplayDensityOptions } from '../core/density';
import { InteractionMode } from '../core/enums';
import { CurrentResourceStrings } from '../core/i18n/resources';
import { IToggleView } from '../core/navigation';
import { IBaseCancelableBrowserEventArgs, IBaseEventArgs, KEYS } from '../core/utils';
import { IgxPickerToggleComponent } from '../date-common/picker-icons.common';
import { DatePickerUtil } from '../date-picker/date-picker.utils';
import { IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { IgxInputDirective, IgxInputGroupComponent, IgxInputState, IgxLabelDirective } from '../input-group/public_api';
import { AutoPositionStrategy, OverlaySettings, PositionSettings } from '../services/public_api';
import {
    DateRange, IgxDateRangeEndComponent, IgxDateRangeInputsBaseComponent,
    IgxDateRangeSeparatorDirective, IgxDateRangeStartComponent
} from './date-range-picker-inputs.common';

const SingleInputDatesConcatenationString = ' - ';

/**
 * Provides the ability to select a range of dates from a calendar UI or editable inputs.
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
 * It displays the range selection in a single or two input fields.
 * The default template displays a single *readonly* input field
 * while projecting `igx-date-range-start` and `igx-date-range-end`
 * displays two *editable* input fields.
 *
 * @example
 * ```html
 * <igx-date-range-picker mode="dropdown"></igx-date-range-picker>
 * ```
 */
@Component({
    selector: 'igx-date-range-picker',
    templateUrl: './date-range-picker.component.html',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: IgxDateRangePickerComponent, multi: true },
        { provide: NG_VALIDATORS, useExisting: IgxDateRangePickerComponent, multi: true }
    ]
})
export class IgxDateRangePickerComponent extends DisplayDensityBase
    implements IToggleView, OnChanges, OnInit, AfterViewInit, OnDestroy, ControlValueAccessor, Validator {
    /**
     * Display calendar in either `dialog` or `dropdown` mode.
     *
     * @remarks
     * Default mode is `dialog`
     *
     * @example
     * ```html
     * <igx-date-range-picker mode="dropdown"></igx-date-range-picker>
     * ```
     */
    @Input()
    public mode = InteractionMode.Dialog;

    /**
     * The number of displayed month views.
     *
     * @remarks
     * Default is `2`.
     *
     * @example
     * ```html
     * <igx-date-range-picker [monthsViewNumber]="3"></igx-date-range-picker>
     * ```
     */
    @Input()
    public monthsViewNumber = 2;

    /**
     * Gets/Sets whether dates that are not part of the current month will be displayed.
     *
     * @remarks
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-date-range-picker [hideOutsideDays]="true"></igx-date-range-picker>
     * ```
     */
    @Input()
    public hideOutsideDays: boolean;

    /**
     * The start day of the week.
     *
     * @remarks
     * Can be assigned to a numeric value or to `WEEKDAYS` enum value.
     *
     * @example
     * ```html
     * <igx-date-range-picker [weekStart]="1"></igx-date-range-picker>
     * ```
     */
    @Input()
    public weekStart = WEEKDAYS.SUNDAY;

    /**
     * Locale settings used for value formatting and calendar.
     *
     * @remarks
     * Uses Angular's `LOCALE_ID` by default. Affects both input mask and display format if those are not set.
     * If a `locale` is set, it must be registered via `registerLocaleData`.
     * Please refer to https://angular.io/guide/i18n#i18n-pipes.
     * If it is not registered, `Intl` will be used for formatting.
     *
     * @example
     * ```html
     * <igx-date-range-picker locale="jp"></igx-date-range-picker>
     * ```
     */
    @Input()
    public locale: string;

    /**
     * A custom formatter function, applied on the selected or passed in date.
     *
     * @example
     * ```typescript
     * private dayFormatter = new Intl.DateTimeFormat("en", { weekday: "long" });
     * private monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });
     *
     * public formatter(date: Date): string {
     *  return `${this.dayFormatter.format(date)} - ${this.monthFormatter.format(date)} - ${date.getFullYear()}`;
     * }
     * ```
     * ```html
     * <igx-date-range-picker [formatter]="formatter"></igx-date-range-picker>
     * ```
     */
    @Input()
    public formatter: (val: DateRange) => string;

    /**
     * The default text of the calendar dialog `done` button.
     *
     * @remarks
     * Default value is `Done`.
     * The button will only show up in `dialog` mode.
     *
     * @example
     * ```html
     * <igx-date-range-picker doneButtonText="完了"></igx-date-range-picker>
     * ```
     */
    @Input()
    public doneButtonText = 'Done';

    /**
     * Custom overlay settings that should be used to display the calendar.
     *
     * @example
     * ```html
     * <igx-date-range-picker [overlaySettings]="customOverlaySettings"></igx-date-range-picker>
     * ```
     */
    @Input()
    public overlaySettings: OverlaySettings;

    /**
     * The format used when editable inputs are not focused.
     *
     * @remarks
     * Uses Angular's DatePipe.
     *
     * @example
     * ```html
     * <igx-date-range-picker displayFormat="EE/M/yy"></igx-date-range-picker>
     * ```
     *
     */
    @Input()
    public displayFormat: string;

    /**
     * The expected user input format and placeholder.
     *
     * @remarks
     * Default is `"'MM/dd/yyyy'"`
     *
     * @example
     * ```html
     * <igx-date-range-picker inputFormat="dd/MM/yy"></igx-date-range-picker>
     * ```
     */
    @Input()
    public inputFormat: string;

    /**
     * The minimum value in a valid range.
     *
     * @example
     * <igx-date-range-picker [minValue]="minDate"></igx-date-range-picker>
     */
    @Input()
    public set minValue(value: Date | string) {
        this._minValue = value;
        this.onValidatorChange();
    }

    public get minValue(): Date | string {
        return this._minValue;
    }

    /**
     * The maximum value in a valid range.
     *
     * @example
     * <igx-date-range-picker [maxValue]="maxDate"></igx-date-range-picker>
     */
    @Input()
    public set maxValue(value: Date | string) {
        this._maxValue = value;
        this.onValidatorChange();
    }

    public get maxValue(): Date | string {
        return this._maxValue;
    }

    /**
     * Enables/Disables the `IgxDateRangePickerComponent`.
     *
     *  @example
     * ```html
     * <igx-date-range-picker [disabled]="'true'"></igx-date-range-picker>
     * ```
     */
    @Input()
    public disabled = false;

    /**
     * Sets the `placeholder` for single-input `IgxDateRangePickerComponent`.
     *
     *   @example
     * ```html
     * <igx-date-range-picker [placeholder]="'Choose your dates'"></igx-date-range-picker>
     * ```
     */
    @Input()
    public placeholder = '';

    /**
     * Emitted when a range is selected.
     *
     * @example
     * ```html
     * <igx-date-range-picker (rangeSelected)="handleSelected($event)"></igx-date-range-picker>
     * ```
     */
    @Output()
    public rangeSelected = new EventEmitter<DateRange>();

    /**
     * Emitted when the calendar starts opening, cancelable.
     *
     * @example
     * ```html
     * <igx-date-range-picker (onOpening)="handleOpening($event)"></igx-date-range-picker>
     * ```
     */
    @Output()
    public onOpening = new EventEmitter<IBaseCancelableBrowserEventArgs>();

    /**
     * Emitted when the `IgxDateRangeComponent` is opened.
     *
     * @example
     * ```html
     * <igx-date-range-picker (onOpened)="handleOpened($event)"></igx-date-range-picker>
     * ```
     */
    @Output()
    public onOpened = new EventEmitter<IBaseEventArgs>();

    /**
     * Emitted when the calendar starts closing, cancelable.
     *
     * @example
     * ```html
     * <igx-date-range-picker (onClosing)="handleClosing($event)"></igx-date-range-picker>
     * ```
     */
    @Output()
    public onClosing = new EventEmitter<IBaseCancelableBrowserEventArgs>();

    /**
     * Emitted when the `IgxDateRangeComponent` is closed.
     *
     * @example
     * ```html
     * <igx-date-range-picker (onClosed)="handleClosed($event)"></igx-date-range-picker>
     * ```
     */
    @Output()
    public onClosed = new EventEmitter<IBaseEventArgs>();

    /** @hidden @internal */
    @HostBinding('class.igx-date-range-picker')
    public cssClass = 'igx-date-range-picker';

    /** @hidden @internal */
    @ViewChild(IgxCalendarComponent)
    public calendar: IgxCalendarComponent;

    /** @hidden @internal */
    @ViewChild(IgxInputGroupComponent)
    public inputGroup: IgxInputGroupComponent;

    /** @hidden @internal */
    @ViewChild(IgxInputDirective)
    public inputDirective: IgxInputDirective;

    /** @hidden @internal */
    @ViewChild(IgxToggleDirective)
    public toggleDirective: IgxToggleDirective;

    /** @hidden @internal */
    @ContentChildren(IgxPickerToggleComponent, { descendants: true })
    public toggleComponents: QueryList<IgxPickerToggleComponent>;

    /** @hidden @internal */
    @ContentChildren(IgxDateRangeInputsBaseComponent)
    public projectedInputs: QueryList<IgxDateRangeInputsBaseComponent>;

    @ContentChild(IgxLabelDirective)
    public label: IgxLabelDirective;

    /** @hidden @internal */
    @ContentChild(IgxDateRangeSeparatorDirective, { read: TemplateRef })
    public dateSeparatorTemplate: TemplateRef<any>;

    /** @hidden @internal */
    public dateSeparator = CurrentResourceStrings.DateRangePickerResStrings.igx_date_range_picker_date_separator;

    /** @hidden @internal */
    public get appliedFormat(): string {
        return DatePickerUtil.getLocaleDateFormat(this.locale, this.displayFormat)
            || DatePickerUtil.DEFAULT_INPUT_FORMAT;
    }

    /** @hidden @internal */
    public get singleInputFormat(): string {
        if (this.placeholder !== '') {
            return this.placeholder;
        }

        const format = this.appliedFormat;
        return `${format}${SingleInputDatesConcatenationString}${format}`;
    }

    /**
     * Gets calendar state.
     *
     * ```typescript
     * let state = this.dateRange.collapsed;
     * ```
     */
    public get collapsed(): boolean {
        return this._collapsed;
    }

    /**
     * The currently selected value / range from the calendar
     *
     * @remarks
     * The current value is of type `DateRange`
     *
     * @example
     * ```typescript
     * const newValue: DateRange = { start: new Date("2/2/2012"), end: new Date("3/3/2013")};
     * this.dateRangePicker.value = newValue;
     * ```
     */
    public get value(): DateRange {
        return this._value;
    }

    @Input()
    public set value(value: DateRange) {
        this.updateValue(value);
        this.onChangeCallback(value);
    }

    /** @hidden @internal */
    public get hasProjectedInputs(): boolean {
        return this.projectedInputs?.length > 0;
    }

    private get dropdownOverlaySettings(): OverlaySettings {
        return Object.assign({}, this._dropDownOverlaySettings, this.overlaySettings);
    }

    private get dialogOverlaySettings(): OverlaySettings {
        return Object.assign({}, this._dialogOverlaySettings, this.overlaySettings);
    }

    private get required(): boolean {
        if (this._ngControl && this._ngControl.control && this._ngControl.control.validator) {
            const error = this._ngControl.control.validator({} as AbstractControl);
            return (error && error.required) ? true : false;
        }

        return false;
    }

    private _value: DateRange;
    private _collapsed = true;
    private _ngControl: NgControl;
    private $destroy = new Subject();
    private _statusChanges$: Subscription;
    private $toggleClickNotifier = new Subject();
    private _minValue: Date | string;
    private _maxValue: Date | string;
    private _positionSettings: PositionSettings;
    private _focusedInput: IgxDateRangeInputsBaseComponent;
    private _dialogOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: true
    };
    private _dropDownOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: false
    };
    private onChangeCallback: (dateRange: DateRange) => void = noop;
    private onTouchCallback: () => void = noop;
    private onValidatorChange: () => void = noop;

    constructor(public element: ElementRef,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions,
        @Inject(LOCALE_ID) private localeId: any,
        private _injector: Injector) {
        super(_displayDensityOptions);
        this.locale = this.locale || this.localeId;
    }

    /**
     * Opens the date range picker's dropdown or dialog.
     *
     * @example
     * ```html
     * <igx-date-range-picker #dateRange></igx-date-range-picker>
     *
     * <button (click)="dateRange.open()">Open Dialog</button
     * ```
     */
    public open(overlaySettings?: OverlaySettings): void {
        if (!this.collapsed || this.disabled) {
            return;
        }

        this.updateCalendar();
        const settings = this.mode === InteractionMode.Dialog ? this.dialogOverlaySettings : this.dropdownOverlaySettings;
        this.toggleDirective.open(Object.assign(settings, overlaySettings));
    }

    /**
     * Closes the date range picker's dropdown or dialog.
     *
     * @example
     * html```
     * <igx-date-range-picker #dateRange></igx-date-range-picker>
     *
     * <button (click)="dateRange.close()">Close Dialog</button>
     * ```
     */
    public close(): void {
        if (!this.collapsed) {
            this.toggleDirective.close();
        }
    }

    /**
     * Toggles the date range picker's dropdown or dialog
     *
     * @example
     * html```
     * <igx-date-range-picker #dateRange></igx-date-range-picker>
     *
     * <button (click)="dateRange.toggle()">Toggle Dialog</button>
     * ```
     */
    public toggle(overlaySettings?: OverlaySettings): void {
        if (!this.collapsed) {
            this.close();
        } else {
            this.open(overlaySettings);
        }
    }

    /**
     * Selects a range of dates. If no `endDate` is passed, range is 1 day (only `startDate`)
     *
     * @example
     * ```typescript
     * public selectFiveDayRange() {
     *  const today = new Date();
     *  const inFiveDays = new Date(new Date().setDate(today.getDate() + 5));
     *  this.dateRange.selectRange(today, inFiveDays);
     * }
     * ```
     */
    public selectRange(startDate: Date, endDate?: Date): void {
        endDate = endDate ?? startDate;
        const dateRange = [startDate, endDate];
        this.calendar.selectDate(dateRange);
        this.handleSelection(dateRange);
    }

    /** @hidden @internal */
    public writeValue(value: DateRange): void {
        this.updateValue(value);
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
    public validate(control: AbstractControl): ValidationErrors | null {
        const value: DateRange = control.value;
        const errors = {};
        if (value) {
            if (this.hasProjectedInputs) {
                const startInput = this.projectedInputs.find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent;
                const endInput = this.projectedInputs.find(i => i instanceof IgxDateRangeEndComponent) as IgxDateRangeEndComponent;
                if (!startInput.dateTimeEditor.value) {
                    Object.assign(errors, { startValue: true });
                }
                if (!endInput.dateTimeEditor.value) {
                    Object.assign(errors, { endValue: true });
                }
            }

            const min = DatePickerUtil.parseDate(this.minValue);
            const max = DatePickerUtil.parseDate(this.maxValue);
            const start = DatePickerUtil.parseDate(value.start);
            const end = DatePickerUtil.parseDate(value.end);
            if ((min && start && DatePickerUtil.lessThanMinValue(start, min, false))
                || (min && end && DatePickerUtil.lessThanMinValue(end, min, false))) {
                Object.assign(errors, { minValue: true });
            }
            if ((max && start && DatePickerUtil.greaterThanMaxValue(start, max, false))
                || (max && end && DatePickerUtil.greaterThanMaxValue(end, max, false))) {
                Object.assign(errors, { maxValue: true });
            }
        }

        return Object.keys(errors).length > 0 ? errors : null;
    }

    /** @hidden @internal */
    public registerOnValidatorChange?(fn: any): void {
        this.onValidatorChange = fn;
    }

    /** @hidden @internal */
    public setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    /** @hidden @internal */
    get separatorClass(): string {
        return this.getComponentDensityClass('igx-date-range-picker__label');
    }

    /** @hidden */
    public ngOnInit(): void {
        this._ngControl = this._injector.get<NgControl>(NgControl, null);
    }

    /** @hidden */
    public ngAfterViewInit(): void {
        if (this.mode === InteractionMode.DropDown) {
            this.attachOnKeydown();
        }
        this.subscribeToDateEditorEvents();
        this.configPositionStrategy();
        this.configOverlaySettings();
        this.cacheFocusedInput();
        this.attachOnTouched();

        const subsToClicked = () => {
            this.$toggleClickNotifier.next();
            this.toggleComponents.forEach(toggle => {
                toggle.clicked.pipe(takeUntil(this.$toggleClickNotifier)).subscribe(() => this.open());
            });
        };
        this.toggleComponents.changes.pipe(takeUntil(this.$destroy)).subscribe(() => subsToClicked());
        subsToClicked();

        this.setRequiredToInputs();

        if (this._ngControl) {
            this._statusChanges$ = this._ngControl.statusChanges.subscribe(this.onStatusChanged.bind(this));
        }

        // delay invocations until the current change detection cycle has completed
        Promise.resolve().then(() => {
            this.updateDisabledState();
            this.initialSetValue();
            this.updateInputs();
        });
        this.updateDisplayFormat();
        this.updateInputFormat();
    }

    /** @hidden @internal */
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['locale']) {
            this.inputFormat = DatePickerUtil.getDefaultInputFormat(this.locale || 'en') || DatePickerUtil.DEFAULT_INPUT_FORMAT;
        }
        if (changes['displayFormat'] && this.hasProjectedInputs) {
            this.updateDisplayFormat();
        }
        if (changes['inputFormat'] && this.hasProjectedInputs) {
            this.updateInputFormat();
        }
        if (changes['disabled']) {
            this.updateDisabledState();
        }
    }

    /** @hidden @internal */
    public ngOnDestroy(): void {
        this.$destroy.next();
        this.$destroy.complete();
        this.$toggleClickNotifier.next();
        this.$toggleClickNotifier.complete();
        if (this._statusChanges$) {
            this._statusChanges$.unsubscribe();
        }
    }

    /** @hidden @internal */
    public handleOpening(event: IBaseCancelableBrowserEventArgs): void {
        const args = { owner: this, cancel: event.cancel, event: event.event };
        this.onOpening.emit(args);
        event.cancel = args.cancel;
        if (!args.cancel) {
            this._collapsed = false;
        }
    }

    /** @hidden @internal */
    public handleOpened(): void {
        this.calendar.daysView.focusActiveDate();
        this.onOpened.emit({ owner: this });
    }

    /** @hidden @internal */
    public handleClosing(event: IBaseCancelableBrowserEventArgs): void {
        if (this.value && !this.value.start && !this.value.end) {
            this.value = null;
        }

        const args = { owner: this, cancel: event.cancel, event: event.event };
        this.onClosing.emit(args);
        event.cancel = args.cancel;
        if (args.cancel) {
            return;
        }

        if (this.mode === InteractionMode.DropDown && event.event && !this.element.nativeElement.contains(event.event.target)) {
            // outside click
            this.updateValidityOnBlur();
        } else {
            // input click
            if (this.hasProjectedInputs && this._focusedInput) {
                this._focusedInput.setFocus();
                this._focusedInput = null;
            }
            if (this.inputDirective) {
                this.inputDirective.focus();
            }
        }
    }

    /** @hidden @internal */
    public handleClosed(): void {
        this._collapsed = true;
        this.onClosed.emit({ owner: this });
    }

    /** @hidden @internal */
    public onKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case KEYS.UP_ARROW:
            case KEYS.UP_ARROW_IE:
                if (event.altKey) {
                    this.close();
                }
                break;
            case KEYS.DOWN_ARROW:
            case KEYS.DOWN_ARROW_IE:
                if (event.altKey) {
                    this.open();
                }
                break;
            case KEYS.ESCAPE:
            case KEYS.ESCAPE_IE:
                this.close();
                break;
        }
    }

    /** @hidden @internal */
    public handleSelection(selectionData: Date[]): void {
        this.value = this.extractRange(selectionData);
        this.rangeSelected.emit(this.value);
        if (this.mode === InteractionMode.DropDown && selectionData?.length > 1) {
            this.close();
        }
    }

    protected onStatusChanged = () => {
        if ((this._ngControl.control.touched || this._ngControl.control.dirty) &&
            (this._ngControl.control.validator || this._ngControl.control.asyncValidator)) {
            if (this.inputGroup) {
                this.inputDirective.valid = this.getInputState(this.inputGroup.isFocused);
            } else if (this.hasProjectedInputs) {
                this.projectedInputs
                    .forEach(i => {
                        i.inputDirective.valid = this.getInputState(i.isFocused);
                    });
            }
        }
        this.setRequiredToInputs();
    };

    private updateValue(value: DateRange) {
        this._value = value ? value : null;
        this.updateInputs();
    }

    private updateValidityOnBlur() {
        this.onTouchCallback();
        if (this._ngControl) {
            if (this.hasProjectedInputs) {
                this.projectedInputs.forEach(i => {
                    if (!this._ngControl.valid) {
                        i.updateInputValidity(IgxInputState.INVALID);
                    } else {
                        i.updateInputValidity(IgxInputState.INITIAL);
                    }
                });
            }

            if (this.inputDirective) {
                if (!this._ngControl.valid) {
                    this.inputDirective.valid = IgxInputState.INVALID;
                } else {
                    this.inputDirective.valid = IgxInputState.INITIAL;
                }
            }
        }
    }

    private updateDisabledState() {
        if (this.hasProjectedInputs) {
            const start = this.projectedInputs.find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent;
            const end = this.projectedInputs.find(i => i instanceof IgxDateRangeEndComponent) as IgxDateRangeEndComponent;
            start.inputDirective.disabled = this.disabled;
            end.inputDirective.disabled = this.disabled;
            return;
        }
        if (this.inputDirective) {
            this.inputDirective.disabled = this.disabled;
        }
    }

    private getInputState(focused: boolean): IgxInputState {
        if (focused) {
            return this._ngControl.valid ? IgxInputState.VALID : IgxInputState.INVALID;
        } else {
            return this._ngControl.valid ? IgxInputState.INITIAL : IgxInputState.INVALID;
        }
    }

    private setRequiredToInputs(): void {
        // workaround for igxInput setting required
        Promise.resolve().then(() => {
            const isRequired = this.required;
            if (this.inputGroup && this.inputGroup.isRequired !== isRequired) {
                this.inputGroup.isRequired = isRequired;
            } else if (this.hasProjectedInputs && this._ngControl) {
                this.projectedInputs.forEach(i => i.isRequired = isRequired);
            }
        });
    }

    private parseMinValue(value: string | Date): Date | null {
        let minValue: Date = DatePickerUtil.parseDate(value);
        if (!minValue && this.hasProjectedInputs) {
            const start = this.projectedInputs.filter(i => i instanceof IgxDateRangeStartComponent)[0];
            if (start) {
                minValue = DatePickerUtil.parseDate(start.dateTimeEditor.minValue);
            }
        }

        return minValue;
    }

    private parseMaxValue(value: string | Date): Date | null {
        let maxValue: Date = DatePickerUtil.parseDate(value);
        if (!maxValue && this.projectedInputs) {
            const end = this.projectedInputs.filter(i => i instanceof IgxDateRangeEndComponent)[0];
            if (end) {
                maxValue = DatePickerUtil.parseDate(end.dateTimeEditor.maxValue);
            }
        }

        return maxValue;
    }

    private updateCalendar(): void {
        this.calendar.disabledDates = [];
        const minValue = this.parseMinValue(this.minValue);
        if (minValue) {
            this.calendar.disabledDates.push({ type: DateRangeType.Before, dateRange: [minValue] });
        }
        const maxValue = this.parseMaxValue(this.maxValue);
        if (maxValue) {
            this.calendar.disabledDates.push({ type: DateRangeType.After, dateRange: [maxValue] });
        }

        const range: Date[] = [];
        if (this.value?.start && this.value?.end) {
            if (DatePickerUtil.greaterThanMaxValue(this.value.start, this.value.end)) {
                this.swapEditorDates();
            }
            if (this.valueInRange(this.value, minValue, maxValue)) {
                range.push(this.value.start, this.value.end);
            }
        }

        if (range.length > 0) {
            this.calendar.selectDate(range);
        } else {
            this.calendar.deselectDate();
        }
        this.calendar.viewDate = range[0] || new Date();
    }

    private swapEditorDates(): void {
        if (this.hasProjectedInputs) {
            const start = this.projectedInputs.find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent;
            const end = this.projectedInputs.find(i => i instanceof IgxDateRangeEndComponent) as IgxDateRangeEndComponent;
            [start.dateTimeEditor.value, end.dateTimeEditor.value] = [end.dateTimeEditor.value, start.dateTimeEditor.value];
            [this.value.start, this.value.end] = [this.value.end, this.value.start];
        }
    }

    private valueInRange(value: DateRange, minValue?: Date, maxValue?: Date): boolean {
        if (minValue && DatePickerUtil.lessThanMinValue(value.start, minValue, false)) {
            return false;
        }
        if (maxValue && DatePickerUtil.greaterThanMaxValue(value.end, maxValue, false)) {
            return false;
        }

        return true;
    }

    private extractRange(selection: Date[]): DateRange {
        return {
            start: selection[0],
            end: selection.length > 0 ? selection[selection.length - 1] : null
        };
    }

    private attachOnKeydown(): void {
        fromEvent(this.element.nativeElement, 'keydown')
            .pipe(takeUntil(this.$destroy))
            .subscribe((evt: KeyboardEvent) => this.onKeyDown(evt));
    }

    private subscribeToDateEditorEvents(): void {
        if (this.hasProjectedInputs) {
            const start = this.projectedInputs.find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent;
            const end = this.projectedInputs.find(i => i instanceof IgxDateRangeEndComponent) as IgxDateRangeEndComponent;
            if (start && end) {
                start.dateTimeEditor.valueChange
                    .pipe(takeUntil(this.$destroy))
                    .subscribe(value => {
                        if (this.value) {
                            this.value = { start: value, end: this.value.end };
                        } else {
                            this.value = { start: value, end: null };
                        }
                    });
                end.dateTimeEditor.valueChange
                    .pipe(takeUntil(this.$destroy))
                    .subscribe(value => {
                        if (this.value) {
                            this.value = { start: this.value.start, end: value };
                        } else {
                            this.value = { start: null, end: value };
                        }
                    });
            }
        }
    }

    private attachOnTouched(): void {
        if (this.hasProjectedInputs) {
            this.projectedInputs.forEach(i => {
                fromEvent(i.dateTimeEditor.nativeElement, 'blur')
                    .pipe(takeUntil(this.$destroy))
                    .subscribe(() => {
                        if (this.collapsed) {
                            this.updateValidityOnBlur();
                        }
                    });
            });
        } else {
            fromEvent(this.inputDirective.nativeElement, 'blur')
                .pipe(takeUntil(this.$destroy))
                .subscribe(() => {
                    if (this.collapsed) {
                        this.updateValidityOnBlur();
                    }
                });
        }
    }

    private cacheFocusedInput(): void {
        if (this.hasProjectedInputs) {
            this.projectedInputs.forEach(i => {
                fromEvent(i.dateTimeEditor.nativeElement, 'focus')
                    .pipe(takeUntil(this.$destroy))
                    .subscribe(() => this._focusedInput = i);
            });
        }
    }

    private configPositionStrategy(): void {
        this._positionSettings = {
            openAnimation: fadeIn,
            closeAnimation: fadeOut
        };
        this._dropDownOverlaySettings.positionStrategy = new AutoPositionStrategy(this._positionSettings);
        this._dropDownOverlaySettings.target = this.element.nativeElement;
    }

    private configOverlaySettings(): void {
        if (this.overlaySettings !== null) {
            this._dropDownOverlaySettings = Object.assign({}, this._dropDownOverlaySettings, this.overlaySettings);
            this._dialogOverlaySettings = Object.assign({}, this._dialogOverlaySettings, this.overlaySettings);
        }
    }

    private initialSetValue() {
        // if there is no value and no ngControl on the picker but we have inputs we may have value set through
        // their ngModels - we should generate our initial control value
        if ((!this.value || (!this.value.start && !this.value.end)) && this.hasProjectedInputs && !this._ngControl) {
            const start = this.projectedInputs.find(i => i instanceof IgxDateRangeStartComponent);
            const end = this.projectedInputs.find(i => i instanceof IgxDateRangeEndComponent);
            this._value = {
                start: start.dateTimeEditor.value,
                end: end.dateTimeEditor.value
            };
        }
    }

    private updateInputs(): void {
        const start = this.projectedInputs?.find(i => i instanceof IgxDateRangeStartComponent) as IgxDateRangeStartComponent;
        const end = this.projectedInputs?.find(i => i instanceof IgxDateRangeEndComponent) as IgxDateRangeEndComponent;
        if (start && end) {
            start.updateInputValue(this.value?.start ?? null);
            end.updateInputValue(this.value?.end ?? null);
        }
    }

    private updateDisplayFormat(): void {
        this.projectedInputs.forEach(i => {
            const input = i as IgxDateRangeInputsBaseComponent;
            input.dateTimeEditor.displayFormat = this.displayFormat;
        });
    }

    private updateInputFormat(): void {
        this.projectedInputs.forEach(i => {
            const input = i as IgxDateRangeInputsBaseComponent;
            if (input.dateTimeEditor.inputFormat !== this.inputFormat) {
                input.dateTimeEditor.inputFormat = this.inputFormat;
            }
        });
    }
}
