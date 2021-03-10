import {
    Component, ContentChild, EventEmitter, HostBinding, Input,
    OnDestroy, Output, ViewChild, ElementRef, Inject, HostListener,
    NgModuleRef, OnInit, AfterViewInit, Injector, AfterViewChecked, ContentChildren,
    QueryList, Renderer2, LOCALE_ID, Optional, OnChanges, SimpleChanges
} from '@angular/core';
import {
    ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, AbstractControl,
    NG_VALIDATORS, ValidationErrors, Validator
} from '@angular/forms';
import {
    IgxCalendarComponent, IgxCalendarHeaderTemplateDirective, IgxCalendarSubheaderTemplateDirective,
    WEEKDAYS, isDateInRanges, IFormattingViews, IFormattingOptions
} from '../calendar/public_api';
import {
    IgxInputDirective, IgxInputGroupComponent,
    IgxLabelDirective, IGX_INPUT_GROUP_TYPE, IgxInputGroupType, IgxInputState
} from '../input-group/public_api';
import { Subject, fromEvent, Subscription, noop, MonoTypeOperatorFunction } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';
import {
    OverlaySettings, IgxOverlayService, AbsoluteScrollStrategy,
    AutoPositionStrategy,
    OverlayCancelableEventArgs,
    OverlayEventArgs
} from '../services/public_api';
import { DateRangeDescriptor, DateRangeType } from '../core/dates/dateRange';
import { EditorProvider } from '../core/edit-provider';
import { KEYS, isEqual, IBaseCancelableBrowserEventArgs, IBaseEventArgs } from '../core/utils';
import { IgxDatePickerActionsDirective } from './date-picker.directives';
import { IgxCalendarContainerComponent } from '../date-common/calendar-container/calendar-container.component';
import { InteractionMode } from '../core/enums';
import { fadeIn, fadeOut } from '../animations/fade';
import { PickersBaseDirective } from '../date-common/pickers-base.directive';
import { DisplayDensityToken, IDisplayDensityOptions } from '../core/density';
import { DatePart, IgxDateTimeEditorDirective } from '../directives/date-time-editor/public_api';
import { DeprecateMethod, DeprecateProperty } from '../core/deprecateDecorators';
import { DatePickerUtil } from './date-picker.utils';
import { HeaderOrientation } from '../date-common/types';
import {
    IDatePickerDisabledDateEventArgs, IDatePickerValidationFailedEventArgs
} from './date-picker.common';
import { IgxPickerToggleComponent, IgxPickerClearComponent } from '../date-common/public_api';

let NEXT_ID = 0;

/**
 * Date Picker displays a popup calendar that lets users select a single date.
 *
 * @igxModule IgxDatePickerModule
 * @igxTheme igx-calendar-theme, igx-icon-theme
 * @igxGroup Scheduling
 * @igxKeywords datepicker, calendar, schedule, date
 * @example
 * ```html
 * <igx-date-picker [(ngModel)]="selectedDate"></igx-date-picker>
 * ```
 */
@Component({
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: IgxDatePickerComponent, multi: true },
        { provide: NG_VALIDATORS, useExisting: IgxDatePickerComponent, multi: true }
    ],
    selector: 'igx-date-picker',
    templateUrl: 'date-picker.component.html',
    styles: [`
        :host {
            display: block;
        }
    `]
})
export class IgxDatePickerComponent extends PickersBaseDirective implements ControlValueAccessor, Validator,
    EditorProvider, OnChanges, OnInit, AfterViewInit, OnDestroy, AfterViewChecked { // TODO: move EditorProvider in BaseClass
    /**
     * Gets/Sets the default template editor's tabindex.
     *
     * @example
     * ```html
     * <igx-date-picker editorTabIndex="1"></igx-date-picker>
     * ```
     */
    @Input() public editorTabIndex: number; // TODO: move to editor provider as tabindex

    /**
     * Gets/Sets on which day the week starts.
     *
     * @example
     * ```html
     * <igx-date-picker [weekStart]="WEEKDAYS.FRIDAY" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     * ```
     */
    @Input()
    public weekStart = WEEKDAYS.SUNDAY;

    /**
     * Gets/Sets whether the inactive dates will be hidden.
     *
     * @remarks
     * Applies to dates that are out of the current month.
     * Default value is `false`.
     * @example
     * ```html
     * <igx-date-picker [hideOutsideDays]="true"></igx-date-picker>
     * ```
     * @example
     * ```typescript
     * let hideOutsideDays = this.datePicker.hideOutsideDays;
     * ```
     */
    @Input()
    public hideOutsideDays: boolean;

    /**
     * Gets/Sets the number of month views displayed.
     *
     * @remarks
     * Default value is `1`.
     *
     * @example
     * ```html
     * <igx-date-picker [monthsViewNumber]="2"></igx-date-picker>
     * ```
     * @example
     * ```typescript
     * let monthViewsDisplayed = this.datePicker.monthsViewNumber;
     * ```
     */
    @Input()
    public displayMonthsCount = 1;

    /**
     * Show/hide week numbers
     *
     * @example
     * ```html
     * <igx-date-picker [showWeekNumbers]="true"></igx-date-picker>
     * ``
     */
    @Input()
    public showWeekNumbers: boolean;

    /**
     * Gets/Sets the date mask of the `IgxDatePickerComponent` when in editable dropdown mode.
     *
     *  @example
     * ```typescript
     * let mask = this.datePicker.mask;
     * ```
     */
    @Input()
    public mask: string; // deprecate use inputFormat

    /**
     * Gets/Sets a custom formatter function on the selected or passed date.
     *
     * @example
     * ```html
     * <igx-date-picker [value]="date" [formatter]="formatter"></igx-date-picker>
     * ```
     */
    @DeprecateProperty('formatter has been deprecated, use displayFormat instead.')
    @Input()
    public formatter: (val: Date) => string;

    /**
     * Gets/Sets the orientation of the `IgxDatePickerComponent` header.
     *
     *  @example
     * ```html
     * <igx-date-picker [vertical]="'true'" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     * ```
     */
    @Input()
    public headerOrientation = HeaderOrientation.Horizontal;

    /**
     * Gets/Sets the today button's label.
     *
     *  @example
     * ```html
     * <igx-date-picker cancelButtonLabel="cancel" todayButtonLabel="Tomorrow"></igx-date-picker>
     * ```
     */
    @Input()
    public todayButtonLabel: string;

    /**
     * *Gets/Sets the cancel button's label.
     *
     * @example
     * ```html
     * <igx-date-picker cancelButtonLabel="Close" todayButtonLabel="Today"></igx-date-picker>
     * ```
     */
    @Input()
    public cancelButtonLabel: string;

    /**
     * Gets/Sets the interaction mode - dialog or drop down.
     *
     *  @example
     * ```html
     * <igx-date-picker mode="dropdown"></igx-date-picker>
     * ```
     */
    @Input()
    public mode: InteractionMode = InteractionMode.DropDown;

    /**
     * Gets/Sets whether date should spin continuously or stop when min/max is reached.
     *
     *  @example
     * ```html
     * <igx-date-picker [isSpinLoop]="false"></igx-date-picker>
     * ```
     */
    @Input()
    public isSpinLoop = true;

    /**
     * Gets/Sets the container used for the popup element.
     *
     * @remarks
     *  `outlet` is an instance of `IgxOverlayOutletDirective` or an `ElementRef`.
     * @example
     * ```html
     * <div igxOverlayOutlet #outlet="overlay-outlet"></div>
     * //..
     * <igx-date-picker [outlet]="outlet"></igx-date-picker>
     * //..
     * ```
     */
    @Input()
    public outlet: IgxOverlayOutletDirective | ElementRef;

    /**
     * Gets/Sets the value of `id` attribute.
     *
     * @remarks If not provided it will be automatically generated.
     * @example
     * ```html
     * <igx-date-picker [id]="'igx-date-picker-3'" cancelButtonLabel="cancel" todayButtonLabel="today"></igx-date-picker>
     * ```
     */
    @Input()
    @HostBinding('attr.id')
    public id = `igx-date-picker-${NEXT_ID++}`;

    //#region calendar members

    /**
     * Gets/Sets the format views of the `IgxDatePickerComponent`.
     *
     * @example
     * ```typescript
     * let formatViews = this.datePicker.formatViews;
     *  this.datePicker.formatViews = {day:false, month: false, year:false};
     * ```
     */
    @Input()
    public get formatViews(): IFormattingViews {
        return this._formatViews;
    }

    public set formatViews(formatViews: IFormattingViews) {
        this._formatViews = Object.assign(this._formatViews, formatViews);
    }

    /**
     * Gets/Sets the disabled dates descriptors.
     *
     * @example
     * ```typescript
     * let disabledDates = this.datepicker.disabledDates;
     * this.datePicker.disabledDates = [ {type: DateRangeType.Weekends}, ...];
     * ```
     */
    @Input()
    public get disabledDates(): DateRangeDescriptor[] {
        return this._disabledDates;
    }
    public set disabledDates(value: DateRangeDescriptor[]) {
        this._disabledDates = value;
        this.onValidatorChange();
    }

    /**
     * Gets/Sets the special dates descriptors.
     *
     * @example
     * ```typescript
     * let specialDates = this.datepicker.specialDates;
     * this.datePicker.specialDates = [ {type: DateRangeType.Weekends}, ... ];
     * ```
     */
    @Input()
    public get specialDates(): DateRangeDescriptor[] {
        return this._specialDates;
    }
    public set specialDates(value: DateRangeDescriptor[]) {
        this._specialDates = value;
    }

    /**
     * Gets the format options of the `IgxDatePickerComponent`.
     *
     * @example
     * ```typescript
     * let formatOptions = this.datePicker.formatOptions;
     * ```
     */
    @Input()
    public get calendarFormat(): IFormattingOptions {
        return this._calendarFormat;
    }

    /**
     * Sets the format options of the `IgxDatePickerComponent`.
     *
     * @example
     * ```typescript
     * this.datePicker.formatOptions = {  day: "numeric",  month: "long", weekday: "long", year: "numeric"};
     * ```
     */
    public set calendarFormat(options: IFormattingOptions) {
        this._calendarFormat = Object.assign(this._calendarFormat, options);
    }

    //#endregion

    /**
     * Gets/Sets the selected date.
     *
     *  @example
     * ```html
     * <igx-date-picker [value]="date"></igx-date-picker>
     * ```
     */
    @Input()
    public get value(): Date {
        return this._value;
    }
    public set value(date: Date) {
        this._value = date;
        this.dateTimeEditor.value = date;
        this.onChangeCallback(date);
    }

    /**
     * The minimum value the picker will accept.
     *
     * @example
     * <igx-date-picker [minValue]="minDate"></igx-date-picker>
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
     * The maximum value the picker will accept.
     *
     * @example
     * <igx-date-picker [maxValue]="maxDate"></igx-date-picker>
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
     * Emitted when the picker's value changes.
     *
     * @remarks
     * Used for `two-way` bindings.
     *
     * @example
     * ```html
     * <igx-date-picker [(value)]="date"></igx-date-picker>
     * ```
     */
    @Output()
    public valueChange = new EventEmitter<Date>();

    /**
     * Emitted when the user types/spins to a disabled date in the date-picker editor.
     *
     *  @example
     * ```html
     * <igx-date-picker (onDisabledDate)="onDisabledDate($event)"></igx-date-picker>
     * ```
     */
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output()
    @DeprecateProperty('onDisabledDate has been deprecated.')
    public onDisabledDate = new EventEmitter<IDatePickerDisabledDateEventArgs>(); // TODO: remove event args as well

    @Output()
    public selected = new EventEmitter<Date>();

    /**
     * Emitted when the user types/spins invalid date in the date-picker editor.
     *
     *  @example
     * ```html
     * <igx-date-picker (onValidationFailed)="onValidationFailed($event)"></igx-date-picker>
     * ```
     */
    @Output()
    public validationFailed = new EventEmitter<IDatePickerValidationFailedEventArgs>();

    /** @hidden @internal */
    @ContentChildren(IgxPickerToggleComponent, { descendants: true })
    public toggleComponents: QueryList<IgxPickerToggleComponent>;

    /** @hidden @internal */
    @ContentChildren(IgxPickerClearComponent)
    public clearComponents: QueryList<IgxPickerClearComponent>; // TODO: move type to date-common

    /** @hidden @internal */
    @ContentChild(IgxLabelDirective)
    public label: IgxLabelDirective;

    /** @hidden @internal */
    @ContentChild(IgxCalendarHeaderTemplateDirective)
    public headerTemplate: IgxCalendarHeaderTemplateDirective;

    @ViewChild(IgxDateTimeEditorDirective)
    private dateTimeEditor: IgxDateTimeEditorDirective;

    @ViewChild(IgxInputGroupComponent)
    private inputGroup: IgxInputGroupComponent;

    @ViewChild(IgxLabelDirective)
    private labelDirective: IgxLabelDirective;

    @ViewChild(IgxInputDirective)
    private inputDirective: IgxInputDirective;

    @ContentChild(IgxCalendarSubheaderTemplateDirective)
    private subheaderTemplate: IgxCalendarSubheaderTemplateDirective;

    @ContentChild(IgxDatePickerActionsDirective)
    private datePickerActionsDirective: IgxDatePickerActionsDirective;

    private get dialogOverlaySettings(): OverlaySettings {
        return Object.assign({}, this._dialogOverlaySettings, this.overlaySettings);
    }

    private get dropDownOverlaySettings(): OverlaySettings {
        return Object.assign({}, this._dropDownOverlaySettings, this.overlaySettings);
    }

    private _value: Date;
    private _overlayId: string;
    private _destroy$ = new Subject();
    private _ngControl: NgControl = null;
    private _statusChanges$: Subscription;
    private _calendar: IgxCalendarComponent;
    private _specialDates: DateRangeDescriptor[] = null;
    private _disabledDates: DateRangeDescriptor[] = null;
    private _overlaySubFilter:
        [MonoTypeOperatorFunction<OverlayEventArgs>, MonoTypeOperatorFunction<OverlayEventArgs | OverlayCancelableEventArgs>] = [
            filter(x => x.id === this._overlayId),
            takeUntil(this._destroy$)
        ];
    private _dropDownOverlaySettings: OverlaySettings = {
        target: this.inputGroupElement,
        closeOnOutsideClick: true,
        modal: false,
        scrollStrategy: new AbsoluteScrollStrategy(),
        positionStrategy: new AutoPositionStrategy({
            openAnimation: fadeIn,
            closeAnimation: fadeOut
        }),
        outlet: this.outlet
    };
    private _dialogOverlaySettings: OverlaySettings = {
        closeOnOutsideClick: true,
        modal: true,
        closeOnEscape: true,
        outlet: this.outlet
    };
    private _calendarFormat = {
        day: 'numeric',
        month: 'short',
        weekday: 'short',
        year: 'numeric'
    };
    private _formatViews = {
        day: false,
        month: true,
        year: false
    };
    private onChangeCallback: (_: Date) => void = noop;
    private onTouchedCallback: () => void = noop;
    private onValidatorChange: () => void = noop;

    constructor(public element: ElementRef,
        @Inject(LOCALE_ID) protected _localeId: string,
        @Inject(IgxOverlayService) private _overlayService: IgxOverlayService,
        private _moduleRef: NgModuleRef<any>,
        private _injector: Injector,
        private _renderer: Renderer2,
        @Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions?: IDisplayDensityOptions,
        @Optional() @Inject(IGX_INPUT_GROUP_TYPE) protected _inputGroupType?: IgxInputGroupType,) {
        super(element, _localeId, _displayDensityOptions, _inputGroupType);
    }

    /**
     * Gets the formatted date when `IgxDatePickerComponent` is in dialog mode.
     *
     *  @example
     * ```typescript
     * let selectedDate = this.datePicker.displayData;
     * ```
     */
    @DeprecateMethod('displayData is deprecated, use inputFormat instead.')
    public get displayData(): string {
        if (this.value) {
            return;
        }
        return '';
    }

    /** @hidden @internal */
    public get empty() {
        return !this.value;
    }

    /** @hidden @internal */
    public get inputGroupElement(): HTMLElement {
        return this.inputGroup?.element.nativeElement;
    }

    /** @hidden @internal */
    public get isDropdown(): boolean {
        return this.mode === InteractionMode.DropDown;
    }

    private get required(): boolean {
        if (this._ngControl && this._ngControl.control && this._ngControl.control.validator) {
            // Run the validation with empty object to check if required is enabled.
            const error = this._ngControl.control.validator({} as AbstractControl);
            return error && error.required;
        }

        return false;
    }

    /** @hidden */
    @HostListener('keydown.spacebar', ['$event'])
    @HostListener('keydown.space', ['$event'])
    public onSpaceClick(event: KeyboardEvent) {
        event.preventDefault();
        this.open();
    }

    /** @hidden @internal */
    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent) {
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
    @HostListener('blur')
    public onBlur() {
        if (this.collapsed) {
            this.updateValidityOnBlur();
        }
    }

    /**
     * Change the calendar selection.
     *
     * @remarks
     * Calling this method will emit the calendar.onSelection event,
     * which will fire @handleSelection method.
     *
     * @example
     * ```typescript
     * this.datePicker.selectDate(this.date);
     * ```
     * @param date passed date that has to be set to the calendar.
     */
    @DeprecateMethod('selectDate has been deprecated, use select instead.')
    public selectDate(date: Date): void {
        this.select(date);
    }

    /**
     * Selects today's date from calendar.
     *
     * @remarks
     * Changes the input field value, calendar.viewDate and calendar.value.
     *
     * @example
     * ```typescript
     * this.datePicker.triggerTodaySelection();
     * ```
     */
    @DeprecateMethod('triggerTodaySelection has been deprecated, use selectToday instead')
    public triggerTodaySelection(): void {
        this.selectToday();
    }

    /**
     * Selects the today's date from the calendar.
     *
     * @example
     * ```typescript
     * this.datePicker.selectToday();
     * ```
     */
    public selectToday(): void {
        this.select(new Date());
        this.close();
    }

    /**
     * Opens the date picker drop down or dialog.
     *
     * @example
     * ```html
     * <igx-date-picker #picker></igx-date-picker>
     *
     * <button (click)="picker.open()">Open Dialog</button>
     * ```
     */
    public open(settings?: OverlaySettings): void {
        if (!this.collapsed || this.disabled) {
            return;
        }

        const overlaySettings = Object.assign({}, this.isDropdown
            ? this.dropDownOverlaySettings
            : this.dialogOverlaySettings
            , settings);

        if (this.isDropdown && this.inputGroupElement) {
            overlaySettings.target = this.inputGroupElement;
        }

        this._overlayId = this._overlayService
            .attach(IgxCalendarContainerComponent, overlaySettings, this._moduleRef);
        this._overlayService.show(this._overlayId);
    }

    /**
     * Toggles the date picker's dropdown or dialog
     *
     * @example
     * ```html
     * <igx-date-picker #picker></igx-date-picker>
     *
     * <button (click)="picker.toggle()">Toggle Dialog</button>
     * ```
     */
    public toggle(settings?: OverlaySettings): void {
        if (!this.collapsed) {
            this.close();
        } else {
            this.open(settings);
        }
    }

    /**
     * Closes the date picker's dropdown or dialog.
     *
     * @example
     * ```html
     * <igx-date-picker #picker></igx-date-picker>
     *
     * <button (click)="picker.close()">Close Dialog</button>
     * ```
     */
    public close(): void {
        if (!this.collapsed) {
            this._overlayService.hide(this._overlayId);
            // TODO: detach()
        }
    }

    /**
     * Select a date from the calendar.
     *
     * @remarks
     * Calling this method will emit the calendar.onSelection event
     *
     * @example
     * ```typescript
     * this.datePicker.select(date);
     * ```
     * @param date passed date that has to be set to the calendar.
     */
    public select(value: Date): void {
        if (this.shouldCancelSelecting()) {
            return;
        }

        this._calendar?.selectDate(value);
        const oldValue = this.value;
        this.value = value;
        this.emitValueChange(oldValue, this.value);
        this.selected.emit(value);

        if (DatePickerUtil.validateMinMax(value, this.minValue, this.maxValue)) {
            this.validationFailed.emit({
                datePicker: this,
                prevValue: oldValue
            });
        }
    }

    /**
     * Deselects the calendar date.
     *
     * @example
     * ```typescript
     * this.datePicker.deselectDate();
     * ```
     */
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @DeprecateMethod('deselectDate is deprecated, use clear() instead.')
    public deselectDate(): void {
        this.clear();
    }

    /**
     * Clear the input field, date picker value and calendar selection.
     *
     * @example
     * ```typescript
     * this.datePicker.clear();
     * ```
     */
    public clear(): void {
        // TODO: move to different handler for all util methods
        if (!this.disabled) {
            this._calendar?.deselectDate();
            this.dateTimeEditor.clear();
        }
    }

    /**
     * Increment a specified `DatePart`.
     *
     * @example
     * ```typescript
     * this.datePicker.increment(DatePart.Date);
     * ```
     */
    public increment(datePart?: DatePart): void {
        this.dateTimeEditor.increment(datePart);
    }

    /**
     * Decrement a specified `DatePart`
     *
     * @example
     * ```typescript
     * this.datePicker.decrement(DatePart.Date);
     * ```
     */
    public decrement(datePart?: DatePart): void {
        this.dateTimeEditor.decrement(datePart);
    }

    //#region Control Value Accessor
    /** @hidden @internal */
    public writeValue(value: Date) {
        this._value = value;
        if (this.dateTimeEditor) {
            this.dateTimeEditor.value = value;
        }
    }

    /** @hidden @internal */
    public registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    /** @hidden @internal */
    public registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    /** @hidden @internal */
    public setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
    //#endregion

    //#region Validator
    /** @hidden @internal */
    public registerOnValidatorChange(fn: any) {
        this.onValidatorChange = fn;
    }

    /** @hidden @internal */
    public validate(control: AbstractControl): ValidationErrors | null {
        const value = control.value;
        const errors = {};
        if (value) {
            if (value && this.disabledDates && isDateInRanges(value, this.disabledDates)) {
                Object.assign(errors, { dateIsDisabled: true });
            }
        }
        Object.assign(errors, DatePickerUtil.validateMinMax(value, this.minValue, this.maxValue));

        return Object.keys(errors).length > 0 ? errors : null;
    }
    //#endregion

    /** @hidden @internal */
    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['locale']) {
            this.inputFormat = DatePickerUtil.getDefaultInputFormat(this.locale || 'en')
                || DatePickerUtil.DEFAULT_INPUT_FORMAT;
        }
        if (changes['displayFormat'] && this.dateTimeEditor) {
            this.dateTimeEditor.displayFormat = this.displayFormat;
        }
        if (changes['inputFormat'] && this.dateTimeEditor) {
            this.dateTimeEditor.inputFormat = this.inputFormat;
        }
    }

    /** @hidden @internal */
    public ngOnInit(): void {
        this._ngControl = this._injector.get<NgControl>(NgControl, null);
    }

    /** @hidden @internal */
    public ngAfterViewInit() {
        this.subscribeToClick();
        this.subscribeToOverlayEvents();
        this.subscribeToDateEditorEvents();

        if (this._ngControl) {
            this._statusChanges$ =
                this._ngControl.statusChanges.subscribe(this.onStatusChanged.bind(this));
        }
    }

    public ngAfterViewChecked() {
        if (this.labelDirective) {
            this._renderer.setAttribute(this.inputDirective.nativeElement, 'aria-labelledby', this.labelDirective.id);
        }
    }

    /** @hidden @internal */
    public ngOnDestroy(): void {
        if (this._overlayId) {
            this._overlayService.hide(this._overlayId);
        }
        if (this._statusChanges$) {
            this._statusChanges$.unsubscribe();
        }
        this._destroy$.next();
        this._destroy$.complete();
    }

    /** @hidden @internal */
    public onOpenClick(event: MouseEvent) {
        event.stopPropagation();
        this.open();
    }

    /** @hidden @internal */
    public updateValidityOnBlur() {
        this.onTouchedCallback();
        if (this._ngControl && !this._ngControl.valid) {
            this.inputDirective.valid = IgxInputState.INVALID;
        } else {
            this.inputDirective.valid = IgxInputState.INITIAL;
        }
    }

    /** @hidden @internal */
    public getEditElement(): any {
        return this.inputDirective.nativeElement;
    }

    /** @hidden @internal */
    public applyCustomFormat() {
        return this.formatter ? this.formatter(this.value) : this.displayFormat;
    }

    /** @hidden @internal */
    public subscribeToClick() {
        fromEvent(this.getEditElement(), 'click')
            .pipe(takeUntil(this._destroy$))
            .subscribe(() => {
                if (!this.isDropdown) {
                    this.open();
                }
            });
    }

    private onStatusChanged = () => {
        if ((this._ngControl.control.touched || this._ngControl.control.dirty) &&
            (this._ngControl.control.validator || this._ngControl.control.asyncValidator)) {
            if (this.inputGroup.isFocused) {
                this.inputDirective.valid = this._ngControl.valid
                    ? IgxInputState.VALID
                    : IgxInputState.INVALID;
            } else {
                this.inputDirective.valid = this._ngControl.valid
                    ? IgxInputState.INITIAL
                    : IgxInputState.INVALID;
            }
        }

        if (this.inputGroup.isRequired !== this.required) {
            this.inputGroup.isRequired = this.required;
        }
    };

    private handleSelection(date: Date): void {
        if (this.shouldCancelSelecting()) {
            return;
        }
        if (this.value) {
            date.setHours(this.value.getHours());
            date.setMinutes(this.value.getMinutes());
            date.setSeconds(this.value.getSeconds());
            date.setMilliseconds(this.value.getMilliseconds());
        }
        const oldValue = this.value;
        this.value = date;

        this.emitValueChange(oldValue, this.value);
        this._calendar.viewDate = date;
        this.close();
        this.selected.emit(date);
    }

    private subscribeToDateEditorEvents(): void {
        this.dateTimeEditor.valueChange.pipe(
            takeUntil(this._destroy$)).subscribe(newDate => {
                this.emitValueChange(this.value, newDate);
                this.value = newDate;
                if (newDate && !isDateInRanges(newDate, this.disabledDates)) {
                    this.onDisabledDate.emit({ currentValue: newDate, datePicker: this });
                }
            });
        this.dateTimeEditor.validationFailed.pipe(
            takeUntil(this._destroy$)).subscribe((event) => {
                this.validationFailed.emit({
                    datePicker: this,
                    prevValue: event.oldValue
                });
            });
    }

    private subscribeToOverlayEvents() {
        this._overlayService.onOpening.pipe(...this._overlaySubFilter).subscribe((eventArgs) => {
            const args = eventArgs as IBaseCancelableBrowserEventArgs;
            this.opening.emit(args);
            if (args.cancel) {
                return;
            }

            this._initializeCalendarContainer(eventArgs.componentRef.instance);
            this._collapsed = false;
        });

        this._overlayService.onOpened.pipe(...this._overlaySubFilter).subscribe((eventArgs) => {
            this.opened.emit(eventArgs as IBaseEventArgs);
            this._calendar?.daysView.focusActiveDate();
        });

        this._overlayService.onClosing.pipe(...this._overlaySubFilter).subscribe((eventArgs) => {
            const args = eventArgs as IBaseCancelableBrowserEventArgs;
            this.closing.emit(args);
            if (args.cancel) {
                return;
            }
            // do not focus the input if clicking outside in dropdown mode
            const input = this.getEditElement();
            if (input && !(args.event && this.isDropdown)) {
                this.inputDirective.focus();
            } else {
                // outside click
                this.updateValidityOnBlur();
            }
        });

        this._overlayService.onClosed.pipe(...this._overlaySubFilter).subscribe((event) => {
            this._collapsed = true;
            this._overlayId = null;
            this.closed.emit(event as IBaseEventArgs);
        });
    }

    private emitValueChange(oldValue: Date, newValue: Date) {
        if (!isEqual(oldValue, newValue)) {
            this.valueChange.emit(newValue);
        }
    }

    private setDisabledDates(): void {
        this._calendar.disabledDates = [];
        const minValue = DatePickerUtil.parseDate(this.minValue);
        if (minValue) {
            this._calendar.disabledDates.push({ type: DateRangeType.Before, dateRange: [minValue] });
        }
        const maxValue = DatePickerUtil.parseDate(this.maxValue);
        if (maxValue) {
            this._calendar.disabledDates.push({ type: DateRangeType.After, dateRange: [maxValue] });
        }
    }

    private shouldCancelSelecting(): boolean {
        const args: IBaseCancelableBrowserEventArgs = { owner: this, cancel: false };
        this.selecting.emit(args);
        return args.cancel;
    }

    private _initializeCalendarContainer(componentInstance: IgxCalendarContainerComponent) {
        this._calendar = componentInstance.calendar;
        const isVertical = this.headerOrientation === HeaderOrientation.Vertical;
        this._calendar.hasHeader = !this.isDropdown;
        this._calendar.formatOptions = this.calendarFormat;
        this._calendar.formatViews = this.formatViews;
        this._calendar.locale = this.locale;
        this._calendar.vertical = isVertical;
        this._calendar.weekStart = this.weekStart;
        this._calendar.specialDates = this.specialDates;
        this._calendar.disabledDates = this.disabledDates;
        this._calendar.headerTemplate = this.headerTemplate;
        this._calendar.subheaderTemplate = this.subheaderTemplate;
        this._calendar.hideOutsideDays = this.hideOutsideDays;
        this._calendar.monthsViewNumber = this.displayMonthsCount;
        this._calendar.showWeekNumbers = this.showWeekNumbers;
        this._calendar.selected.pipe(takeUntil(this._destroy$)).subscribe((ev: Date) => this.handleSelection(ev));

        if (this.value) {
            this._calendar.value = this.value;
            this._calendar.viewDate = this.value;
        }

        this.setDisabledDates();
        componentInstance.mode = this.mode;
        componentInstance.vertical = isVertical;
        componentInstance.cancelButtonLabel = this.cancelButtonLabel;
        componentInstance.todayButtonLabel = this.todayButtonLabel;
        componentInstance.datePickerActions = this.datePickerActionsDirective;

        componentInstance.calendarClose.pipe(takeUntil(this._destroy$)).subscribe(() => this.close());
        componentInstance.todaySelection.pipe(takeUntil(this._destroy$)).subscribe(() => this.selectToday());
    }
}
