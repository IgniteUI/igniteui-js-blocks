import {
    AfterViewInit,
    ChangeDetectorRef,
    Directive,
    ElementRef,
    HostBinding,
    HostListener,
    Inject,
    Input,
    OnDestroy,
    Optional,
    Self
} from '@angular/core';
import {
    AbstractControl,
    FormControlName,
    NgControl,
    NgModel,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { IgxInputGroupBase } from '../../input-group/input-group.common';

const nativeValidationAttributes = [
    'required',
    'pattern',
    'minlength',
    'maxlength',
    'min',
    'max',
    'step',
];

export enum IgxInputState {
    INITIAL,
    VALID,
    INVALID,
}

/**
 * The `igxInput` directive creates single- or multiline text elements, covering common scenarios when dealing with form inputs.
 *
 * @igxModule IgxInputGroupModule
 *
 * @igxParent Data Entry & Display
 *
 * @igxTheme igx-input-group-theme
 *
 * @igxKeywords input, input group, form, field, validation
 *
 * @igxGroup presentation
 *
 * @example
 * ```html
 * <input-group>
 *  <label for="address">Address</label>
 *  <input igxInput name="address" type="text" [(ngModel)]="customer.address">
 * </input-group>
 * ```
 */
@Directive({
    selector: '[igxInput]',
    exportAs: 'igxInput',
})
export class IgxInputDirective implements AfterViewInit, OnDestroy {
    /**
     * Sets/gets whether the `"igx-input-group__input"` class is added to the host element.
     * Default value is `false`.
     *
     * @example
     * ```typescript
     * this.igxInput.isInput = true;
     * ```
     *
     * @example
     * ```typescript
     * let isCLassAdded = this.igxInput.isInput;
     * ```
     */
    @HostBinding('class.igx-input-group__input')
    public isInput = false;
    /**
     * Sets/gets whether the `"class.igx-input-group__textarea"` class is added to the host element.
     * Default value is `false`.
     *
     * @example
     * ```typescript
     * this.igxInput.isTextArea = true;
     * ```
     *
     * @example
     * ```typescript
     * let isCLassAdded = this.igxInput.isTextArea;
     * ```
     */
    @HostBinding('class.igx-input-group__textarea')
    public isTextArea = false;

    private _valid = IgxInputState.INITIAL;
    private _statusChanges$: Subscription;
    private _fileNames: string;
    private _disabled = false;

    constructor(
        public inputGroup: IgxInputGroupBase,
        @Optional() @Self() @Inject(NgModel) protected ngModel: NgModel,
        @Optional()
        @Self()
        @Inject(FormControlName)
        protected formControl: FormControlName,
        protected element: ElementRef<HTMLInputElement>,
        protected cdr: ChangeDetectorRef
    ) { }

    private get ngControl(): NgControl {
        return this.ngModel ? this.ngModel : this.formControl;
    }
    /**
     * Sets the `value` property.
     *
     * @example
     * ```html
     * <input-group>
     *  <input igxInput #igxInput [value]="'IgxInput Value'">
     * </input-group>
     * ```
     */
    @Input()
    public set value(value: any) {
        this.nativeElement.value = value ?? '';
        this.updateValidityState();
    }
    /**
     * Gets the `value` property.
     *
     * @example
     * ```typescript
     * @ViewChild('igxInput', {read: IgxInputDirective})
     *  public igxInput: IgxInputDirective;
     * let inputValue = this.igxInput.value;
     * ```
     */
    public get value() {
        return this.nativeElement.value;
    }
    /**
     * Sets the `disabled` property.
     *
     * @example
     * ```html
     * <input-group>
     *  <input igxInput #igxInput [disabled]="true">
     * </input-group>
     * ```
     */
    @Input()
    public set disabled(value: boolean) {
        // handle case when disabled attr is set with no value
        this._disabled = value != null && `${value}` !== 'false';
        this.nativeElement.disabled = this._disabled;
        this.inputGroup.disabled = this._disabled;
    }
    /**
     * Gets the `disabled` property
     *
     * @example
     * ```typescript
     * @ViewChild('igxInput', {read: IgxInputDirective})
     *  public igxInput: IgxInputDirective;
     * let isDisabled = this.igxInput.disabled;
     * ```
     */
    public get disabled() {
        if (this.ngControl && this.ngControl.disabled !== null) {
            return this.ngControl.disabled;
        }
        return this._disabled = this.nativeElement.disabled;
    }

    /**
     * Sets the `required` property.
     *
     * @example
     * ```html
     * <input-group>
     *  <input igxInput #igxInput [required]="true">
     * </input-group>
     * ```
     */
    @Input()
    public set required(value: boolean) {
        this.nativeElement.required = this.inputGroup.isRequired = value;
    }

    /**
     * Gets whether the igxInput is required.
     *
     * @example
     * ```typescript
     * let isRequired = this.igxInput.required;
     * ```
     */
    public get required() {
        return this.nativeElement.hasAttribute('required');
    }
    /**
     * @hidden
     * @internal
     */
    @HostListener('focus')
    public onFocus() {
        this.inputGroup.isFocused = true;
    }
    /**
     * @param event The event to invoke the handler
     *
     * @hidden
     * @internal
     */
    @HostListener('blur')
    public onBlur() {
        this.inputGroup.isFocused = false;
        this.updateValidityState();
    }
    /** @hidden @internal */
    @HostListener('input')
    public onInput() {
        this.checkNativeValidity();
    }
    /** @hidden @internal */
    @HostListener('change', ['$event'])
    public change(event: Event) {
        if (this.type === 'file') {
            const fileList: FileList | null = (event.target as HTMLInputElement)
                .files;
            const fileArray: File[] = [];

            if (fileList) {
                for (const file of Array.from(fileList)) {
                    fileArray.push(file);
                }
            }

            this._fileNames = (fileArray || []).map((f: File) => f.name).join(', ');

            if (this.required && fileList?.length > 0) {
                this._valid = IgxInputState.INITIAL;
            }
        }
    }

    /** @hidden @internal */
    public get fileNames() {
        return this._fileNames;
    }

    /** @hidden @internal */
    public clear() {
        this.nativeElement.value = null;
        this._fileNames = '';
    }

    /** @hidden @internal */
    public ngAfterViewInit() {
        this.inputGroup.hasPlaceholder = this.nativeElement.hasAttribute(
            'placeholder'
        );
        this.inputGroup.disabled =
            this.inputGroup.disabled ||
            this.nativeElement.hasAttribute('disabled');
        this.inputGroup.isRequired = this.nativeElement.hasAttribute(
            'required'
        );

        // Make sure we do not invalidate the input on init
        if (!this.ngControl) {
            this._valid = IgxInputState.INITIAL;
        }
        // Also check the control's validators for required
        if (
            !this.inputGroup.isRequired &&
            this.ngControl &&
            this.ngControl.control.validator
        ) {
            const validation = this.ngControl.control.validator(
                {} as AbstractControl
            );
            this.inputGroup.isRequired = validation && validation.required;
        }

        const elTag = this.nativeElement.tagName.toLowerCase();
        if (elTag === 'textarea') {
            this.isTextArea = true;
        } else {
            this.isInput = true;
        }

        if (this.ngControl) {
            this._statusChanges$ = this.ngControl.statusChanges.subscribe(
                this.onStatusChanged.bind(this)
            );
        }

        this.cdr.detectChanges();
    }
    /** @hidden @internal */
    public ngOnDestroy() {
        if (this._statusChanges$) {
            this._statusChanges$.unsubscribe();
        }
    }
    /**
     * Sets a focus on the igxInput.
     *
     * @example
     * ```typescript
     * this.igxInput.focus();
     * ```
     */
    public focus() {
        this.nativeElement.focus();
    }
    /**
     * Gets the `nativeElement` of the igxInput.
     *
     * @example
     * ```typescript
     * let igxInputNativeElement = this.igxInput.nativeElement;
     * ```
     */
    public get nativeElement() {
        return this.element.nativeElement;
    }
    /** @hidden @internal */
    protected onStatusChanged() {
        // Enable/Disable control based on ngControl #7086
        if (this.disabled !== this.ngControl.disabled) {
            this.disabled = this.ngControl.disabled;
        }
        this.updateValidityState();
    }
    /**
     * @hidden
     * @internal
     */
    protected updateValidityState() {
        if (this.ngControl) {
            if (this.ngControl.control.validator || this.ngControl.control.asyncValidator) {
                if (!this.disabled && (this.ngControl.control.touched || this.ngControl.control.dirty)) {
                    // the control is not disabled and is touched or dirty
                    this._valid = this.ngControl.invalid ?
                        IgxInputState.INVALID : this.focused ? IgxInputState.VALID :
                            IgxInputState.INITIAL;
                } else {
                    //  if control is untouched, pristine, or disabled its state is initial. This is when user did not interact
                    //  with the input or when form/control is reset
                    this._valid = IgxInputState.INITIAL;
                }
            }
        } else {
            this.checkNativeValidity();
        }
    }
    /**
     * Gets whether the igxInput has a placeholder.
     *
     * @example
     * ```typescript
     * let hasPlaceholder = this.igxInput.hasPlaceholder;
     * ```
     */
    public get hasPlaceholder() {
        return this.nativeElement.hasAttribute('placeholder');
    }
    /**
     * Gets the placeholder element of the igxInput.
     *
     * @example
     * ```typescript
     * let igxInputPlaceholder = this.igxInput.placeholder;
     * ```
     */
    public get placeholder() {
        return this.nativeElement.placeholder;
    }

    /**
     * @returns An indicator of whether the input has validator attributes or not
     *
     * @hidden
     * @internal
     */
    private _hasValidators(): boolean {
        for (const nativeValidationAttribute of nativeValidationAttributes) {
            if (this.nativeElement.hasAttribute(nativeValidationAttribute)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Gets whether the igxInput is focused.
     *
     * @example
     * ```typescript
     * let isFocused = this.igxInput.focused;
     * ```
     */
    public get focused() {
        return this.inputGroup.isFocused;
    }
    /**
     * Gets the state of the igxInput.
     *
     * @example
     * ```typescript
     * let igxInputState = this.igxInput.valid;
     * ```
     */
    public get valid(): IgxInputState {
        return this._valid;
    }

    /**
     * Sets the state of the igxInput.
     *
     * @example
     * ```typescript
     * this.igxInput.valid = IgxInputState.INVALID;
     * ```
     */
    public set valid(value: IgxInputState) {
        this._valid = value;
    }

    /**
     * Gets whether the igxInput is valid.
     *
     * @example
     * ```typescript
     * let valid = this.igxInput.isValid;
     * ```
     */
    public get isValid(): boolean {
        return this.valid !== IgxInputState.INVALID;
    }

    /**
     * A function to assign a native validity property of an input.
     * This should be used when there's no ngControl
     *
     * @hidden
     * @internal
     */
    private checkNativeValidity() {
        if (!this.disabled && this._hasValidators()) {
            this._valid = this.nativeElement.checkValidity() ?
                this.focused ? IgxInputState.VALID : IgxInputState.INITIAL :
                IgxInputState.INVALID;
        }
    }

    /**
     * Returns the input type.
     *
     * @hidden
     * @internal
     */
    public get type() {
        return this.nativeElement.type;
    }
}
