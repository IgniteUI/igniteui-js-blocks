import {
    Component,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    Output,
    ViewChild,
    ElementRef,
    ChangeDetectorRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { isIE, IBaseEventArgs, mkenum } from '../core/utils';
import { EditorProvider } from '../core/edit-provider';
import { noop } from 'rxjs';

export interface IChangeRadioEventArgs extends IBaseEventArgs {
    value: any;
    radio: IgxRadioComponent;
}

export const RadioLabelPosition = mkenum({
    BEFORE: 'before',
    AFTER: 'after'
});
export type RadioLabelPosition = (typeof RadioLabelPosition)[keyof typeof RadioLabelPosition];

let nextId = 0;
/**
 * **Ignite UI for Angular Radio Button** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/radio_button.html)
 *
 * The Ignite UI Radio Button allows the user to select a single option from an available set of options that are listed side by side.
 *
 * Example:
 * ```html
 * <igx-radio>
 *   Simple radio button
 * </igx-radio>
 * ```
 */
@Component({
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: IgxRadioComponent,
            multi: true,
        },
    ],
    selector: 'igx-radio',
    templateUrl: 'radio.component.html'
})
export class IgxRadioComponent implements ControlValueAccessor, EditorProvider {
    /**
     * Returns reference to native radio element.
     * ```typescript
     * let radioElement =  this.radio.nativeRadio;
     * ```
     *
     * @memberof IgxSwitchComponent
     */
    @ViewChild('radio', { static: true })
    public nativeRadio: ElementRef;

    /**
     * Returns reference to native label element.
     * ```typescript
     * let labelElement =  this.radio.nativeLabel;
     * ```
     *
     * @memberof IgxSwitchComponent
     */
    @ViewChild('nativeLabel', { static: true })
    public nativeLabel: ElementRef;

    /**
     * Returns reference to the label placeholder element.
     * ```typescript
     * let labelPlaceholder =  this.radio.placeholderLabel;
     * ```
     *
     * @memberof IgxSwitchComponent
     */
    @ViewChild('placeholderLabel', { static: true })
    public placeholderLabel: ElementRef;

    /**
     * Sets/gets the `id` of the radio component.
     * If not set, the `id` of the first radio component will be `"igx-radio-0"`.
     * ```html
     * <igx-radio id = "my-first-radio"></igx-radio>
     * ```
     * ```typescript
     * let radioId =  this.radio.id;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-radio-${nextId++}`;

    /**
     * Sets/gets the id of the `label` element in the radio component.
     * If not set, the id of the `label` in the first radio component will be `"igx-radio-0-label"`.
     * ```html
     * <igx-radio labelId = "Label1"></igx-radio>
     * ```
     * ```typescript
     * let labelId =  this.radio.labelId;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @Input()
    public labelId = `${this.id}-label`;

    /**
     * Sets/gets the position of the `label` in the radio component.
     * If not set, `labelPosition` will have value `"after"`.
     * ```html
     * <igx-radio labelPosition = "before"></igx-radio>
     * ```
     * ```typescript
     * let labelPosition =  this.radio.labelPosition;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @Input()
    public labelPosition: RadioLabelPosition | string = 'after';

    /**
     * Sets/gets the `value` attribute.
     * ```html
     * <igx-radio [value] = "'radioButtonValue'"></igx-radio>
     * ```
     * ```typescript
     * let value =  this.radio.value;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @Input()
    public value: any;

    /**
     * Sets/gets the `name` attribute of the radio component.
     * ```html
     * <igx-radio name = "Radio1"></igx-radio>
     *  ```
     * ```typescript
     * let name =  this.radio.name;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @Input()
    public name: string;

    /**
     * Sets the value of the `tabindex` attribute.
     * ```html
     * <igx-radio [tabindex] = "1"></igx-radio>
     * ```
     * ```typescript
     * let tabIndex =  this.radio.tabindex;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @Input()
    public tabindex: number = null;

    /**
     * Enables/disables the ripple effect on the radio button..
     * If not set, the `disableRipple` will have value `false`.
     * ```html
     * <igx-radio [disableRipple] = "true"></igx-radio>
     * ```
     * ```typescript
     * let isDisabledRipple =  this.radio.disableRipple;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @Input()
    public disableRipple = false;

    /**
     * Sets/gets whether the radio button is required.
     * If not set, `required` will have value `false`.
     * ```html
     * <igx-radio [required] = "true"></igx-radio>
     * ```
     * ```typescript
     * let isRequired =  this.radio.required;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @Input()
    public required = false;

    /**
     * Sets/gets the `aria-labelledby` attribute of the radio component.
     * If not set, the `aria-labelledby` will be equal to the value of `labelId` attribute.
     * ```html
     * <igx-radio aria-labelledby = "Radio1"></igx-radio>
     * ```
     * ```typescript
     * let ariaLabelledBy = this.radio.ariaLabelledBy;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @Input('aria-labelledby')
    public ariaLabelledBy = this.labelId;

    /**
     * Sets/gets the `aria-label` attribute of the radio component.
     * ```html
     * <igx-radio aria-label = "Radio1"></igx-radio>
     * ```
     * ```typescript
     * let ariaLabel =  this.radio.ariaLabel;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @Input('aria-label')
    public ariaLabel: string | null = null;

    /**
     * An event that is emitted after the radio `value` is changed.
     * Provides references to the `IgxRadioComponent` and the `value` property as event arguments.
     *
     * @memberof IgxRadioComponent
     */
    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output()
    public readonly change: EventEmitter<IChangeRadioEventArgs> = new EventEmitter<IChangeRadioEventArgs>();

    /**
     * Returns the class of the radio component.
     * ```typescript
     * let radioClass = this.radio.cssClass;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @HostBinding('class.igx-radio')
    public cssClass = 'igx-radio';

    /**
     * Sets/gets  the `checked` attribute.
     * Default value is `false`.
     * ```html
     * <igx-radio [checked] = "true"></igx-radio>
     * ```
     * ```typescript
     * let isChecked =  this.radio.checked;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @HostBinding('class.igx-radio--checked')
    @Input()
    public checked = false;

    /**
     * Sets/gets  the `disabled` attribute.
     * Default value is `false`.
     * ```html
     * <igx-radio [disabled] = "true"></igx-radio>
     * ```
     * ```typescript
     * let isDisabled =  this.radio.disabled;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @HostBinding('class.igx-radio--disabled')
    @Input()
    public disabled = false;

    /**
     * Sets/gets whether the radio component is on focus.
     * Default value is `false`.
     * ```typescript
     * this.radio.focus = true;
     * ```
     * ```typescript
     * let isFocused =  this.radio.focused;
     * ```
     *
     * @memberof IgxRadioComponent
     */
    @HostBinding('class.igx-radio--focused')
    public focused = false;

    /**
     * @hidden
     */
    public inputId = `${this.id}-input`;
    /**
     * @hidden
     */
    private _onTouchedCallback: () => void = noop;

    /**
     * @hidden
     */
    private _onChangeCallback: (_: any) => void = noop;

    constructor(private cdr: ChangeDetectorRef) { }

    /**
     * @hidden
     * @internal
     */
    @HostListener('keyup', ['$event'])
    public onKeyUp(event: KeyboardEvent) {
        event.stopPropagation();
        this.focused = true;
    }

    /**
     * @hidden
     */
    public _clicked(event: MouseEvent) {
        event.stopPropagation();
        this.select();
    }

    /**
     * Selects the current radio button.
     * ```typescript
     * this.radio.select();
     * ```
     *
     * @memberof IgxRadioComponent
     */
    public select() {
        this.nativeRadio.nativeElement.focus();

        if (isIE()) {
            this.nativeRadio.nativeElement.blur();
        }

        this.checked = true;
        this.change.emit({ value: this.value, radio: this });
        this._onChangeCallback(this.value);
    }

    /**
     * Deselects the current radio button.
     * ```typescript
     * this.radio.deselect();
     * ```
     *
     * @memberof IgxRadioComponent
     */
    public deselect() {
        this.checked = false;
        this.focused = false;
        this.cdr.markForCheck();
    }

    /**
     * Checks whether the provided value is consistent to the current radio button.
     * If it is, the checked attribute will have value `true`;
     * ```typescript
     * this.radio.writeValue('radioButtonValue');
     * ```
     */
    public writeValue(value: any) {
        this.value = this.value || value;

        if (value === this.value) {
            this.select();
        } else {
            this.deselect();
        }
    }

    /** @hidden */
    public getEditElement() {
        return this.nativeRadio.nativeElement;
    }

    /**
     * @hidden
     */
    public get labelClass(): string {
        switch (this.labelPosition) {
            case RadioLabelPosition.BEFORE:
                return `${this.cssClass}__label--before`;
            case RadioLabelPosition.AFTER:
            default:
                return `${this.cssClass}__label`;
        }
    }

    /**
     * @hidden
     */
    public onBlur() {
        this.focused = false;
        this._onTouchedCallback();
    }

    /**
     * @hidden
     */
    public registerOnChange(fn: (_: any) => void) {
        this._onChangeCallback = fn;
    }

    /**
     * @hidden
     */
    public registerOnTouched(fn: () => void) {
        this._onTouchedCallback = fn;
    }

    /**
     * @hidden
     */
    public setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
    }
}
