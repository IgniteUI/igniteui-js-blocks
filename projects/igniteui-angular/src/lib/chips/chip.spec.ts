import { Component, ViewChild, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { IgxIconModule } from '../icon/public_api';
import { IgxChipsModule } from './chips.module';
import { IgxChipComponent } from './chip.component';
import { IgxChipsAreaComponent } from './chips-area.component';
import { IgxPrefixDirective } from './../directives/prefix/prefix.directive';
import { IgxLabelDirective } from './../directives/label/label.directive';
import { IgxSuffixDirective } from './../directives/suffix/suffix.directive';
import { DisplayDensity } from '../core/displayDensity';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../test-utils/configure-suite';
import { ControlsFunction } from '../test-utils/controls-functions.spec';

@Component({
    template: `
        <igx-chips-area #chipsArea>
            <igx-chip #chipElem *ngFor="let chip of chipList"
            [id]="chip.id" [draggable]="chip.draggable"
            [removable]="chip.removable" [selectable]="chip.selectable"
            [displayDensity]="chip.density" (remove)="chipRemoved($event)">
                <span #label [class]="'igx-chip__text'">{{chip.text}}</span>
                <igx-icon igxPrefix>drag_indicator</igx-icon>
            </igx-chip>
            <igx-chip #chipElem tabIndex="1" [id]="tabChipAttr">
                <span #label [class]="'igx-chip__text'">Tab Chip</span>
            </igx-chip>
            <igx-chip #chipElem tabIndex="2" [disabled]="true" [id]="tabChipDisabled">
                <span #label [class]="'igx-chip__text'">Tab Chip</span>
            </igx-chip>
            <igx-chip #chipElem [tabIndex]="3" [removable]="true" [id]="tabChipInput" >
                <span #label [class]="'igx-chip__text'">Tab Chip</span>
            </igx-chip>
            <igx-chip #chipElem tabIndex="4" [tabIndex]="1" [id]="tabChipBoth">
                <span #label [class]="'igx-chip__text'">Tab Chip</span>
            </igx-chip>
            <igx-chip #chipElem tabIndex="5" [tabIndex]="1" [disabled]="true" [id]="tabChipAll">
                <span #label [class]="'igx-chip__text'">Tab Chip</span>
            </igx-chip>
        </igx-chips-area>
    `
})
class TestChipComponent {

    @ViewChild('chipsArea', { read: IgxChipsAreaComponent, static: true })
    public chipsArea: IgxChipsAreaComponent;

    @ViewChildren('chipElem', { read: IgxChipComponent })
    public chips: QueryList<IgxChipComponent>;

    public chipList = [
        { id: 'Country', text: 'Country', removable: false, selectable: false, draggable: true },
        { id: 'City', text: 'City', removable: true, selectable: true, draggable: true, density: 'comfortable' },
        { id: 'Town', text: 'Town', removable: true, selectable: true, draggable: true, density: 'compact' },
        { id: 'FirstName', text: 'First Name', removable: true, selectable: true, draggable: true, density: 'cosy' }
    ];

    constructor(public cdr: ChangeDetectorRef) { }

    public chipRemoved(event) {
        this.chipList = this.chipList.filter((item) => item.id !== event.owner.id);
        this.cdr.detectChanges();
    }
}

@Component({
    template: `
        <igx-chips-area>
            <igx-chip *ngFor="let chip of chipList">
                <span igxLabel>label</span>
                <span igxSuffix>suf</span>
            </igx-chip>
        </igx-chips-area>
    `
})
class TestChipsLabelAndSuffixComponent {

    @ViewChild('chipsArea', { read: IgxChipsAreaComponent, static: true })
    public chipsArea: IgxChipsAreaComponent;

    @ViewChildren('chipElem', { read: IgxChipComponent })
    public chips: QueryList<IgxChipComponent>;

    public chipList = [
        { id: 'Country', text: 'Country', removable: false, selectable: false, draggable: true },
        { id: 'City', text: 'City', removable: true, selectable: true, draggable: true },
        { id: 'Town', text: 'Town', removable: true, selectable: true, draggable: true },
        { id: 'FirstName', text: 'First Name', removable: true, selectable: true, draggable: true },
    ];
}


describe('IgxChip', () => {
    const CHIP_TEXT_CLASS = '.igx-chip__text';
    const CHIP_CLASS = '.igx-chip';
    const CHIP_COMPACT_CLASS = '.igx-chip--compact';
    const CHIP_COSY_CLASS = '.igx-chip--cosy';
    const CHIP_ITEM_CLASS = '.igx-chip__item';
    const CHIP_GHOST_COMP_CLASS = 'igx-chip__ghost--compact';

    let fix;
    let chipArea;

    configureTestSuite();
    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestChipComponent,
                TestChipsLabelAndSuffixComponent,
                IgxLabelDirective
            ],
            imports: [FormsModule, IgxIconModule, IgxChipsModule]
        }).compileComponents();
    }));

    describe('Rendering Tests: ', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();
            chipArea = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
        });

        it('should render chip area and chips inside it', () => {
            expect(chipArea.length).toEqual(1);
            expect(chipArea[0].nativeElement.children.length).toEqual(9);
            expect(chipArea[0].nativeElement.children[0].tagName).toEqual('IGX-CHIP');
        });

        it('should render prefix element inside the chip before the content', () => {
            const chipElems = fix.debugElement.queryAll(By.directive(IgxChipComponent));

            // For this first chip there are 2 elements. The prefix and content span.
            expect(chipElems[0].nativeElement.children[0].children.length).toEqual(3);
            expect(chipElems[0].nativeElement.children[0].children[0].offsetWidth).toEqual(0);
            expect(chipElems[0].nativeElement.children[0].children[1].tagName).toEqual('IGX-ICON');
            expect(chipElems[0].nativeElement.children[0].children[1].hasAttribute('igxprefix')).toEqual(true);
        });

        it('should render remove button when enabled after the content inside the chip', () => {
            const chipElems = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            const chipRemoveButton = ControlsFunction.getChipRemoveButton(chipElems[1].nativeElement);

            // For this second chip there are 3 elements. The prefix, content span and the remove button icon .
            expect(chipElems[1].nativeElement.children[0].children.length).toEqual(4);
            expect(chipRemoveButton).toBeTruthy();
        });

        it('should set text in chips correctly', () => {
            const chipElements = chipArea[0].queryAll(By.directive(IgxChipComponent));
            const firstChipTextElement = chipElements[0].queryAllNodes(By.css(CHIP_TEXT_CLASS));
            const firstChipText = firstChipTextElement[0].nativeNode.innerHTML;

            expect(firstChipText).toContain('Country');

            const secondChipTextElement = chipElements[1].queryAllNodes(By.css(CHIP_TEXT_CLASS));
            const secondChipText = secondChipTextElement[0].nativeNode.innerHTML;

            expect(secondChipText).toContain('City');
        });

        it('should set chips prefix correctly', () => {
            const chipElements = chipArea[0].queryAll(By.directive(IgxChipComponent));
            const firstChipPrefix = chipElements[0].queryAll(By.directive(IgxPrefixDirective));
            const firstChipIconName = firstChipPrefix[0].nativeElement.textContent;

            expect(firstChipIconName).toContain('drag_indicator');
        });

        it('should make chip comfortable when density is not set or it is set to comfortable', () => {
            const components = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            const firstComponent = components[0];
            const secondComponent = components[1];

            expect(firstComponent.componentInstance.displayDensity).toEqual(DisplayDensity.comfortable);
            expect(secondComponent.componentInstance.displayDensity).toEqual(DisplayDensity.comfortable);

            // Assert default css class is applied
            const comfortableComponents = fix.debugElement.queryAll(By.css(CHIP_CLASS));

            expect(comfortableComponents.length).toEqual(7);
            expect(comfortableComponents[0].nativeElement).toBe(firstComponent.nativeElement);
            expect(comfortableComponents[1].nativeElement).toBe(secondComponent.nativeElement);
        });

        it('should make chip compact when density is set to compact', () => {
            const components = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            const thirdComponent = components[2];

            expect(thirdComponent.componentInstance.displayDensity).toEqual(DisplayDensity.compact);

            // Assert compact css class is added
            const compactComponents = fix.debugElement.queryAll(By.css(CHIP_COMPACT_CLASS));

            expect(compactComponents.length).toEqual(1);
            expect(compactComponents[0].nativeElement).toBe(thirdComponent.nativeElement);
        });

        it('should make chip cosy when density is set to cosy', () => {
            const components = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            const fourthComponent = components[3];

            expect(fourthComponent.componentInstance.displayDensity).toEqual(DisplayDensity.cosy);

            // Assert cosy css class is added
            const cosyComponents = fix.debugElement.queryAll(By.css(CHIP_COSY_CLASS));

            expect(cosyComponents.length).toEqual(1);
            expect(cosyComponents[0].nativeElement).toBe(fourthComponent.nativeElement);
        });

        it('should set correctly color of chip when color is set through code', () => {
            const chipColor = 'rgb(255, 0, 0)';

            const components = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            const firstComponent = components[0];
            const chipAreaElem = firstComponent.queryAll(By.css(CHIP_ITEM_CLASS))[0];

            firstComponent.componentInstance.color = chipColor;

            expect(chipAreaElem.nativeElement.style.backgroundColor).toEqual(chipColor);
            expect(firstComponent.componentInstance.color).toEqual(chipColor);
        });

        it('should apply correct tabIndex to the chip area only when tabIndex is set as property of the chip and chip is disabled', () => {
            const firstTabChip = fix.debugElement.queryAll(By.directive(IgxChipComponent))[4];
            expect(firstTabChip.nativeElement.getAttribute('tabindex')).toEqual('1');

            // Chip is disabled, but attribute tabindex has bigger priority.
            const secondTabChip = fix.debugElement.queryAll(By.directive(IgxChipComponent))[5];
            expect(secondTabChip.nativeElement.getAttribute('tabindex')).toEqual('2');
        });

        it('should apply correct tab indexes when tabIndex and removeTabIndex are set as inputs', () => {
            const thirdTabChip = fix.debugElement.queryAll(By.directive(IgxChipComponent))[6];
            const deleteBtn = ControlsFunction.getChipRemoveButton(thirdTabChip.componentInstance.chipArea.nativeElement);
            expect(thirdTabChip.nativeElement.getAttribute('tabindex')).toEqual('3');
            expect(deleteBtn.getAttribute('tabindex')).toEqual('3');

            // tabIndex attribute has higher priority than tabIndex.
            const fourthTabChip = fix.debugElement.queryAll(By.directive(IgxChipComponent))[7];
            expect(fourthTabChip.nativeElement.getAttribute('tabindex')).toEqual('1');

            // tabIndex attribute has higher priority than tabIndex input and chip being disabled.
            const fifthTabChip = fix.debugElement.queryAll(By.directive(IgxChipComponent))[8];
            expect(fifthTabChip.nativeElement.getAttribute('tabindex')).toEqual('1');
        });
    });

    describe('Interactions Tests: ', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(TestChipComponent);
            fix.detectChanges();
        });

        it('should not trigger remove event when delete button is pressed when not removable', () => {
            const firstChipComp = fix.componentInstance.chips.toArray()[0];

            spyOn(firstChipComp.remove, 'emit');
            UIInteractions.triggerKeyDownEvtUponElem('Delete', firstChipComp.chipArea.nativeElement, true);
            fix.detectChanges();

            expect(firstChipComp.remove.emit).not.toHaveBeenCalled();
        });

        it('should trigger remove event when delete button is pressed when removable', () => {
            const secondChipComp = fix.componentInstance.chips.toArray()[1];

            spyOn(secondChipComp.remove, 'emit');
            UIInteractions.triggerKeyDownEvtUponElem('Delete', secondChipComp.chipArea.nativeElement, true);
            fix.detectChanges();

            expect(secondChipComp.remove.emit).toHaveBeenCalled();
        });

        it('should delete chip when space button is pressed on delete button', () => {
            HelperTestFunctions.verifyChipsCount(fix, 9);
            const chipElems = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            const deleteButtonElement = ControlsFunction.getChipRemoveButton(chipElems[1].nativeElement);
            // Removes chip with id City, because country chip is unremovable
            UIInteractions.triggerKeyDownEvtUponElem(' ', deleteButtonElement, true);
            fix.detectChanges();

            HelperTestFunctions.verifyChipsCount(fix, 8);

            const chipComponentsIds = fix.componentInstance.chipList.map(c => c.id);
            expect(chipComponentsIds.length).toEqual(3);
            expect(chipComponentsIds).not.toContain('City');
        });

        it('should delete chip when enter button is pressed on delete button', () => {
            HelperTestFunctions.verifyChipsCount(fix, 9);

            const chipElems = fix.debugElement.queryAll(By.directive(IgxChipComponent));
            const deleteButtonElement = ControlsFunction.getChipRemoveButton(chipElems[1].nativeElement);
            // Removes chip with id City, because country chip is unremovable
            UIInteractions.triggerKeyDownEvtUponElem('Enter', deleteButtonElement, true);
            fix.detectChanges();

            HelperTestFunctions.verifyChipsCount(fix, 8);

            const chipComponentsIds = fix.componentInstance.chipList.map(c => c.id);
            expect(chipComponentsIds.length).toEqual(3);
            expect(chipComponentsIds).not.toContain('City');
        });

        it('should affect the ghostElement density when chip has it set to compact', () => {
            const thirdChip = fix.componentInstance.chips.toArray()[2];
            const thirdChipElem = thirdChip.chipArea.nativeElement;

            const startingTop = thirdChipElem.getBoundingClientRect().top;
            const startingLeft = thirdChipElem.getBoundingClientRect().left;
            const startingBottom = thirdChipElem.getBoundingClientRect().bottom;
            const startingRight = thirdChipElem.getBoundingClientRect().right;

            const startingX = (startingLeft + startingRight) / 2;
            const startingY = (startingTop + startingBottom) / 2;

            UIInteractions.simulatePointerEvent('pointerdown', thirdChipElem, startingX, startingY);
            fix.detectChanges();

            UIInteractions.simulatePointerEvent('pointermove', thirdChipElem, startingX + 10, startingY + 10);
            fix.detectChanges();

            expect(thirdChip.dragDirective.ghostElement.classList.contains(CHIP_GHOST_COMP_CLASS)).toBeTruthy();
        });

        it('should fire selectedChanging event when selectable is true', () => {
            const secondChipComp = fix.componentInstance.chips.toArray()[1];
            spyOn(secondChipComp.selectedChanging, 'emit');
            spyOn(secondChipComp.selectedChanged, 'emit');

            UIInteractions.triggerKeyDownEvtUponElem(' ', secondChipComp.chipArea.nativeElement, true);
            fix.detectChanges();
            expect(secondChipComp.selectedChanging.emit).toHaveBeenCalled();
            expect(secondChipComp.selectedChanged.emit).not.toHaveBeenCalled();
            expect(secondChipComp.selectedChanging.emit).not.toHaveBeenCalledWith({
                originalEvent: null,
                owner: secondChipComp,
                cancel: false,
                selected: true
            });

            expect(secondChipComp.selectedChanging.emit).toHaveBeenCalledWith({
                originalEvent: jasmine.anything(),
                owner: secondChipComp,
                cancel: false,
                selected: true
            });
        });

        it('should fire selectedChanged event when selectable is true', (async () => {
            pending('This should be tested in the e2e test');
            const secondChipComp: IgxChipComponent = fix.componentInstance.chips.toArray()[1];

            spyOn(secondChipComp.selectedChanging, 'emit');
            spyOn(secondChipComp.selectedChanged, 'emit');
            secondChipComp.chipArea.nativeElement.focus();

            UIInteractions.triggerKeyDownEvtUponElem(' ', secondChipComp.chipArea.nativeElement, true);
            fix.detectChanges();
            expect(secondChipComp.selectedChanging.emit).toHaveBeenCalled();
            expect(secondChipComp.selectedChanged.emit).not.toHaveBeenCalled();
            expect(secondChipComp.selectedChanging.emit).not.toHaveBeenCalledWith({
                originalEvent: null,
                owner: secondChipComp,
                cancel: false,
                selected: true
            });

            await wait(400);
            expect(secondChipComp.selectedChanged.emit).toHaveBeenCalledTimes(1);
            expect(secondChipComp.selectedChanged.emit).not.toHaveBeenCalledWith({
                originalEvent: null,
                owner: secondChipComp
            });
        }));

        it('should not fire selectedChanging event when selectable is false', () => {
            const firstChipComp: IgxChipComponent = fix.componentInstance.chips.toArray()[0];

            spyOn(firstChipComp.selectedChanging, 'emit');
            spyOn(firstChipComp.selectedChanged, 'emit');
            firstChipComp.elementRef.nativeElement.focus();

            UIInteractions.triggerKeyDownEvtUponElem(' ', firstChipComp.chipArea.nativeElement, true);
            fix.detectChanges();
            expect(firstChipComp.selectedChanging.emit).toHaveBeenCalledTimes(0);
            expect(firstChipComp.selectedChanged.emit).toHaveBeenCalledTimes(0);
        });

        it('should not fire selectedChanging event when the remove button is clicked', () => {
            const secondChipComp: IgxChipComponent = fix.componentInstance.chips.toArray()[1];

            spyOn(secondChipComp.selectedChanging, 'emit');
            spyOn(secondChipComp.selectedChanged, 'emit');

            const chipRemoveButton = ControlsFunction.getChipRemoveButton(secondChipComp.chipArea.nativeElement);

            const removeBtnTop = chipRemoveButton.getBoundingClientRect().top;
            const removeBtnLeft = chipRemoveButton.getBoundingClientRect().left;

            UIInteractions.simulatePointerEvent('pointerdown', chipRemoveButton, removeBtnLeft, removeBtnTop);
            fix.detectChanges();
            UIInteractions.simulatePointerEvent('pointerup', chipRemoveButton, removeBtnLeft, removeBtnTop);
            fix.detectChanges();

            expect(secondChipComp.selectedChanging.emit).not.toHaveBeenCalled();
            expect(secondChipComp.selectedChanged.emit).not.toHaveBeenCalled();
        });
    });

    describe('Chips Label Tests: ', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(TestChipsLabelAndSuffixComponent);
            fix.detectChanges();
            chipArea = fix.debugElement.queryAll(By.directive(IgxChipsAreaComponent));
        });

        it('should set chips label correctly', () => {
            const chipElements = chipArea[0].queryAll(By.directive(IgxChipComponent));
            const firstChipLabel = chipElements[0].queryAll(By.directive(IgxLabelDirective));
            const firstChipLabelText = firstChipLabel[0].nativeElement.innerHTML;

            expect(firstChipLabelText).toEqual('label');
        });

        it('should set chips suffix correctly', () => {
            const chipElements = chipArea[0].queryAll(By.directive(IgxChipComponent));
            const firstChipSuffix = chipElements[0].queryAll(By.directive(IgxSuffixDirective));
            const firstChipSuffixText = firstChipSuffix[0].nativeElement.innerHTML;

            expect(firstChipSuffixText).toEqual('suf');
        });
    });
});

class HelperTestFunctions {
    public static verifyChipsCount(fix, count) {
        const chipComponents = fix.debugElement.queryAll(By.directive(IgxChipComponent));
        expect(chipComponents.length).toEqual(count);
    }
}
