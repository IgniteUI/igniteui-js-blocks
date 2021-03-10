import {
    Component,
    Directive,
    EventEmitter,
    forwardRef,
    HostBinding,
    Input,
    NgModule,
    Output,
    Provider,
    ViewChild,
    ElementRef,
    HostListener
} from '@angular/core';
import { CheckboxRequiredValidator, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IgxRippleModule } from '../directives/ripple/ripple.directive';
import { isIE, IBaseEventArgs, mkenum } from '../core/utils';
import { EditorProvider } from '../core/edit-provider';
import { noop } from 'rxjs';

export const SwitchLabelPosition = mkenum({
    BEFORE: 'before',
    AFTER: 'after'
});
export type SwitchLabelPosition = (typeof SwitchLabelPosition)[keyof typeof SwitchLabelPosition];

export interface IChangeSwitchEventArgs extends IBaseEventArgs {
    checked: boolean;
    switch: IgxSwitchComponent;
}

let nextId = 0;
/**
 *
 * The Switch component is a binary choice selection component.
 *
 * @igxModule IgxSwitchModule
 *
 * @igxTheme igx-switch-theme, igx-tooltip-theme
 *
 * @igxKeywords switch, states, tooltip
 *
 * @igxGroup Data Entry & Display
 *
 * @remarks
 *
 * The Ignite UI Switch lets the user toggle between on/off or true/false states.
 *
 * @example
 * ```html
 * <igx-switch [checked]="true">
 *   Simple switch
 * </igx-switch>
 * ```
 */
@Component({
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxSwitchComponent, multi: true }],
    selector: 'igx-switch',
    templateUrl: 'switch.component.html'
})
export class IgxSwitchComponent implements ControlValueAccessor, EditorProvider {
    /**
     * Returns a reference to the native checkbox element.
     *
     * @example
     * ```typescript
     * let checkboxElement =  this.switch.nativeCheckbox;
     * ```
     */
    @ViewChild('checkbox', { static: true }) public nativeCheckbox: ElementRef;
    /**
     * Returns reference to the native label element.
     *
     * @example
     * ```typescript
     * let labelElement =  this.switch.nativeLabel;
     * ```
     */
    @ViewChild('label', { static: true })
    public nativeLabel: ElementRef;
    /**
     * Returns reference to the label placeholder element.
     *
     * @example
     * ```typescript
     * let labelPlaceholder = this.switch.placeholderLabel;
     * ```
     */
    @ViewChild('placeholderLabel', { static: true })
    public placeholderLabel: ElementRef;

    /**
     * Sets/gets the `id` of the switch component.
     * If not set, the `id` of the first switch component will be `"igx-switch-0"`.
     *
     * @example
     * ```html
     * <igx-switch id="my-first-switch"></igx-switch>
     * ```
     */
    @HostBinding('attr.id')
    @Input() public id = `igx-switch-${nextId++}`;
    /**
     * Sets/gets the id of the `label` element of the switch component.
     * If not set, the label of the first switch component will have value `"igx-switch-0-label"`.
     *
     * @example
     * ```html
     * <igx-switch labelId="Label1"></igx-switch>
     * ```
     */
    @Input() public labelId = `${this.id}-label`;
    /**
     * Sets/gets the `value` attribute of the switch component.
     *
     * @example
     * ```html
     * <igx-switch [value]="switchValue"></igx-switch>
     * ```
     */
    @Input() public value: string;
    /**
     * Sets/gets the `name` attribute of the switch component.
     *
     * @example
     * ```html
     * <igx-switch name="Switch1"></igx-switch>
     * ```
     */
    @Input() public name: string;
    /**
     * Sets/gets the value of the `tabindex` attribute.
     *
     * @example
     * ```html
     * <igx-switch [tabindex]="1"></igx-switch>
     * ```
     */
    @Input() public tabindex: number = null;
    /**
     * Sets/gets the position of the `label` in the switch component.
     * If not set, `labelPosition` will have value `"after"`.
     *
     * @example
     * ```html
     * <igx-switch labelPosition="before"></igx-switch>
     * ```
     */
    @Input() public labelPosition: SwitchLabelPosition | string = 'after';
    /**
     * Enables/Disables the ripple effect
     * If not set, `disableRipple` will have value `false`.
     *
     * @example
     * ```html
     * <igx-switch [disableRipple]="true"></igx-switch>
     * ```
     */
    @Input() public disableRipple = false;
    /**
     * Sets/gets whether switch is required.
     * If not set, `required` will have value `false`.
     *
     * @example
     * ```html
     * <igx-switch [required]="true"></igx-switch>
     * ```
     */
    @Input() public required = false;
    /**
     * Sets/gets the `aria-labelledBy` attribute.
     * If not set, the  value of `aria-labelledBy` will be equal to the value of `labelId` attribute.
     *
     * @example
     * ```html
     * <igx-switch aria-labelledby = "Label1"></igx-switch>
     * ```
     */
    @Input('aria-labelledby')
    public ariaLabelledBy = this.labelId;
    /**
     * Sets/gets the value of the `aria-label` attribute.
     *
     * @example
     * ```html
     * <igx-switch aria-label="Label1"></igx-switch>
     * ```
     */
    @Input('aria-label')
    public ariaLabel: string | null = null;
    /**
     * An event that is emitted after the switch state is changed.
     * Provides references to the `IgxSwitchComponent` and the `checked` property as event arguments.
     */
    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output()
    public readonly change: EventEmitter<IChangeSwitchEventArgs> = new EventEmitter<IChangeSwitchEventArgs>();
    /**
     * Returns the class of the switch component.
     *
     * @example
     * ```typescript
     * let switchClass = this.switch.cssClass;
     * ```
     */
    @HostBinding('class.igx-switch')
    public cssClass = 'igx-switch';
    /**
     * Sets/gets whether the switch is on or off.
     * Default value is 'false'.
     *
     * @example
     * ```html
     *  <igx-switch [checked]="true"></igx-switch>
     * ```
     */
    @HostBinding('class.igx-switch--checked')
    @Input() public checked = false;
    /**
     * Sets/gets the `disabled` attribute.
     * Default value is `false`.
     *
     * @example
     * ```html
     * <igx-switch [disabled]="true"><igx-switch>
     * ```
     */
    @HostBinding('class.igx-switch--disabled')
    @Input() public disabled = false;
    /**
     * Sets/gets whether the switch component is on focus.
     * Default value is `false`.
     *
     * @example
     * ```typescript
     * this.switch.focused = true;
     * ```
     */
    @HostBinding('class.igx-switch--focused')
    public focused = false;
    /**
     * @hidden
     * @internal
     */
    public inputId = `${this.id}-input`;
    /**
     * @hidden
     * @internal
     */
    protected _value: any;
    /**
     * @hidden
     * @internal
     */
    private _onTouchedCallback: () => void = noop;
    /**
     * @hidden
     * @internal
     */
    private _onChangeCallback: (_: any) => void = noop;
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
     * Toggles the checked state of the switch.
     *
     * @example
     * ```typescript
     * this.switch.toggle();
     * ```
     */
    public toggle() {
        if (this.disabled) {
            return;
        }

        this.nativeCheckbox.nativeElement.focus();

        this.checked = !this.checked;
        this.change.emit({ checked: this.checked, switch: this });
        this._onChangeCallback(this.checked);
    }
    /**
     * @hidden
     * @internal
     */
    public _onSwitchChange(event: Event) {
        event.stopPropagation();
    }
    /**
     * @hidden
     * @internal
     */
    public _onSwitchClick(event: Event) {
        event.stopPropagation();
        this.toggle();

        if (isIE()) {
            this.nativeCheckbox.nativeElement.blur();
        }
    }
    /**
     * @hidden
     * @internal
     */
    public onLabelClick() {
        this.toggle();
    }
    /**
     * @hidden
     * @internal
     */
    public onBlur() {
        this.focused = false;
        this._onTouchedCallback();
    }
    /**
     * @hidden
     * @internal
     */
    public writeValue(value: string) {
        this._value = value;
        this.checked = !!this._value;
    }
    /**
     * @hidden
     * @internal
     */
    public getEditElement() {
        return this.nativeCheckbox.nativeElement;
    }

    /**
     * @hidden
     * @internal
     */
    public get labelClass(): string {
        switch (this.labelPosition) {
            case SwitchLabelPosition.BEFORE:
                return `${this.cssClass}__label--before`;
            case SwitchLabelPosition.AFTER:
            default:
                return `${this.cssClass}__label`;
        }
    }
    /**
     * @hidden
     * @internal
     */
    public registerOnChange(fn: (_: any) => void) {
 this._onChangeCallback = fn;
}
    /**
     * @hidden
     * @internal
     */
    public registerOnTouched(fn: () => void) {
 this._onTouchedCallback = fn;
}
}

export const IGX_SWITCH_REQUIRED_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => IgxSwitchRequiredDirective),
    multi: true
};

/* eslint-disable  @angular-eslint/directive-selector */
@Directive({
    selector: `igx-switch[required][formControlName],
    igx-switch[required][formControl],
    igx-switch[required][ngModel]`,
    providers: [IGX_SWITCH_REQUIRED_VALIDATOR]
})
export class IgxSwitchRequiredDirective extends CheckboxRequiredValidator { }

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxSwitchComponent, IgxSwitchRequiredDirective],
    exports: [IgxSwitchComponent, IgxSwitchRequiredDirective],
    imports: [IgxRippleModule]
})
export class IgxSwitchModule { }
