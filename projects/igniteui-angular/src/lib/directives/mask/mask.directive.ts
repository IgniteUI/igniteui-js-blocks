import { CommonModule } from '@angular/common';
import {
    Directive, ElementRef, EventEmitter, HostListener,
    Output, PipeTransform, Renderer2,
    Input, NgModule, OnInit, AfterViewChecked,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DeprecateProperty } from '../../core/deprecateDecorators';
import { MaskParsingService, MaskOptions } from './mask-parsing.service';
import { isIE, IBaseEventArgs, KEYCODES } from '../../core/utils';
import { noop } from 'rxjs';

@Directive({
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: IgxMaskDirective, multi: true }],
    selector: '[igxMask]',
    exportAs: 'igxMask'
})
export class IgxMaskDirective implements OnInit, AfterViewChecked, ControlValueAccessor {
    /**
     * Sets the input mask.
     * ```html
     * <input [igxMask] = "'00/00/0000'">
     * ```
     */
    @Input('igxMask')
    public mask: string;

    /**
     * Sets the character representing a fillable spot in the input mask.
     * Default value is "'_'".
     * ```html
     * <input [promptChar] = "'/'">
     * ```
     */
    @Input()
    public promptChar = '_';

    /**
     * Specifies if the bound value includes the formatting symbols.
     * ```html
     * <input [includeLiterals] = "true">
     * ```
     */
    @Input()
    public includeLiterals: boolean;

    /**
     * Specifies a placeholder.
     * ```html
     * <input placeholder = "enter text...">
     * ```
     */
    @DeprecateProperty('"placeholder" is deprecated, use native placeholder instead.')
    public set placeholder(val: string) {
        this.renderer.setAttribute(this.nativeElement, 'placeholder', val);
    }

    public get placeholder(): string {
        return this.nativeElement.placeholder;
    }

    /**
     * Specifies a pipe to be used on blur.
     * ```html
     * <input [displayValuePipe] = "displayFormatPipe">
     * ```
     */
    @Input()
    public displayValuePipe: PipeTransform;

    /**
     * Specifies a pipe to be used on focus.
     * ```html
     * <input [focusedValuePipe] = "inputFormatPipe">
     * ```
     */
    @Input()
    public focusedValuePipe: PipeTransform;

    /**
     * Emits an event each time the value changes.
     * Provides `rawValue: string` and `formattedValue: string` as event arguments.
     * ```html
     * <input (onValueChange) = "onValueChange(rawValue: string, formattedValue: string)">
     * ```
     */
    @Output()
    public onValueChange = new EventEmitter<IMaskEventArgs>();

    /** @hidden */
    public get nativeElement(): HTMLInputElement {
        return this.elementRef.nativeElement;
    }

    /** @hidden @internal; */
    protected get inputValue(): string {
        return this.nativeElement.value;
    }

    /** @hidden @internal */
    protected set inputValue(val) {
        this.nativeElement.value = val;
    }

    /** @hidden */
    protected get maskOptions(): MaskOptions {
        const format = this.mask || 'CCCCCCCCCC';
        const promptChar = this.promptChar && this.promptChar.substring(0, 1);
        return { format, promptChar };
    }

    /** @hidden */
    protected get selectionStart(): number {
        // Edge(classic) and FF don't select text on drop
        return this.nativeElement.selectionStart === this.nativeElement.selectionEnd && this._hasDropAction ?
            this.nativeElement.selectionEnd - this._droppedData.length :
            this.nativeElement.selectionStart;
    }

    /** @hidden */
    protected get selectionEnd(): number {
        return this.nativeElement.selectionEnd;
    }

    /** @hidden */
    protected get start(): number {
        return this._start;
    }

    /** @hidden */
    protected get end(): number {
        return this._end;
    }

    private _end = 0;
    private _start = 0;
    private _key: number;
    private _oldText = '';
    private _dataValue = '';
    private _focused = false;
    private _droppedData: string;
    private _hasDropAction: boolean;
    private _stopPropagation: boolean;

    private _onTouchedCallback: () => void = noop;
    private _onChangeCallback: (_: any) => void = noop;

    constructor(
        protected elementRef: ElementRef,
        protected maskParser: MaskParsingService,
        protected renderer: Renderer2) { }

    /** @hidden */
    @HostListener('keydown', ['$event'])
    public onKeyDown(event): void {
        const key = event.keyCode || event.charCode;
        if (!key) {
            return;
        }

        if (isIE() && this._stopPropagation) {
            this._stopPropagation = false;
        }

        if ((key === KEYCODES.CTRL && key === KEYCODES.Z) || (key === KEYCODES.CTRL && key === KEYCODES.Y)) {
            event.preventDefault();
        }

        this._key = key;
        this._start = this.selectionStart;
        this._end = this.selectionEnd;
    }

    /** @hidden */
    @HostListener('input')
    public onInputChanged(): void {
        /**
         * '!this._focused' is a fix for #8165
         * On page load IE triggers input events before focus events and
         * it does so for every single input on the page.
         * The mask needs to be prevented from doing anything while this is happening because
         * the end user will be unable to blur the input.
         * https://stackoverflow.com/questions/21406138/input-event-triggered-on-internet-explorer-when-placeholder-changed
         */
        if (isIE() && (this._stopPropagation || !this._focused)) {
            this._stopPropagation = false;
            return;
        }

        if (this._hasDropAction) {
            this._start = this.selectionStart;
        }
        if (this.inputValue.length < this._oldText.length && this._key === KEYCODES.INPUT_METHOD) {
            // software keyboard input delete
            this._key = KEYCODES.BACKSPACE;
        }

        let valueToParse = '';
        switch (this._key) {
            case KEYCODES.DELETE:
                this._end = this._start === this._end ? ++this._end : this._end;
                break;
            case KEYCODES.BACKSPACE:
                this._start = this.selectionStart;
                break;
            default:
                valueToParse = this.inputValue.substring(this._start, this.selectionEnd);
                break;
        }

        const replacedData = this.maskParser.replaceInMask(this._oldText, valueToParse, this.maskOptions, this._start, this._end);
        this.inputValue = replacedData.value;
        if (this._key === KEYCODES.BACKSPACE) {
            replacedData.end = this._start;
        }
        this.setSelectionRange(replacedData.end);

        const rawVal = this.maskParser.parseValueFromMask(this.inputValue, this.maskOptions);
        this._dataValue = this.includeLiterals ? this.inputValue : rawVal;
        this._onChangeCallback(this._dataValue);

        this.onValueChange.emit({ rawValue: rawVal, formattedValue: this.inputValue });

        this.afterInput();
    }

    /** @hidden */
    @HostListener('paste')
    public onPaste(): void {
        this._oldText = this.inputValue;
        this._start = this.selectionStart;
    }

    /** @hidden */
    @HostListener('focus')
    public onFocus(): void {
        const readonly = this.nativeElement.readOnly;
        if (readonly !== null && `${readonly}` !== 'false') {
            return;
        }
        this._focused = true;
        this.showMask(this._dataValue);
    }

    /** @hidden */
    @HostListener('blur', ['$event.target.value'])
    public onBlur(value: string): void {
        this._focused = false;
        this.showDisplayValue(value);
        this._onTouchedCallback();
    }

    /** @hidden */
    @HostListener('dragenter')
    public onDragEnter(): void {
        if (!this._focused) {
            this.showMask(this._dataValue);
        }
    }

    /** @hidden */
    @HostListener('dragleave')
    public onDragLeave(): void {
        if (!this._focused) {
            this.showDisplayValue(this.inputValue);
        }
    }

    /** @hidden */
    @HostListener('drop', ['$event'])
    public onDrop(event: DragEvent): void {
        this._hasDropAction = true;
        this._droppedData = event.dataTransfer.getData('text');
    }

    /** @hidden */
    public ngOnInit(): void {
        if (!this.nativeElement.placeholder) {
            this.renderer.setAttribute(this.nativeElement, 'placeholder', this.maskOptions.format);
        }
    }

    /**
     * TODO: Remove after date/time picker integration refactor
     *
     * @hidden
     */
    public ngAfterViewChecked(): void {
        this._oldText = this.inputValue;
    }

    /** @hidden */
    public writeValue(value: string): void {
        if (this.promptChar && this.promptChar.length > 1) {
            this.maskOptions.promptChar = this.promptChar.substring(0, 1);
        }

        this.inputValue = value ? this.maskParser.applyMask(value, this.maskOptions) : '';
        if (this.displayValuePipe) {
            this.inputValue = this.displayValuePipe.transform(this.inputValue);
        }

        this._dataValue = this.includeLiterals ? this.inputValue : value;

        this.onValueChange.emit({ rawValue: value, formattedValue: this.inputValue });
    }

    /** @hidden */
    public registerOnChange(fn: (_: any) => void): void {
        this._onChangeCallback = fn;
    }

    /** @hidden */
    public registerOnTouched(fn: () => void): void {
        this._onTouchedCallback = fn;
    }

    /** @hidden */
    protected showMask(value: string) {
        if (this.focusedValuePipe) {
            if (isIE()) {
                this._stopPropagation = true;
            }
            // TODO(D.P.): focusedValuePipe should be deprecated or force-checked to match mask format
            this.inputValue = this.focusedValuePipe.transform(value);
        } else {
            this.inputValue = this.maskParser.applyMask(this.inputValue, this.maskOptions);
        }

        this._oldText = this.inputValue;
    }

    /** @hidden */
    protected setSelectionRange(start: number, end: number = start): void {
        this.nativeElement.setSelectionRange(start, end);
    }

    /** @hidden */
    protected afterInput() {
        this._oldText = this.inputValue;
        this._hasDropAction = false;
        this._start = 0;
        this._end = 0;
        this._key = null;
    }

    private showDisplayValue(value: string) {
        if (this.displayValuePipe) {
            this.inputValue = this.displayValuePipe.transform(value);
        } else if (value === this.maskParser.applyMask(null, this.maskOptions)) {
            this.inputValue = '';
        }
    }
}

/**
 * The IgxMaskModule provides the {@link IgxMaskDirective} inside your application.
 */
export interface IMaskEventArgs extends IBaseEventArgs {
    rawValue: string;
    formattedValue: string;
}

/** @hidden */
@NgModule({
    declarations: [IgxMaskDirective],
    exports: [IgxMaskDirective],
    imports: [CommonModule]
})
export class IgxMaskModule { }
