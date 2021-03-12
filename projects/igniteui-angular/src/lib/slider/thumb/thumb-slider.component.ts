import {
    Component,
    Input,
    HostListener,
    ElementRef,
    HostBinding,
    Output,
    EventEmitter,
    OnInit,
    OnDestroy,
    TemplateRef
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { SliderHandle } from '../slider.common';
import { Subject } from 'rxjs';
import { IgxDirectionality } from '../../services/direction/directionality';

/**
 * @hidden
 */
@Component({
    selector: 'igx-thumb',
    templateUrl: 'thumb-slider.component.html',
})
export class IgxSliderThumbComponent implements OnInit, OnDestroy {
    @Input()
    public value: number;

    @Input()
    public continuous: boolean;

    @Input()
    public thumbLabelVisibilityDuration;

    @Input()
    public disabled: boolean;

    @Input()
    public onPan: Subject<number>;

    @Input()
    public stepDistance: number;

    @Input()
    public step: number;

    @Input()
    public templateRef: TemplateRef<any>;

    @Input()
    public context: any;

    @Input()
    public type: SliderHandle;

    @Input()
    public deactiveState: boolean;

    @Output()
    public onThumbValueChange = new EventEmitter<number>();

    @Output()
    public onChange = new EventEmitter<any>();

    @Output()
    public onHoverChange = new EventEmitter<boolean>();

    @HostBinding('attr.tabindex')
    public tabindex = 0;

    @HostBinding('attr.z-index')
    public zIndex = 0;

    @HostBinding('class.igx-slider-thumb-from')
    public get thumbFromClass() {
        return this.type === SliderHandle.FROM;
    }

    @HostBinding('class.igx-slider-thumb-to')
    public get thumbToClass() {
        return this.type === SliderHandle.TO;
    }

    @HostBinding('class.igx-slider-thumb-from--active')
    public get thumbFromActiveClass() {
        return this.type === SliderHandle.FROM && this._isActive;
    }

    @HostBinding('class.igx-slider-thumb-to--active')
    public get thumbToActiveClass() {
        return this.type === SliderHandle.TO && this._isActive;
    }

    @HostBinding('class.igx-slider-thumb-from--disabled')
    public get thumbFromDisabledClass() {
        return this.type === SliderHandle.FROM && this.disabled;
    }

    @HostBinding('class.igx-slider-thumb-to--disabled')
    public get thumbToDisabledClass() {
        return this.type === SliderHandle.TO && this.disabled;
    }

    @HostBinding('class.igx-slider-thumb-from--pressed')
    public get thumbFromPressedClass() {
        return this.type === SliderHandle.FROM && this.isActive && this._isPressed;
    }

    @HostBinding('class.igx-slider-thumb-to--pressed')
    public get thumbToPressedClass() {
        return this.type === SliderHandle.TO && this.isActive && this._isPressed;
    }

    public get getDotClass() {
        return {
            'igx-slider-thumb-from__dot': this.type === SliderHandle.FROM,
            'igx-slider-thumb-to__dot': this.type === SliderHandle.TO
        };
    }

    public isActive = false;

    public get nativeElement() {
        return this._elementRef.nativeElement;
    }

    public get destroy(): Subject<boolean> {
        return this._destroy$;
    }

    private _isActive = false;
    private _isPressed = false;
    private _destroy$ = new Subject<boolean>();

    private get thumbPositionX() {
        const thumbBounderies = this.nativeElement.getBoundingClientRect();
        const thumbCenter = (thumbBounderies.right - thumbBounderies.left) / 2;
        return thumbBounderies.left + thumbCenter;
    }

    constructor(private _elementRef: ElementRef, private _dir: IgxDirectionality) { }

    @HostListener('pointerenter')
    public onPinterEnter() {
        this.onHoverChange.emit(true);
    }

    @HostListener('pointerleave')
    public onPointerLeave() {
        this.onHoverChange.emit(false);
    }

    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent) {
        if (this.disabled) {
            return;
        }

        let increment = 0;
        if (event.key.endsWith('Left')) {
            increment = this.step * - 1;
        } else if (event.key.endsWith('Right')) {
            increment = this.step;
        } else {
            return;
        }

        this.onChange.emit();
        this.onThumbValueChange.emit(increment);
    }

    @HostListener('blur')
    public onBlur() {
        this.isActive = false;
        this.zIndex = 0;
    }

    @HostListener('focus')
    public onFocusListener() {
        this.isActive = true;
        this.zIndex = 1;
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        this.onPan
            .pipe(takeUntil(this._destroy$))
            .subscribe(mouseX =>
                this.updateThumbValue(mouseX)
            );
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this._destroy$.next(true);
        this._destroy$.complete();
    }

    /**
     * Show thumb label and ripple.
     */
    public showThumbIndicators() {
        this.toggleThumbIndicators(true);
    }

    /**
     * Hide thumb label and ripple.
     */
    public hideThumbIndicators() {
        this.toggleThumbIndicators(false);
    }

    private updateThumbValue(mouseX: number) {
        const updateValue = this.calculateTrackUpdate(mouseX);
        if (this.isActive && updateValue !== 0) {
            this.onThumbValueChange.emit(updateValue);
        }
    }

    private calculateTrackUpdate(mouseX: number): number {
        const scaleX = this._dir.rtl ? this.thumbPositionX - mouseX : mouseX - this.thumbPositionX;
        const stepDistanceCenter = this.stepDistance / 2;

        // If the thumb scale range (slider update) is less thàn a half step,
        // the position stays the same.
        const scaleXPositive = Math.abs(scaleX);
        if (scaleXPositive < stepDistanceCenter) {
            return 0;
        }

        return this.stepToProceed(scaleX, this.stepDistance);
    }

    private stepToProceed(scaleX, stepDist) {
        return Math.round(scaleX / stepDist) * this.step;
    }

    private toggleThumbIndicators(visible: boolean) {
        this._isPressed = visible;

        if (this.continuous || this.deactiveState) {
            this._isActive = false;
        } else {
            this._isActive = visible;
        }

    }
}
